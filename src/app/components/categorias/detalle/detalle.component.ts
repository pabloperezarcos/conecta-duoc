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

/* BreadCrumb */
import { BreadcrumbComponent } from '../../breadcrumb/breadcrumb.component';

@Component({
  selector: 'app-detalle',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, BreadcrumbComponent],
  templateUrl: './detalle.component.html',
  styleUrls: ['./detalle.component.scss']
})
export class DetalleComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private postService = inject(PostService);
  private commentService = inject(CommentService);
  private userService = inject(UserService);
  private reportService = inject(ReportService);
  private scoreService = inject(ScoreService);
  private fb = inject(FormBuilder);

  post: Post | undefined;
  comments: Comment[] = [];
  comentarioForm!: FormGroup;
  loading = true;
  postingComment = false;
  promedio = 0;
  miScore: number | null = null;
  estrellas = [1, 2, 3, 4, 5];
  nombreAutor: string = 'Autor desconocido';

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
          this.loading = false;
        });
      },
      error: () => {
        this.router.navigate(['/dashboard']);
      }
    });

  }

  comentar(): void {
    if (!this.post || this.comentarioForm.invalid || this.postingComment) return;

    const nuevoComentario: Omit<Comment, 'idComment' | 'date'> = {
      idPost: this.post.idPost,
      idUser: this.userService.getAzureUser()?.email || 'anónimo',
      content: this.comentarioForm.value.content
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

  reportarPublicacion(): void {
    if (!this.post) return;
    const reason = prompt('Motivo del reporte', 'Contenido inapropiado');
    if (!reason) return;
    this.reportService.reportPost(this.post.idPost, reason).subscribe(() => {
      alert('Publicación reportada');
    });
  }

  reportarComentario(com: Comment): void {
    const reason = prompt('Motivo del reporte', 'Comentario inapropiado');
    if (!reason) return;
    this.reportService.reportComment(com.idComment, reason).subscribe(() => {
      alert('Comentario reportado');
    });
  }

  volver(): void {
    const slug = this.route.snapshot.paramMap.get('slug') || 'dashboard';
    this.router.navigate(['/categoria', slug]);
  }

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
}
