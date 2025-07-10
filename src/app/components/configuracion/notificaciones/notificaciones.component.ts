import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { NotificacionGlobal } from '../../../models/notificacionGlobal';
import { NotificacionService } from '../../../core/services/notificacion.service';
import { BreadcrumbComponent } from '../../breadcrumb/breadcrumb.component';

/**
 * Componente administrativo para crear, listar y eliminar notificaciones globales.
 * Estas notificaciones serán visibles para todos los usuarios en el banner superior.
 */
@Component({
  selector: 'app-notificaciones',
  imports: [CommonModule, ReactiveFormsModule, BreadcrumbComponent],
  standalone: true,
  templateUrl: './notificaciones.component.html',
  styleUrls: ['./notificaciones.component.scss']
})
export class NotificacionesComponent implements OnInit {
  /** Lista de notificaciones actuales en el sistema */
  notificaciones: NotificacionGlobal[] = [];

  /** Formulario reactivo para crear una nueva notificación */
  formulario: FormGroup;

  /** Fecha actual en formato `Date`, usada para comparaciones */
  hoy = new Date();

  /**
   * Constructor con inyección de servicios necesarios para el formulario y backend.
   * @param notificacionService Servicio que maneja el CRUD de notificaciones.
   * @param fb FormBuilder para construir el formulario reactivo.
   */
  constructor(
    private notificacionService: NotificacionService,
    private fb: FormBuilder
  ) {
    this.formulario = this.fb.group({
      titulo: ['', Validators.required],
      mensaje: ['', Validators.required],
      fechaInicio: [this.getHoyISO(), Validators.required],
      fechaFin: [this.getHoyISO(), Validators.required]
    });
  }

  /**
   * Al iniciar, se cargan todas las notificaciones desde el backend.
   */
  ngOnInit(): void {
    this.cargarNotificaciones();
  }

  /**
   * Verifica si una notificación está activa comparando su fecha de fin con la fecha actual.
   * @param fechaFin Fecha de término de la notificación (ISO string).
   * @returns `true` si aún está activa, `false` si ya expiró.
   */
  esActiva(fechaFin: string): boolean {
    const hoy = new Date();
    const hoyStr = hoy.toISOString().split('T')[0];
    return fechaFin >= hoyStr;
  }

  /**
   * Obtiene la fecha actual en formato ISO corto (`YYYY-MM-DD`).
   * @returns Fecha en string.
   */
  private getHoyISO(): string {
    return new Date().toISOString().split('T')[0];
  }

  /**
   * Obtiene todas las notificaciones desde el backend.
   */
  cargarNotificaciones() {
    this.notificacionService.getTodas().subscribe(data => {
      this.notificaciones = data;
    });
  }

  /**
   * Crea una nueva notificación si el formulario es válido.
   */
  crear() {
    if (this.formulario.invalid) return;

    this.notificacionService.crear(this.formulario.value).subscribe({
      next: () => {
        this.formulario.reset();
        this.cargarNotificaciones();
      },
      error: (err) => {
         console.log(err);
      }
    });
  }

  /**
   * Elimina una notificación existente por su ID.
   * @param id ID de la notificación a eliminar.
   */
  eliminar(id: number) {
    this.notificacionService.eliminar(id).subscribe(() => {
      this.cargarNotificaciones();
    });
  }

}