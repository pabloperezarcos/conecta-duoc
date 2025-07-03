import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { BreadcrumbComponent } from '../breadcrumb/breadcrumb.component';

/**
 * Componente base del panel de configuración administrativa.
 * Actúa como contenedor de navegación hacia módulos como usuarios, categorías y notificaciones.
 */
@Component({
  selector: 'app-configuracion',
  standalone: true,
  imports: [CommonModule, RouterModule, BreadcrumbComponent],
  templateUrl: './configuracion.component.html',
  styleUrl: './configuracion.component.scss'
})
export class ConfiguracionComponent {

}
