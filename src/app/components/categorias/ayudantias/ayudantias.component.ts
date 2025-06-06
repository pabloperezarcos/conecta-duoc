import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { BreadcrumbComponent } from '../../breadcrumb/breadcrumb.component';
import { NavbarComponent } from '../../navbar/navbar.component';
import { PublicacionesService } from '../../../core/services/publicaciones.service';
import { UserService } from '../../../core/services/user.service';
import { Publicacion } from '../../../models/publicacion';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-ayudantias',
  standalone: true,
  imports: [CommonModule, NavbarComponent, BreadcrumbComponent, ReactiveFormsModule, RouterLink],
  templateUrl: './ayudantias.component.html',
  styleUrls: ['./ayudantias.component.scss']
})
export class AyudantiasComponent implements OnInit {
  form!: FormGroup;
  mostrarFormulario = false;
  publicaciones: Publicacion[] = [];
  publicacionEditando: Publicacion | null = null;
  comentarioForms: { [pubId: number]: FormGroup } = {};

  constructor(
    private fb: FormBuilder,
    private publicacionesService: PublicacionesService,
    private userService: UserService
  ) { }

  ngOnInit(): void {
    this.form = this.fb.group({
      titulo: ['', Validators.required],
      descripcion: ['', Validators.required]
    });

    this.publicaciones = this.publicacionesService.getAll();
    this.publicaciones.forEach(pub => {
      this.comentarioForms[pub.id] = this.fb.group({
        texto: ['', Validators.required]
      });
    });
  }

  crearPublicacion(): void {
    if (this.publicacionEditando) {
      this.publicacionEditando.titulo = this.form.value.titulo;
      this.publicacionEditando.descripcion = this.form.value.descripcion;
      this.publicacionEditando = null;
    } else {
      const autor = this.userService.getUsername() || 'anónimo';
      const sede = 'San Joaquín'; // futura detección real

      this.publicacionesService.crear({
        ...this.form.value,
        autor,
        sede
      });
    }

    this.publicaciones = this.publicacionesService.getAll();

    this.publicaciones.forEach(pub => {
      if (!this.comentarioForms[pub.id]) {
        this.comentarioForms[pub.id] = this.fb.group({
          texto: ['', Validators.required]
        });
      }
    });

    this.form.reset();
    this.mostrarFormulario = false;
  }

  toggleFormulario(): void {
    this.mostrarFormulario = !this.mostrarFormulario;
  }

  puedeEditar(pub: Publicacion): boolean {
    const user = this.userService.getUsername();
    const role = this.userService.getRole();
    return pub.autor === user || role === 'admin';
  }

  editarPublicacion(pub: Publicacion): void {
    this.form.patchValue({
      titulo: pub.titulo,
      descripcion: pub.descripcion
    });
    this.publicacionEditando = pub;
    this.mostrarFormulario = true;
  }

  comentar(pub: Publicacion): void {
    const form = this.comentarioForms[pub.id];
    const nuevoComentario = {
      id: Date.now(),
      texto: form.value.texto,
      autor: this.userService.getUsername() || 'anónimo',
      fecha: new Date().toISOString()
    };

    if (!pub.comentarios) pub.comentarios = [];
    pub.comentarios.push(nuevoComentario);
    form.reset();
  }

}