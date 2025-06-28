import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { BreadcrumbComponent } from '../../../breadcrumb/breadcrumb.component';
import { PostService } from '../../../../core/services/post.service';
import { UserService } from '../../../../core/services/user.service';
import { CommentService } from '../../../../core/services/comment.service';
import { Post, Comment } from '../../../../models/post';
import { ReportService } from '../../../../core/services/report.service';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-detalle-ayudantia',
  standalone: true,
  imports: [CommonModule, RouterModule, BreadcrumbComponent, ReactiveFormsModule],
  templateUrl: './detalle-ayudantia.component.html',
  styleUrls: ['./detalle-ayudantia.component.scss']
})
export class DetalleAyudantiaComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private postService = inject(PostService);
  private commentService = inject(CommentService);
  private userService = inject(UserService);
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private reportService = inject(ReportService);

  post: Post | undefined;
  comments: Comment[] = [];
  comentarioForm!: FormGroup;
  loading = true;
  postingComment = false;

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) {
      this.router.navigate(['/categoria/ayudantias']);
      return;
    }

    // Inicializa el formulario aquí, no dentro del subscribe
    this.comentarioForm = this.fb.group({
      content: ['', [Validators.required, Validators.maxLength(300)]]
    });

    // Sumar visualización al cargar detalle
    this.postService.sumarVisualizacion(id).subscribe({
      next: () => {
        // Después de sumar visualización, pide el post actualizado
        this.postService.getById(id).subscribe({
          next: (post) => {
            this.post = post;
            document.title = `ConectaDuoc | ${post.title}`;

            // Obtiene comentarios asociados
            this.commentService.getByPostId(post.idPost).subscribe(comments => {
              this.comments = comments;
              this.loading = false;
            });
          },
          error: () => {
            this.router.navigate(['/categoria/ayudantias']);
          }
        });
      },
      error: () => {
        // Maneja error si quieres
        this.loading = false;
      }
    });
  }

  comentar(): void {
    if (!this.post || this.comentarioForm.invalid || this.postingComment) return;

    const newComment: Omit<Comment, 'idComment' | 'date'> = {
      idPost: this.post.idPost,
      idUser: this.userService.getAzureUser()?.email || 'anónimo',
      content: this.comentarioForm.value.content
    };

    this.postingComment = true;
    this.commentService.create(newComment).subscribe({
      next: (comment) => {
        this.comments.push(comment);
        this.comentarioForm.reset();
        this.postingComment = false;
      },
      error: () => {
        // Maneja error visual si quieres
        this.postingComment = false;
      }
    });
  }

  reportarPublicacion(): void {
    if (this.post) {
      this.reportService.reportPost(this.post.idPost, 'Contenido inapropiado').subscribe(() => {
        // Notificación opcional
      });
    }
  }

  reportarComentario(comentario: Comment): void {
    this.reportService.reportComment(comentario.idComment, 'Comentario inapropiado').subscribe(() => {
      // Notificación opcional
    });
  }

  volver(): void {
    this.router.navigate(['/categoria/ayudantias']);
  }
}
