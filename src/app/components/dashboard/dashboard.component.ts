import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserService } from '../../core/services/user.service';
import { RouterModule } from '@angular/router';
import { MsalService } from '@azure/msal-angular';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  username: string | null = null;
  role: string | null = null;

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
      adminOnly: true
    }
  ];

  constructor(private userService: UserService, private msal: MsalService) { }

  ngOnInit(): void {
    this.username = this.msal.instance.getActiveAccount()?.username || 'Desconocido';
    this.role = this.userService.getRole();
  }
}
