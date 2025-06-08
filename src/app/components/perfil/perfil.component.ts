import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BreadcrumbComponent } from '../breadcrumb/breadcrumb.component';
import { UserService } from '../../core/services/user.service';
import { PublicacionesService } from '../../core/services/publicaciones.service';
import { Publicacion } from '../../models/publicacion';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule, BreadcrumbComponent, RouterModule, FormsModule],
  templateUrl: './perfil.component.html',
  styleUrls: ['./perfil.component.scss']
})
export class PerfilComponent implements OnInit {
  correo: string | null = '';
  rol: string | null = '';
  sede: string = '';
  publicacionesPropias: Publicacion[] = [];
  totalComentarios = 0;

  sedes: string[] = [
    'Modalidad online',
    'Campus Virtual',
    'Sede Alameda',
    'Sede Padre Alonso de Ovalle',
    'Sede Antonio Varas',
    'Sede Educación Continua',
    'Sede Maipú',
    'Sede Melipilla',
    'Sede Plaza Norte',
    'Sede Plaza Oeste',
    'Sede Plaza Vespucio',
    'Sede Puente Alto',
    'Sede San Bernardo',
    'Sede San Carlos de Apoquindo',
    'Sede San Joaquín',
    'Sede Valparaíso',
    'Sede Viña del Mar',
    'Campus Arauco',
    'Campus Nacimiento',
    'Sede San Andrés de Concepción',
    'Campus Villarrica',
    'Sede Puerto Montt'
  ];


  constructor(
    private userService: UserService,
    private publicacionesService: PublicacionesService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.correo = this.userService.getUsername();
    this.rol = this.userService.getRole();
    this.sede = localStorage.getItem('sede') || 'Sin asignar';

    const todas = this.publicacionesService.getAll();
    this.publicacionesPropias = todas.filter(p => p.autor === this.correo);
    this.totalComentarios = this.publicacionesPropias.reduce(
      (acc, pub) => acc + (pub.comentarios?.length || 0),
      0
    );
  }

  editar(pub: Publicacion): void {
    this.router.navigate(['/dashboard/ayudantias'], { state: { editar: pub } });
  }

  guardarSede(): void {
    localStorage.setItem('sede', this.sede);
  }

}
