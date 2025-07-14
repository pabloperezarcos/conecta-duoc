/* ANGULAR IMPORTS */
import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

/* MODELS */
import { Post, Comment } from '../../../models/post';

/* SERVICES */
import { PostService } from '../../../core/services/post.service';
import { UserService } from '../../../core/services/user.service';
import { ScoreService } from '../../../core/services/score.service';
import { ReportService } from '../../../core/services/report.service';
import { CommentService } from '../../../core/services/comment.service';

/* BreadCrumb y BANNER */
import { BreadcrumbComponent } from '../../breadcrumb/breadcrumb.component';
import { NotificacionBannerComponent } from '../../notificacion-banner/notificacion-banner.component';
import { catchError, of } from 'rxjs';

/**
 * Componente que muestra el detalle de una publicación individual.
 * Permite ver comentarios, agregar nuevos, calificar la publicación y reportar contenido inapropiado.
 */
@Component({
  selector: 'app-detalle',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, BreadcrumbComponent, NotificacionBannerComponent],
  templateUrl: './detalle.component.html',
  styleUrls: ['./detalle.component.scss']
})
export class DetalleComponent implements OnInit {
  /** Servicio que permite acceder a los parámetros de la ruta actual */
  private route = inject(ActivatedRoute);

  /** Servicio que permite la navegación entre rutas del sistema */
  private router = inject(Router);

  /** Servicio para gestionar publicaciones (crear, obtener, eliminar, etc.) */
  public postService = inject(PostService);

  /** Servicio para manejar comentarios asociados a publicaciones */
  public commentService = inject(CommentService);

  /** Servicio de usuario para acceder a datos del usuario actual y almacenados */
  public userService = inject(UserService);

  /** Servicio para reportar publicaciones o comentarios por parte del usuario */
  public reportService = inject(ReportService);

  /** Servicio que gestiona calificaciones de publicaciones (scores) */
  public scoreService = inject(ScoreService);

  /** Servicio para construir formularios reactivos */
  private fb = inject(FormBuilder);

  /** Publicación actualmente mostrada */
  post: Post | undefined;

  /** Lista de comentarios asociados a la publicación */
  comments: Comment[] = [];

  /** Mapa que relaciona IDs de comentarios con nombres de usuarios */
  nombresUsuariosComentario: Record<number, string> = {};

  /** Formulario reactivo para agregar un comentario */
  comentarioForm!: FormGroup;

  /** Estado de carga inicial */
  loading = true;

  /** Flag para evitar múltiples envíos del mismo comentario */
  postingComment = false;

  /** Promedio de calificación del post */
  promedio = 0;

  /** Calificación dada por el usuario actual */
  miScore: number | null = null;

  /** Valores de estrellas disponibles para calificar */
  estrellas = [1, 2, 3, 4, 5];

  /** Nombre del autor del post */
  nombreAutor = 'Autor desconocido';

  calificacionUsuariosComentario: Record<number, number> = {};

  idUser = this.userService.getIdUser();

  /**
   * Inicializa el componente, obtiene la publicación, su autor,
   * comentarios y calificaciones, y actualiza vistas.
   */
  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) {
      this.router.navigate(['/dashboard']);
      return;
    }

    this.comentarioForm = this.fb.group({
      content: ['', [Validators.required, Validators.maxLength(300)]]
    });

    this.postService.sumarVisualizacion(id).subscribe();

    this.postService.getById(id).subscribe({
      next: (post) => {
        this.post = post;
        document.title = `ConectaDuoc | ${post.title}`;

        this.scoreService.getAverageScore(post.idPost).subscribe(avg => {
          this.promedio = avg;
        });
        const idUser = this.userService.getIdUser();
        if (idUser) {
          this.scoreService.getUserScore(post.idPost, idUser).subscribe(score => {
            this.miScore = score ? score.score : null;
          });
        }

        this.userService.getUserById(post.idUser).subscribe({
          next: (user) => {
            this.nombreAutor = user.name;
          },
          error: () => {
            this.nombreAutor = 'Autor desconocido';
          }
        });

        this.commentService.getByPostId(post.idPost).subscribe(comments => {
          this.comments = comments;
          comments.forEach(com => {
            this.userService.getUserById(com.idUser).pipe(
              catchError(() => of({ name: 'Autor desconocido' }))
            ).subscribe(user => {
              this.nombresUsuariosComentario[com.idComment] = user.name;
            });
          });
          comments.forEach(com => {
            this.scoreService.getUserScore(com.idPost, com.idUser).subscribe(score => {
              this.calificacionUsuariosComentario[com.idComment] = score ? score.score : 0;
            });
          });
          this.loading = false;
        });
      },
      error: () => {
        this.router.navigate(['/dashboard']);
      }
    });

  }

  /**
   * Envía un nuevo comentario si el formulario es válido.
   */
  comentar(): void {
    if (!this.post || this.comentarioForm.invalid || this.postingComment) return;

    const nuevoComentario: Omit<Comment, 'idComment'> = {
      idPost: this.post.idPost,
      idUser: this.userService.getIdUser()!,
      content: this.comentarioForm.value.content,
      createdDate: new Date().toISOString()
    };

    this.postingComment = true;
    this.commentService.create(nuevoComentario).subscribe({
      next: (comentario) => {
        this.comments.push(comentario);
        this.comentarioForm.reset();
        this.postingComment = false;
      },
      error: () => {
        this.postingComment = false;
      }
    });
  }

  /**
   * Reporta una publicación con un motivo opcional.
   */
  reportarPublicacion(): void {
    if (!this.post) return;
    const reason = prompt('Motivo del reporte', 'Contenido inapropiado');
    if (!reason) return;
    this.reportService.reportPost(this.post.idPost, reason).subscribe(() => {
      alert('Publicación reportada');
    });
  }

  /**
   * Reporta un comentario con un motivo opcional.
   * @param com Comentario a reportar.
   */
  reportarComentario(com: Comment): void {
    const reason = prompt('Motivo del reporte', 'Comentario inapropiado');
    if (!reason) return;
    this.reportService.reportComment(com.idComment, reason).subscribe(() => {
      alert('Comentario reportado');
    });
  }

  /**
   * Elimina un comentario si el usuario es el autor.
   * @param com Comentario a eliminar.
   */
  eliminarComentario(com: Comment): void {
    this.commentService.delete(com.idComment).subscribe(() => {
      this.comments = this.comments.filter(c => c.idComment !== com.idComment);
      delete this.nombresUsuariosComentario[com.idComment];
      delete this.calificacionUsuariosComentario[com.idComment];
    });
  }

  /**
   * Regresa a la categoría desde la que se abrió esta vista.
   */
  volver(): void {
    const slug = this.route.snapshot.paramMap.get('slug') || 'dashboard';
    this.router.navigate(['/categoria', slug]);
  }

  /**
   * Permite al usuario calificar el post con una puntuación del 1 al 5.
   * @param valor Puntuación seleccionada.
   */
  calificar(valor: number): void {
    if (!this.post) return;
    const idUser = this.userService.getIdUser();
    if (!idUser) return;

    this.scoreService.setScore({ idPost: this.post.idPost, idUser, score: valor }).subscribe(() => {
      this.miScore = valor;
      this.scoreService.getAverageScore(this.post!.idPost).subscribe(avg => {
        this.promedio = avg;
      });
    });
  }

  /**
   * Agregar un comentario al post.
  */
  agregarComentario(): void {
    if (this.comentarioForm.invalid || this.postingComment) return;
    this.comentar();
  }

}
