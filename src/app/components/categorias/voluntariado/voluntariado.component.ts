import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { BreadcrumbComponent } from '../../breadcrumb/breadcrumb.component';
import { PostService } from '../../../core/services/post.service';
import { UserService } from '../../../core/services/user.service';
import { Post } from '../../../models/post';
import { ReportService } from '../../../core/services/report.service';
import { PostCategoryService } from '../../../core/services/post-category.service';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-voluntariado',
  standalone: true,
  imports: [CommonModule, BreadcrumbComponent, RouterLink, FormsModule, ReactiveFormsModule],
  templateUrl: './voluntariado.component.html',
  styleUrls: ['./voluntariado.component.scss']
})
export class VoluntariadoComponent implements OnInit {
  private fb = inject(FormBuilder);
  private postService = inject(PostService);
  private userService = inject(UserService);
  private reportService = inject(ReportService);
  private postCategoryService = inject(PostCategoryService);

  form!: FormGroup;
  mostrarFormulario = false;
  publicaciones: Post[] = [];
  filtroBusqueda = '';
  idCategoryVoluntariado: number | null = null;
  loading = false;

  ngOnInit(): void {
    this.form = this.fb.group({
      title: ['', Validators.required],
      content: ['', Validators.required]
    });

    this.postCategoryService.getAll().subscribe(categories => {
      const found = categories.find(cat => cat.name.toLowerCase().includes('voluntariado'));
      if (found) {
        this.idCategoryVoluntariado = found.idCategory;
        this.cargarPublicaciones();
      }
    });
  }

  cargarPublicaciones(): void {
    if (this.idCategoryVoluntariado == null) return;
    this.loading = true;
    this.postService.getAll(this.idCategoryVoluntariado).subscribe({
      next: posts => {
        this.publicaciones = posts;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  crearPublicacion(): void {
    if (this.idCategoryVoluntariado == null) return;

    // idUser numérico desde el UserService
    const idUser = this.userService.getIdUser();
    if (!idUser) {
      alert('No se pudo obtener el ID del usuario.');
      return;
    }

    const nueva: Omit<Post, 'idPost' | 'createdDate' | 'views'> = {
      title: this.form.value.title,
      content: this.form.value.content,
      idCategory: this.idCategoryVoluntariado,
      idUser
    };

    this.postService.createPost(nueva).subscribe({
      next: () => {
        this.cargarPublicaciones();
        this.form.reset();
        this.mostrarFormulario = false;
        console.log('Publicación creada con éxito');
      },
      error: err => {
        console.error('Error al crear la publicación:', err);
      }
    });
  }

  toggleFormulario(): void {
    this.mostrarFormulario = !this.mostrarFormulario;
    if (!this.mostrarFormulario) {
      this.form.reset();
    }
  }

  puedeEditar(pub: Post): boolean {
    const idUser = this.userService.getIdUser();
    const role = this.userService.getRole();
    return pub.idUser === idUser || role === 'admin';
  }

  reportarPublicacion(pub: Post): void {
    this.reportService.reportPost(pub.idPost, 'Contenido inapropiado').subscribe(() => {
      alert('Publicación reportada con éxito');
      console.log('Publicación reportada con éxito');
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
}