import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { NotificacionGlobal } from '../../../models/notificacionGlobal';
import { NotificacionService } from '../../../core/services/notificacion.service';
import { BreadcrumbComponent } from '../../breadcrumb/breadcrumb.component';

@Component({
  selector: 'app-notificaciones',
  imports: [CommonModule, ReactiveFormsModule, BreadcrumbComponent],
  standalone: true,
  templateUrl: './notificaciones.component.html',
  styleUrls: ['./notificaciones.component.scss']
})
export class NotificacionesComponent implements OnInit {
  notificaciones: NotificacionGlobal[] = [];
  formulario: FormGroup;
  hoy = new Date();

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

  ngOnInit(): void {
    this.cargarNotificaciones();
  }

  esActiva(fechaFin: string): boolean {
    const hoy = new Date();
    const hoyStr = hoy.toISOString().split('T')[0];
    return fechaFin >= hoyStr;
  }

  private getHoyISO(): string {
    return new Date().toISOString().split('T')[0];
  }


  cargarNotificaciones() {
    this.notificacionService.getTodas().subscribe(data => {
      this.notificaciones = data;
    });
  }

  crear() {
    if (this.formulario.invalid) return;

    this.notificacionService.crear(this.formulario.value).subscribe(() => {
      this.formulario.reset();
      this.cargarNotificaciones();
    });
  }

  eliminar(id: number) {
    this.notificacionService.eliminar(id).subscribe(() => {
      this.cargarNotificaciones();
    });
  }
}