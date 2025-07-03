/* ANGULAR IMPORTS */
import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

/* BREADCRUMB y BANNER*/
import { BreadcrumbComponent } from '../breadcrumb/breadcrumb.component';
import { NotificacionBannerComponent } from '../notificacion-banner/notificacion-banner.component';

/* MODELS */
import { Post } from '../../models/post';

/* SERVICES */
import { PostCategoryService } from '../../core/services/post-category.service';
import { PostService } from '../../core/services/post.service';
import { UserService } from '../../core/services/user.service';
import { ReportService } from '../../core/services/report.service';
import { ScoreService } from '../../core/services/score.service';

/**
 * Componente que gestiona la visualización, creación, filtrado, reporte y puntuación
 * de publicaciones dentro de una categoría específica en ConectaDuoc.
 */
@Component({
  selector: 'app-categorias',
  standalone: true,
  imports: [BreadcrumbComponent, FormsModule, ReactiveFormsModule, RouterModule, CommonModule, NotificacionBannerComponent],
  templateUrl: './categorias.component.html',
  styleUrls: ['./categorias.component.scss']
})
export class CategoriasComponent implements OnInit {
  /** Servicio para acceder a los parámetros de la ruta actual */
  private route = inject(ActivatedRoute);

  /** Servicio para navegar entre rutas del sistema */
  private router = inject(Router);

  /** Servicio para construir formularios reactivos */
  private fb = inject(FormBuilder);

  /** Servicio que gestiona las categorías de publicaciones */
  private postCategoryService = inject(PostCategoryService);

  /** Servicio que gestiona las publicaciones del sistema */
  private postService = inject(PostService);

  /** Servicio que maneja los datos del usuario actual */
  private userService = inject(UserService);

  /** Servicio para enviar y gestionar reportes de publicaciones o comentarios */
  private reportService = inject(ReportService);

  /** Servicio para asignar y consultar calificaciones (scores) de publicaciones */
  private scoreService = inject(ScoreService);

  /** Slug obtenido desde la URL */
  slug = '';

  /** ID de la categoría actual */
  categoriaId: number | null = null;

  /** Nombre legible de la categoría actual */
  categoriaNombre = '';

  /* Nombre de la categoría a mostrar */
  nombreCategoriaMostrada = '';

  /** Publicaciones cargadas desde el backend */
  publicaciones: Post[] = [];

  /** Diccionario con nombres de usuarios indexados por ID */
  nombresUsuarios: Record<number, string> = {};

  /** Diccionario con promedios de puntuación por publicación */
  promedioScores: Record<number, number> = {};

  /** Diccionario con puntuación personal del usuario en cada publicación */
  misScores: Record<number, number | null> = {};

  /** Texto de búsqueda para filtrar publicaciones */
  filtroBusqueda = '';

  /** Formulario para nueva publicación */
  form!: FormGroup;

  /** Controla visibilidad del formulario */
  mostrarFormulario = false;

  /** Estado de carga */
  loading = true;

  /**
   * Inicializa la vista de categoría, cargando la categoría correspondiente y sus publicaciones.
   */
  ngOnInit(): void {
    this.form = this.fb.group({
      title: ['', Validators.required],
      content: ['', Validators.required]
    });

    this.slug = this.route.snapshot.paramMap.get('slug') || '';
    console.log('Slug cargado:', this.slug);

    this.postCategoryService.getAll().subscribe(categories => {
      const categoria = categories.find(cat =>
        this.slugify(cat.name) === this.slug
      );

      if (!categoria) {
        this.router.navigate(['/dashboard']);
        return;
      }

      this.categoriaId = categoria.idCategory;
      this.categoriaNombre = categoria.name;
      this.nombreCategoriaMostrada = categoria.name;

      this.cargarPublicaciones();
    });
  }

  /**
   * Carga todas las publicaciones de la categoría actual, junto con los nombres de usuarios
   * y las puntuaciones (promedio y personales).
   */
  cargarPublicaciones(): void {
    if (!this.categoriaId) return;

    this.loading = true;
    this.postService.getAll(this.categoriaId).subscribe(posts => {
      this.publicaciones = posts;
      this.loading = false;

      const ids = [...new Set(posts.map(p => p.idUser))];
      ids.forEach(id => {
        this.userService.getUserById(id).subscribe(user => {
          this.nombresUsuarios[id] = user.name;
        });
      });

      const idUser = this.userService.getIdUser();
      if (idUser) {
        this.scoreService.getResumenScores(idUser, this.categoriaId ?? undefined).subscribe(resumenes => {
          resumenes.forEach(r => {
            this.promedioScores[r.idPost] = r.promedio;
            this.misScores[r.idPost] = r.miScore;
          });
        });
      }
    });
  }

  /**
   * Devuelve las publicaciones filtradas por el texto ingresado.
   */
  get publicacionesFiltradas(): Post[] {
    if (!this.filtroBusqueda.trim()) return this.publicaciones;
    const texto = this.filtroBusqueda.trim().toLowerCase();
    return this.publicaciones.filter(pub =>
      pub.title.toLowerCase().includes(texto) ||
      pub.content.toLowerCase().includes(texto)
    );
  }

  /**
   * Muestra u oculta el formulario para crear una nueva publicación.
   */
  toggleFormulario(): void {
    this.mostrarFormulario = !this.mostrarFormulario;
    if (!this.mostrarFormulario) this.form.reset();
  }


  /**
   * Envía una nueva publicación al backend si el formulario es válido.
   */
  nuevaPublicacion(): void {
    if (this.form.invalid || !this.categoriaId) return;

    const idUser = this.userService.getIdUser();
    if (!idUser) {
      alert('No se pudo obtener el ID del usuario.');
      return;
    }

    const nueva = {
      title: this.form.value.title,
      content: this.form.value.content,
      idCategory: this.categoriaId,
      idUser: idUser,
      createdDate: new Date().toISOString()
    };

    this.postService.createPost(nueva).subscribe({
      next: () => {
        this.cargarPublicaciones();
        this.form.reset();
        this.mostrarFormulario = false;
        alert('¡Publicación creada con éxito!');
      },
      error: err => {
        console.error('Error al crear publicación:', err);
        alert('Error al publicar');
      }
    });
  }

  /**
   * Reporta una publicación por contenido inapropiado.
   * @param pub Publicación a reportar.
   */
  reportarPublicacion(pub: Post): void {
    const reason = prompt('Motivo del reporte', 'Contenido inapropiado');
    if (!reason) return;
    this.reportService.reportPost(pub.idPost, reason).subscribe(() => {
      alert('Publicación reportada');
    });
  }

  /**
   * Convierte un texto en un slug amigable para URL.
   * Elimina tildes, caracteres especiales y reemplaza espacios por guiones.
   *
   * @param text Texto a transformar
   * @returns Texto transformado en formato slug
   */
  private slugify(text: string): string {
    return text
      .toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }

  /**
   * Envía una calificación (score) para una publicación y actualiza el promedio mostrado.
   *
   * @param pub Publicación a calificar
   * @param valor Valor de la calificación (de 1 a 5)
   */
  calificar(pub: Post, valor: number): void {
    const idUser = this.userService.getIdUser();
    if (!idUser) return;

    this.scoreService.setScore({ idPost: pub.idPost, idUser, score: valor }).subscribe(() => {
      this.misScores[pub.idPost] = valor;
      this.scoreService.getAverageScore(pub.idPost).subscribe(avg => {
        this.promedioScores[pub.idPost] = avg;
      });
    });
  }

}
