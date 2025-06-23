import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserService } from '../../core/services/user.service';
import { RouterModule } from '@angular/router';
import { MsalService } from '@azure/msal-angular';
import { PostCategoryService } from '../../core/services/post-category.service';
import { PostCategory } from '../../models/postCategory';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  private userService = inject(UserService);
  private msal = inject(MsalService);
  private postCategoryService = inject(PostCategoryService);

  categories: (PostCategory & { icono: string; ruta: string; colorClass?: string; adminOnly?: boolean })[] = [];
  username: string | null = null;
  role: string | null = null;

  ngOnInit(): void {
    //console.log('Categorías recibidas:', this.categories);
    this.username = this.userService.getName() || this.userService.getAzureUser()?.fullName || this.userService.getAzureUser()?.email || 'Desconocido';
    this.role = this.userService.getRole();

    this.postCategoryService.getAll().subscribe(categories => {
      this.categories = categories
        .filter(cat => cat.status)
        .filter(cat => cat.name.toLowerCase() !== 'reportes' || this.role === 'admin')
        .map(cat => ({
          ...cat,
          icono: this.getIconForCategory(cat.name),
          ruta: this.getRouteForCategory(cat.name)
        }));

      //console.log('ROL:', this.role);
      //console.log('CATEGORIAS:', this.categories);
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
      default:
        return 'fas fa-asterisk'; // Icono genérico
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
      default:
        return '/dashboard';
    }
  }

}
