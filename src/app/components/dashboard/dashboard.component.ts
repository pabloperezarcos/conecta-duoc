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

  username: string | null = null;
  role: string | null = null;
  categories: (PostCategory & { icono: string; ruta: string, adminOnly?: boolean; })[] = [];

  private iconMap: Record<string, string> = {
    'ayudantias-academicas': 'fas fa-book-open',
    'actividades-deportivas': 'fas fa-futbol',
    'culturales-y-recreativas': 'fas fa-theater-masks',
    'voluntariado-ecoduoc': 'fas fa-leaf',
    'trueques-estudiantiles': 'fas fa-exchange-alt',
    'panel-de-configuracion': 'fas fa-cog',
    'reportes': 'fas fa-chart-bar'
  };


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

  private slugify(text: string): string {
    return text
      .toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }


}
