import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { PostCategoryService } from '../../../core/services/post-category.service';
import { PostCategory } from '../../../models/postCategory';
import { BreadcrumbComponent } from '../../breadcrumb/breadcrumb.component';

@Component({
  selector: 'app-config-categorias',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, BreadcrumbComponent, FormsModule],
  templateUrl: './categorias-admin.component.html',
  styleUrls: ['./categorias-admin.component.scss']
})
export class CategoriasAdminComponent implements OnInit {
  private fb = inject(FormBuilder);
  private categoryService = inject(PostCategoryService);

  categorias: PostCategory[] = [];
  categoriaForm!: FormGroup;
  editing: PostCategory | null = null;
  filtroCategoria: string = '';

  ngOnInit(): void {
    this.categoriaForm = this.fb.group({
      name: ['', Validators.required],
      description: ['', Validators.required],
      status: [1, Validators.required]
    });

    this.cargar();
  }

  get categoriasFiltradas(): PostCategory[] {
    if (!this.filtroCategoria.trim()) return this.categorias;
    const filtro = this.filtroCategoria.toLowerCase();
    return this.categorias.filter(c => c.name.toLowerCase().includes(filtro));
  }


  cargar(): void {
    this.categoryService.getAll().subscribe(c => (this.categorias = c));
  }

  editar(cat: PostCategory): void {
    this.editing = { ...cat };
    this.categoriaForm.patchValue(this.editing);
  }

  cancelar(): void {
    this.editing = null;
    this.categoriaForm.reset({ status: 1 });
  }

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

  eliminar(cat: PostCategory): void {
    if (!confirm('¿Eliminar categoría?')) return;
    this.categoryService.delete(cat.idCategory).subscribe(() => this.cargar());
  }
}