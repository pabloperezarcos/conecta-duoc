import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { PostService } from '../../../core/services/post.service';
import { CommentService } from '../../../core/services/comment.service';
import { UserService } from '../../../core/services/user.service';
import { ReportService } from '../../../core/services/report.service';
import { Post, Comment } from '../../../models/post';
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
  private fb = inject(FormBuilder);

  post: Post | undefined;
  comments: Comment[] = [];
  comentarioForm!: FormGroup;
  loading = true;
  postingComment = false;

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
    if (this.post) {
      this.reportService.reportPost(this.post.idPost, 'Contenido inapropiado').subscribe(() => {
        alert('Publicación reportada');
      });
    }
  }

  reportarComentario(com: Comment): void {
    this.reportService.reportComment(com.idComment, 'Comentario inapropiado').subscribe(() => {
      alert('Comentario reportado');
    });
  }

  volver(): void {
    const slug = this.route.snapshot.paramMap.get('slug') || 'dashboard';
    this.router.navigate(['/categoria', slug]);
  }
}
