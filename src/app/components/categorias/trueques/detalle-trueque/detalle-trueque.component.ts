import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { BreadcrumbComponent } from '../../../breadcrumb/breadcrumb.component';
import { PublicacionesService } from '../../../../core/services/publicaciones.service';
import { UserService } from '../../../../core/services/user.service';
import { Publicacion } from '../../../../models/publicacion';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-detalle-trueque',
  standalone: true,
  imports: [CommonModule, RouterModule, BreadcrumbComponent, ReactiveFormsModule],
  templateUrl: './detalle-trueque.component.html',
  styleUrls: ['./detalle-trueque.component.scss']
})
export class DetalleTruequeComponent implements OnInit {
  publicacion: Publicacion | undefined;
  comentarioForm!: FormGroup;

  constructor(
    private route: ActivatedRoute,
    private publicacionesService: PublicacionesService,
    private userService: UserService,
    private fb: FormBuilder,
    private router: Router
  ) { }

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.publicacion = this.publicacionesService.getAll().find(p => p.id === id);

    if (!this.publicacion) {
      this.router.navigate(['/categoria/trueques']);
      return;
    }

    document.title = `ConectaDuoc | ${this.publicacion.titulo}`;

    setTimeout(() => {
      const breadcrumbEl = document.querySelector('.breadcrumb li:last-child');
      if (breadcrumbEl) {
        breadcrumbEl.textContent = this.publicacion?.titulo || 'Detalle';
      }
    }, 0);

    this.comentarioForm = this.fb.group({
      texto: ['', [Validators.required, Validators.maxLength(300)]]
    });
  }

  comentar(): void {
    if (!this.publicacion || this.comentarioForm.invalid) return;

    const nuevoComentario = {
      id: Date.now(),
      texto: this.comentarioForm.value.texto,
      autor: this.userService.getUsername() || 'anónimo',
      fecha: new Date().toISOString()
    };

    if (!this.publicacion.comentarios) this.publicacion.comentarios = [];
    this.publicacion.comentarios.push(nuevoComentario);
    this.comentarioForm.reset();
  }

  volver(): void {
    this.router.navigate(['/categoria/trueques']);
  }
}
