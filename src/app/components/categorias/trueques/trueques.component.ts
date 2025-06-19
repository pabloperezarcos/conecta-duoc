import { Component, OnInit } from '@angular/core';
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
  selector: 'app-trueques',
  standalone: true,
  imports: [CommonModule, BreadcrumbComponent, ReactiveFormsModule, RouterLink, FormsModule],
  templateUrl: './trueques.component.html',
  styleUrls: ['./trueques.component.scss']
})
export class TruequesComponent implements OnInit {
  form!: FormGroup;
  mostrarFormulario = false;
  publicaciones: Post[] = [];
  filtroBusqueda = '';
  idCategoryTrueque: number | null = null;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private postService: PostService,
    private userService: UserService,
    private reportService: ReportService,
    private postCategoryService: PostCategoryService
  ) { }

  ngOnInit(): void {
    this.form = this.fb.group({
      title: ['', Validators.required],
      content: ['', Validators.required]
    });

    this.postCategoryService.getAll().subscribe(categories => {
      const found = categories.find(cat => cat.categoryName.toLowerCase().includes('trueque'));
      if (found) {
        this.idCategoryTrueque = found.idCategory;
        this.cargarPublicaciones();
      }
    });
  }

  cargarPublicaciones(): void {
    if (this.idCategoryTrueque == null) return;
    this.loading = true;
    this.postService.getAll(this.idCategoryTrueque).subscribe({
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
    if (this.idCategoryTrueque == null) return;
    const idUser = this.userService.getAzureUser()?.email || 'anónimo';
    const nueva: Omit<Post, 'idPost' | 'date'> = {
      title: this.form.value.title,
      content: this.form.value.content,
      idUser,
      idCategory: this.idCategoryTrueque
    };
    this.postService.create(nueva).subscribe({
      next: () => {
        this.cargarPublicaciones();
        this.form.reset();
        this.mostrarFormulario = false;
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
    const user = this.userService.getAzureUser()?.email;
    const role = this.userService.getRole();
    return pub.idUser === user || role === 'admin';
  }

  reportarPublicacion(pub: Post): void {
    this.reportService.reportPost(pub.idPost, 'Contenido inapropiado').subscribe(() => {
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