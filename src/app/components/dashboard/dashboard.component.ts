import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserService } from '../../core/services/user.service';
import { RouterModule } from '@angular/router';
import { PostCategoryService } from '../../core/services/post-category.service';
import { PostCategory } from '../../models/postCategory';
import { NotificacionBannerComponent } from '../notificacion-banner/notificacion-banner.component';

/**
 * Componente principal del dashboard del usuario.
 * Muestra las categorías activas como accesos rápidos según el rol,
 * y carga el banner de notificaciones globales.
 */
@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, NotificacionBannerComponent],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  /** Servicio para acceder y gestionar los datos del usuario actual */
  private userService = inject(UserService);

  /** Servicio que maneja las categorías de publicaciones disponibles en el sistema */
  private postCategoryService = inject(PostCategoryService);

  /** Nombre del usuario autenticado */
  username: string | null = null;

  /** Rol del usuario (`admin`, `student`, etc.) */
  role: string | null = null;

  /**
   * Categorías visibles en el dashboard, con icono, ruta y visibilidad según rol.
   */
  categories: (PostCategory & { icono: string; ruta: string, adminOnly?: boolean; })[] = [];

  /** Mapa de slugs a íconos FontAwesome */
  private iconMap: Record<string, string> = {
    'ayudantias-academicas': 'fas fa-book-open',
    'actividades-deportivas': 'fas fa-futbol',
    'culturales-y-recreativas': 'fas fa-theater-masks',
    'voluntariado-ecoduoc': 'fas fa-leaf',
    'trueques-estudiantiles': 'fas fa-exchange-alt',
    'panel-de-configuracion': 'fas fa-cog',
    'reportes': 'fas fa-chart-bar'
  };

  /**
   * Al iniciar el componente:
   * - Obtiene nombre y rol del usuario.
   * - Carga las categorías visibles (filtrando las no activas y las solo-admin).
   */
  ngOnInit(): void {
    this.username = this.userService.getName() || this.userService.getAzureUser()?.fullName || this.userService.getAzureUser()?.email || 'Desconocido';
    this.role = this.userService.getRole();

    this.postCategoryService.getAll().subscribe(categories => {
      this.categories = categories
        .filter(cat => {
          if (!cat.status) return false;

          const slug = this.slugify(cat.name);
          if (slug === 'reportes' || slug === 'panel-de-configuracion') {
            return this.role === 'admin';
          }

          return true;
        })
        .map(cat => {
          const slug = this.slugify(cat.name);
          const ruta = slug === 'reportes' || slug === 'panel-de-configuracion'
            ? `/dashboard/${slug}`
            : `/categoria/${slug}`;

          return {
            ...cat,
            ruta,
            icono: this.iconMap[slug] || 'fas fa-asterisk',
            adminOnly: slug === 'reportes' || slug === 'panel-de-configuracion'
          };
        });
    });
  }

  /**
   * Convierte un texto a formato `slug`, eliminando tildes y espacios.
   * @param text Texto a transformar.
   * @returns Slug limpio en minúsculas.
   */
  private slugify(text: string): string {
    return text
      .toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }

}
