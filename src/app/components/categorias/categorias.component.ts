import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { PostCategoryService } from '../../core/services/post-category.service';
import { PostService } from '../../core/services/post.service';
import { UserService } from '../../core/services/user.service';
import { ReportService } from '../../core/services/report.service';
import { Post } from '../../models/post';
import { BreadcrumbComponent } from '../breadcrumb/breadcrumb.component';

@Component({
  selector: 'app-categorias',
  standalone: true,
  imports: [BreadcrumbComponent, FormsModule, ReactiveFormsModule, RouterModule, CommonModule],
  templateUrl: './categorias.component.html',
  styleUrls: ['./categorias.component.scss']
})
export class CategoriasComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private postCategoryService = inject(PostCategoryService);
  private postService = inject(PostService);
  private userService = inject(UserService);
  private reportService = inject(ReportService);

  slug = '';
  categoriaId: number | null = null;
  categoriaNombre = '';
  nombreCategoriaMostrada = '';
  publicaciones: Post[] = [];
  nombresUsuarios: Record<number, string> = {};
  filtroBusqueda = '';
  form!: FormGroup;
  mostrarFormulario = false;
  loading = true;

  ngOnInit(): void {
    this.form = this.fb.group({
      title: ['', Validators.required],
      content: ['', Validators.required]
    });

    this.slug = this.route.snapshot.paramMap.get('slug') || '';

    this.postCategoryService.getAll().subscribe(categories => {
      const categoria = categories.find(cat =>
        this.getSlugFromName(cat.name) === this.slug
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

  cargarPublicaciones(): void {
    if (!this.categoriaId) return;

    this.loading = true;
    this.postService.getAll(this.categoriaId).subscribe(posts => {
      this.publicaciones = posts;
      this.loading = false;

      // Obtener nombres de los autores
      const ids = [...new Set(posts.map(p => p.idUser))];
      ids.forEach(id => {
        this.userService.getUserById(id).subscribe(user => {
          this.nombresUsuarios[id] = user.name;
        });
      });
    });
  }

  get publicacionesFiltradas(): Post[] {
    if (!this.filtroBusqueda.trim()) return this.publicaciones;
    const texto = this.filtroBusqueda.trim().toLowerCase();
    return this.publicaciones.filter(pub =>
      pub.title.toLowerCase().includes(texto) ||
      pub.content.toLowerCase().includes(texto)
    );
  }

  toggleFormulario(): void {
    this.mostrarFormulario = !this.mostrarFormulario;
    if (!this.mostrarFormulario) this.form.reset();
  }

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

  reportarPublicacion(pub: Post): void {
    this.reportService.reportPost(pub.idPost, 'Contenido inapropiado').subscribe(() => {
      alert('Publicación reportada');
    });
  }

  getSlugFromName(name: string): string {
    switch (name.toLowerCase()) {
      case 'ayudantías académicas':
        return 'ayudantias';
      case 'actividades deportivas':
        return 'deportes';
      case 'culturales y recreativas':
        return 'culturales';
      case 'voluntariado - ecoduoc':
        return 'voluntariado';
      case 'trueques estudiantiles':
        return 'trueques';
      default:
        return 'otros';
    }
  }

}
