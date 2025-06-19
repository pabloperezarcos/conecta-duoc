import { Component, OnInit } from '@angular/core';
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
  categories: (PostCategory & { icono: string; ruta: string; colorClass?: string; adminOnly?: boolean })[] = [];
  username: string | null = null;
  role: string | null = null;

  /* 
  categorias = [
    {
      nombre: 'Ayudantías Académicas',
      descripcion: 'Comparte o solicita apoyo en materias específicas.',
      icono: 'fas fa-book-open',
      ruta: '/categoria/ayudantias'
    },
    {
      nombre: 'Actividades Deportivas',
      descripcion: 'Organiza partidos y actividades al aire libre.',
      icono: 'fas fa-futbol',
      ruta: '/categoria/deportes'
    },
    {
      nombre: 'Culturales y Recreativas',
      descripcion: 'Comparte actividades de arte, música, teatro o juegos.',
      icono: 'fas fa-theater-masks',
      ruta: '/categoria/culturales'
    },
    {
      nombre: 'Voluntariado - EcoDuoc',
      descripcion: 'Únete a iniciativas solidarias o medioambientales.',
      icono: 'fas fa-leaf',
      ruta: '/categoria/voluntariado'
    },
    {
      nombre: 'Trueques Estudiantiles',
      descripcion: 'Intercambia útiles, alimentos o materiales sin fines de lucro.',
      icono: 'fas fa-exchange-alt',
      ruta: '/categoria/trueques'
    },
    {
      nombre: 'Publicaciones Reportadas',
      descripcion: 'Administra los reportes enviados por la comunidad.',
      icono: 'fas fa-flag',
      ruta: '/dashboard/reportes',
      adminOnly: true,
      colorClass: 'text-danger'
    }
  ];
 */

  constructor(
    private userService: UserService,
    private msal: MsalService,
    private postCategoryService: PostCategoryService,
  ) { }

  ngOnInit(): void {
    this.username = this.userService.getName() || this.userService.getAzureUser()?.fullName || this.userService.getAzureUser()?.email || 'Desconocido';
    this.role = this.userService.getRole();

    this.postCategoryService.getAll().subscribe(categories => {
      this.categories = categories
        .filter(cat => cat.status) // Solo activas
        .map(cat => ({
          ...cat,
          icono: this.getIconForCategory(cat.categoryName),
          ruta: this.getRouteForCategory(cat.categoryName)
        }));

      // Si el usuario es admin, agrega la categoría de Reportes
      if (this.role === 'admin') {
        this.categories.push({
          idCategory: 999, // un id especial, nunca usado por el backend
          categoryName: 'Reportes',
          description: 'Administra los reportes enviados por la comunidad.',
          status: true,
          icono: 'fas fa-flag',
          ruta: '/dashboard/reportes',
          colorClass: 'text-danger',
          adminOnly: true
        });
      }
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
      default:
        return '/dashboard';
    }
  }

}
