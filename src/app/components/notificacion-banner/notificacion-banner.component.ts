import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificacionGlobal } from '../../models/notificacionGlobal';
import { NotificacionService } from '../../core/services/notificacion.service';
import { interval, Subscription } from 'rxjs';

/**
 * Componente visual que muestra un banner rotativo con notificaciones globales activas.
 * Permite a los administradores comunicar información importante a todos los usuarios.
 */
@Component({
  selector: 'app-notificacion-banner',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notificacion-banner.component.html',
  styleUrls: ['./notificacion-banner.component.scss']
})
export class NotificacionBannerComponent implements OnInit, OnDestroy {
  /** Lista de notificaciones globales activas obtenidas desde el backend */
  notificaciones: NotificacionGlobal[] = [];

  /** Controla si el banner está visible */
  mostrar = false;

  /** Notificación actualmente visible */
  actual: NotificacionGlobal | null = null;

  /** Índice actual dentro del arreglo de notificaciones */
  currentIndex = 0;

  /** Instancia del servicio de notificaciones */
  private servicio = inject(NotificacionService);

  /** Referencia a la suscripción del rotador automático */
  private rotacionSub: Subscription = new Subscription();

  /**
   * Al iniciar, obtiene las notificaciones vigentes y configura la rotación si hay más de una.
   */
  ngOnInit(): void {
    this.servicio.getVigentes().subscribe((lista: NotificacionGlobal[]) => {
      this.notificaciones = lista;

      if (this.notificaciones.length > 0) {
        this.actual = this.notificaciones[0];
        this.mostrar = true;

        if (this.notificaciones.length > 1) {
          this.iniciarRotacion();
        }
      }
    });
  }

  /**
   * Inicia la rotación automática del banner cada 7 segundos.
   */
  iniciarRotacion() {
    this.rotacionSub = interval(7000).subscribe(() => {
      this.currentIndex = (this.currentIndex + 1) % this.notificaciones.length;
      this.actual = this.notificaciones[this.currentIndex];
    });
  }

  /**
   * Cierra el banner y detiene la rotación.
   */
  cerrar(): void {
    this.mostrar = false;
    this.rotacionSub.unsubscribe();
  }

  /**
   * Al destruir el componente, cancela la suscripción al intervalo.
   */
  ngOnDestroy(): void {
    this.rotacionSub.unsubscribe();
  }

}
