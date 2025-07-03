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
import { ScoreService } from '../../core/services/score.service';

/* Models */
import { User } from '../../models/user';
import { Post } from '../../models/post';
import { PostCategory } from '../../models/postCategory';

/**
 * Componente que muestra el perfil del usuario autenticado.
 * Permite visualizar y filtrar sus publicaciones, editar su sede,
 * y muestra estadísticas personales como total de comentarios, publicaciones
 * y promedio de calificaciones recibidas.
 */
@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule, BreadcrumbComponent, RouterModule, FormsModule],
  templateUrl: './perfil.component.html',
  styleUrls: ['./perfil.component.scss']
})
export class PerfilComponent implements OnInit {
  /** Servicio que gestiona la información y estado del usuario */
  private userService = inject(UserService);

  /** Servicio encargado de operaciones sobre publicaciones */
  private postService = inject(PostService);

  /** Servicio de navegación entre rutas */
  private router = inject(Router);

  /** Servicio para gestionar comentarios de las publicaciones */
  private commentService = inject(CommentService);

  /** Servicio para obtener y administrar categorías de publicaciones */
  private postCategoryService = inject(PostCategoryService);

  /** Servicio que permite obtener y enviar calificaciones (scores) de publicaciones */
  private scoreService = inject(ScoreService);

  /** Información del usuario autenticado */
  user: User | null = null;

  /** Publicaciones realizadas por el usuario */
  posts: Post[] = [];

  /** Categorías disponibles */
  categories: PostCategory[] = [];

  /** Sede seleccionada actualmente */
  sede = '';

  /** Lista de sedes posibles (Duoc UC) */
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

  /** Total de publicaciones del usuario */
  totalPosts = 0;

  /** Total de comentarios recibidos en sus publicaciones */
  totalComments = 0;

  /** Promedio de puntuaciones recibidas en sus publicaciones */
  promedioPonderado = 0;

  /** Texto para filtrar publicaciones */
  filtroPost = '';

  /** Cantidad de publicaciones por página */
  postsPorPagina = 8;

  /** Página actual de visualización */
  paginaActual = 1;

  /**
   * Inicializa el perfil: obtiene los datos del usuario,
   * sus publicaciones, comentarios y puntajes asociados.
   */
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

  /**
   * Carga todas las publicaciones del usuario y calcula
   * estadísticas relacionadas a comentarios y puntajes.
   * @param idUser ID del usuario.
   */
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


      const scoreRequests = this.posts.map(p => this.scoreService.getAverageScore(p.idPost));
      if (scoreRequests.length) {
        forkJoin(scoreRequests).subscribe(all => {
          const total = all.reduce((acc, val) => acc + val, 0);
          this.promedioPonderado = total / all.length;
        });
      } else {
        this.promedioPonderado = 0;
      }
    });
  }

  /**
   * Devuelve la inicial del nombre del usuario.
   * @returns Letra inicial o "?" si no disponible.
   */
  getUserInitial(): string {
    return this.user?.name ? this.user.name.charAt(0).toUpperCase() : '?';
  }

  /**
  * Guarda el cambio de sede realizado por el usuario.
  */
  guardarSede(): void {
    if (this.user) {
      const updatedUser = { ...this.user, center: this.sede };
      this.userService.registerUser(updatedUser).subscribe(() => {
      });
    }
  }

  /**
   * Redirige al usuario al formulario de edición de una publicación.
   * @param post Publicación a editar.
   */
  editar(post: Post): void {
    this.router.navigate(['/dashboard/ayudantias', post.idPost], { state: { editar: post } });
  }

  /**
   * Devuelve las publicaciones filtradas según el texto ingresado.
   */
  get postsFiltrados(): Post[] {
    if (!this.filtroPost.trim()) return this.posts;
    const texto = this.filtroPost.toLowerCase();
    return this.posts.filter(p =>
      p.title.toLowerCase().includes(texto) ||
      p.content.toLowerCase().includes(texto)
    );
  }

  /**
   * Calcula el total de páginas según los resultados filtrados.
   */
  get totalPaginas(): number {
    return Math.ceil(this.postsFiltrados.length / this.postsPorPagina) || 1;
  }

  /**
   * Devuelve un arreglo con los números de página disponibles.
   */
  get paginas(): number[] {
    return Array.from({ length: this.totalPaginas }, (_, i) => i + 1);
  }

  /**
   * Devuelve las publicaciones correspondientes a la página actual.
   */
  get postsPaginados(): Post[] {
    const inicio = (this.paginaActual - 1) * this.postsPorPagina;
    return this.postsFiltrados.slice(inicio, inicio + this.postsPorPagina);
  }

  /**
   * Cambia de página en la vista de publicaciones.
   * @param pagina Número de página deseada.
   */
  cambiarPagina(pagina: number): void {
    if (pagina < 1 || pagina > this.totalPaginas) return;
    this.paginaActual = pagina;
  }

}
