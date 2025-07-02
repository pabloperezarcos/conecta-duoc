import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserService } from '../../core/services/user.service';
import { RouterModule } from '@angular/router';
import { PostCategoryService } from '../../core/services/post-category.service';
import { PostCategory } from '../../models/postCategory';
import { NotificacionBannerComponent } from '../notificacion-banner/notificacion-banner.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, NotificacionBannerComponent],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  private userService = inject(UserService);
  private postCategoryService = inject(PostCategoryService);

  categories: (PostCategory & { icono: string; ruta: string; colorClass?: string; adminOnly?: boolean })[] = [];
  username: string | null = null;
  role: string | null = null;

  ngOnInit(): void {
    this.username = this.userService.getName() || this.userService.getAzureUser()?.fullName || this.userService.getAzureUser()?.email || 'Desconocido';
    this.role = this.userService.getRole();

    this.postCategoryService.getAll().subscribe(categories => {
      this.categories = categories
        .filter(cat => {
          if (!cat.status) return false;

          const nombre = cat.name.toLowerCase();
          if (nombre === 'reportes' || nombre === 'panel de configuración') {
            return this.role === 'admin';
          }

          return true;
        })
        .map(cat => ({
          ...cat,
          icono: this.getIconForCategory(cat.name),
          ruta: this.getRouteForCategory(cat.name)
        }));
    });
  }

  getIconForCategory(name: string): string {
    switch (name.toLowerCase()) {
      case 'ayudantías académicas':
        return 'fas fa-book-open';
      case 'actividades deportivas':
        return 'fas fa-futbol';
      case 'culturales y recreativas':
        return 'fas fa-theater-masks';
      case 'voluntariado - ecoduoc':
        return 'fas fa-leaf';
      case 'trueques estudiantiles':
        return 'fas fa-exchange-alt';
      case 'panel de configuración':
        return 'fas fa-cog';
      case 'reportes':
        return 'fas fa-chart-bar';
      default:
        return 'fas fa-asterisk';
    }
  }

  getRouteForCategory(name: string): string {
    switch (name.toLowerCase()) {
      case 'ayudantías académicas':
        return '/categoria/ayudantias';
      case 'actividades deportivas':
        return '/categoria/deportes';
      case 'culturales y recreativas':
        return '/categoria/culturales';
      case 'voluntariado - ecoduoc':
        return '/categoria/voluntariado';
      case 'trueques estudiantiles':
        return '/categoria/trueques';
      case 'reportes':
        return '/dashboard/reportes';
      case 'panel de configuración':
        return '/dashboard/configuracion';
      default:
        return '/dashboard';
    }
  }

}
