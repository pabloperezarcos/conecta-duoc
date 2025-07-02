/* Angular imports */
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';

/* BreadCrumb */
import { BreadcrumbComponent } from '../breadcrumb/breadcrumb.component';

/* Services */
import { UserService } from '../../core/services/user.service';
import { PostService } from '../../core/services/post.service';
import { CommentService } from '../../core/services/comment.service';
import { PostCategoryService } from '../../core/services/post-category.service';

/* Models */
import { User } from '../../models/user';
import { Post } from '../../models/post';
import { PostCategory } from '../../models/postCategory';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule, BreadcrumbComponent, RouterModule, FormsModule],
  templateUrl: './perfil.component.html',
  styleUrls: ['./perfil.component.scss']
})
export class PerfilComponent implements OnInit {
  private userService = inject(UserService);
  private postService = inject(PostService);
  private router = inject(Router);
  private commentService = inject(CommentService);
  private postCategoryService = inject(PostCategoryService);

  user: User | null = null;
  posts: Post[] = [];
  categories: PostCategory[] = [];
  sede = '';
  sedes: string[] = [
    'Modalidad online',
    'Campus Virtual',
    'Sede Alameda',
    'Sede Padre Alonso de Ovalle',
    'Sede Antonio Varas',
    'Sede Educación Continua',
    'Sede Maipú',
    'Sede Melipilla',
    'Sede Plaza Norte',
    'Sede Plaza Oeste',
    'Sede Plaza Vespucio',
    'Sede Puente Alto',
    'Sede San Bernardo',
    'Sede San Carlos de Apoquindo',
    'Sede San Joaquín',
    'Sede Valparaíso',
    'Sede Viña del Mar',
    'Campus Arauco',
    'Campus Nacimiento',
    'Sede San Andrés de Concepción',
    'Campus Villarrica',
    'Sede Puerto Montt'
  ];

  totalPosts = 0;
  totalComments = 0;
  filtroPost = '';
  postsPorPagina = 8;
  paginaActual = 1;

  ngOnInit(): void {
    const email = this.userService.getAzureUser()?.email || this.userService.getName();
    if (!email) {
      this.router.navigate(['/']);
      return;
    }

    this.postCategoryService.getAll().subscribe(cats => (this.categories = cats));

    this.userService.getUser(email).subscribe(user => {
      this.user = user;
      this.sede = user.center;
      if (user.idUser !== undefined) {
        this.cargarPublicaciones(user.idUser);
      }
    });
  }

  cargarPublicaciones(idUser: number): void {
    this.postService.getAll().subscribe(posts => {
      this.posts = posts.filter(p => p.idUser === idUser);
      this.totalPosts = this.posts.length;
      this.paginaActual = 1;

      const commentRequests = this.posts.map(p => this.commentService.getByPostId(p.idPost));
      if (commentRequests.length) {
        forkJoin(commentRequests).subscribe(all => {
          this.totalComments = all.reduce((acc, arr) => acc + arr.length, 0);
        });
      } else {
        this.totalComments = 0;
      }
    });
  }

  getUserInitial(): string {
    return this.user?.name ? this.user.name.charAt(0).toUpperCase() : '?';
  }

  guardarSede(): void {
    if (this.user) {
      const updatedUser = { ...this.user, center: this.sede };
      this.userService.registerUser(updatedUser).subscribe(() => {
      });
    }
  }

  editar(post: Post): void {
    this.router.navigate(['/dashboard/ayudantias', post.idPost], { state: { editar: post } });
  }


  get postsFiltrados(): Post[] {
    if (!this.filtroPost.trim()) return this.posts;
    const texto = this.filtroPost.toLowerCase();
    return this.posts.filter(p =>
      p.title.toLowerCase().includes(texto) ||
      p.content.toLowerCase().includes(texto)
    );
  }

  get totalPaginas(): number {
    return Math.ceil(this.postsFiltrados.length / this.postsPorPagina) || 1;
  }

  get paginas(): number[] {
    return Array.from({ length: this.totalPaginas }, (_, i) => i + 1);
  }

  get postsPaginados(): Post[] {
    const inicio = (this.paginaActual - 1) * this.postsPorPagina;
    return this.postsFiltrados.slice(inicio, inicio + this.postsPorPagina);
  }

  cambiarPagina(pagina: number): void {
    if (pagina < 1 || pagina > this.totalPaginas) return;
    this.paginaActual = pagina;
  }
}
