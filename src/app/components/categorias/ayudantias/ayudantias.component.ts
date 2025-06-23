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
  selector: 'app-ayudantias',
  standalone: true,
  imports: [CommonModule, BreadcrumbComponent, ReactiveFormsModule, RouterLink, FormsModule],
  templateUrl: './ayudantias.component.html',
  styleUrls: ['./ayudantias.component.scss']
})
export class AyudantiasComponent implements OnInit {
  private fb = inject(FormBuilder);
  private postService = inject(PostService);
  private userService = inject(UserService);
  private reportService = inject(ReportService);
  private postCategoryService = inject(PostCategoryService);

  form!: FormGroup;
  mostrarFormulario = false;
  publicaciones: Post[] = [];
  filtroBusqueda = '';
  idCategoryAyudantia: number | null = null;
  loading = false;

  ngOnInit(): void {
    this.form = this.fb.group({
      title: ['', Validators.required],
      content: ['', Validators.required]
    });

    const normalize = (str: string) =>
      str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

    this.postCategoryService.getAll().subscribe(categories => {
      //console.log('Categorías recibidas:', categories);
      const found = categories.find(cat => normalize(cat.name).includes('ayudantia'));
      //console.log('Categoría encontrada:', found);
      if (found) {
        this.idCategoryAyudantia = found.idCategory;
        this.cargarPublicaciones();
      } else {
        alert('No se pudo determinar la categoría de Ayudantías. Verifica que exista en la BD.');
      }
    });
  }

  cargarPublicaciones(): void {
    if (this.idCategoryAyudantia == null) return;
    this.loading = true;
    this.postService.getAll(this.idCategoryAyudantia).subscribe({
      next: posts => {
        this.publicaciones = posts;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  /*   Metodo Obsoleto, se reemplaza por nuevaPublicacion()
    crearPublicacion(): void {
      console.log('Intentando publicar...');
      if (this.idCategoryAyudantia == null) return;
  
      const idUser = this.userService.getIdUser();
      console.log('ID_USER:', idUser);
      if (!idUser) {
        alert('No se pudo obtener el ID del usuario.');
        return;
      }
  
      const nueva: Omit<Post, 'idPost' | 'createdDate' | 'views'> = {
        title: this.form.value.title,
        content: this.form.value.content,
        idCategory: this.idCategoryAyudantia,
        idUser: idUser // aseguramos que es número
      };
  
      console.log('Enviando post:', nueva);
  
      this.postService.createPost(nueva).subscribe({
        next: () => {
          console.log('Publicación creada con éxito');
          this.cargarPublicaciones();
          this.form.reset();
          this.mostrarFormulario = false;
        },
        error: err => {
          console.error('Error al crear la publicación:', err);
        }
      });
    }
   */

  nuevaPublicacion(): void {
    // Valida el formulario antes de continuar
    if (this.form.invalid) {
      alert('Completa todos los campos');
      return;
    }

    // Chequea la categoría
    if (this.idCategoryAyudantia == null) {
      alert('No se pudo determinar la categoría.');
      return;
    }

    // Obtiene el idUser desde el UserService (debería ser un número)
    const idUser = this.userService.getIdUser?.();
    if (!idUser) {
      alert('No se pudo obtener el ID del usuario.');
      return;
    }

    // Prepara el objeto para enviar
    const nueva = {
      title: this.form.value.title,
      content: this.form.value.content,
      idCategory: this.idCategoryAyudantia,
      idUser: Number(idUser) // fuerza número
    };

    console.log('Intentando publicar...', nueva);

    this.postService.createPost(nueva).subscribe({
      next: (res) => {
        console.log('Respuesta backend:', res);
        this.cargarPublicaciones();
        this.form.reset();
        this.mostrarFormulario = false;
        alert('¡Publicación creada con éxito!');
      },
      error: (err) => {
        console.error('Error al crear la publicación:', err);
        alert('Error al publicar. Intenta nuevamente.');
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