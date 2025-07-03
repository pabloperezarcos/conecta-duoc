import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { PostCategoryService } from '../../../core/services/post-category.service';
import { PostCategory } from '../../../models/postCategory';
import { BreadcrumbComponent } from '../../breadcrumb/breadcrumb.component';

/**
 * Componente del panel de configuración para administrar categorías de publicaciones.
 * Permite crear, editar, eliminar y filtrar categorías que se usarán en la plataforma.
 */
@Component({
  selector: 'app-config-categorias',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, BreadcrumbComponent, FormsModule],
  templateUrl: './categorias-admin.component.html',
  styleUrls: ['./categorias-admin.component.scss']
})
export class CategoriasAdminComponent implements OnInit {
  /** Servicio para crear y manejar formularios reactivos */
  private fb = inject(FormBuilder);

  /** Servicio que gestiona la creación, edición y eliminación de categorías de publicaciones */
  private categoryService = inject(PostCategoryService);

  /** Lista de categorías cargadas desde el backend */
  categorias: PostCategory[] = [];

  /** Formulario para crear o editar una categoría */
  categoriaForm!: FormGroup;

  /** Categoría que se está editando actualmente */
  editing: PostCategory | null = null;

  /** Texto para filtrar categorías por nombre */
  filtroCategoria: string = '';

  /**
   * Inicializa el formulario y carga las categorías existentes.
   */
  ngOnInit(): void {
    this.categoriaForm = this.fb.group({
      name: ['', Validators.required],
      description: ['', Validators.required],
      status: [1, Validators.required]
    });

    this.cargar();
  }

  /**
   * Devuelve las categorías filtradas por nombre.
   */
  get categoriasFiltradas(): PostCategory[] {
    if (!this.filtroCategoria.trim()) return this.categorias;
    const filtro = this.filtroCategoria.toLowerCase();
    return this.categorias.filter(c => c.name.toLowerCase().includes(filtro));
  }

  /**
   * Carga todas las categorías desde el backend.
   */
  cargar(): void {
    this.categoryService.getAll().subscribe(c => (this.categorias = c));
  }

  /**
   * Carga la categoría seleccionada en el formulario para editar.
   * @param cat Categoría a editar.
   */
  editar(cat: PostCategory): void {
    this.editing = { ...cat };
    this.categoriaForm.patchValue(this.editing);
  }

  /**
   * Cancela la edición actual y reinicia el formulario.
   */
  cancelar(): void {
    this.editing = null;
    this.categoriaForm.reset({ status: 1 });
  }

  /**
   * Guarda los cambios en una categoría existente o crea una nueva.
   */
  guardar(): void {
    if (this.categoriaForm.invalid) return;
    const datos = this.categoriaForm.value as PostCategory;
    if (this.editing) {
      this.categoryService.update(this.editing.idCategory, datos).subscribe(() => {
        this.cargar();
        this.cancelar();
      });
    } else {
      this.categoryService.create(datos).subscribe(() => {
        this.cargar();
        this.categoriaForm.reset({ status: 1 });
      });
    }
  }

  /**
   * Elimina una categoría del sistema tras confirmación.
   * @param cat Categoría a eliminar.
   */
  eliminar(cat: PostCategory): void {
    if (!confirm('¿Eliminar categoría?')) return;
    this.categoryService.delete(cat.idCategory).subscribe(() => this.cargar());
  }

}