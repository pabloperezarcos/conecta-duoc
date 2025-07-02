import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificacionGlobal } from '../../models/notificacionGlobal';
import { NotificacionService } from '../../core/services/notificacion.service';
import { interval, Subscription } from 'rxjs';

@Component({
  selector: 'app-notificacion-banner',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notificacion-banner.component.html',
  styleUrls: ['./notificacion-banner.component.scss']
})
export class NotificacionBannerComponent implements OnInit, OnDestroy {
  notificaciones: NotificacionGlobal[] = [];
  mostrar = false;
  actual: NotificacionGlobal | null = null;
  currentIndex = 0;

  private servicio = inject(NotificacionService);
  private rotacionSub: Subscription = new Subscription();

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

  iniciarRotacion() {
    this.rotacionSub = interval(7000).subscribe(() => {
      this.currentIndex = (this.currentIndex + 1) % this.notificaciones.length;
      this.actual = this.notificaciones[this.currentIndex];
    });
  }

  cerrar() {
    this.mostrar = false;
    this.rotacionSub.unsubscribe();
  }

  ngOnDestroy(): void {
    this.rotacionSub.unsubscribe();
  }
}
