import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BreadcrumbComponent } from '../breadcrumb/breadcrumb.component';
import { UserService } from '../../core/services/user.service';
import { PostService } from '../../core/services/post.service';
import { User } from '../../models/user';
import { Post } from '../../models/post';
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
  user: User | null = null;
  posts: Post[] = [];
  sede: string = '';
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

  totalPosts = 0;
  totalComments = 0;

  constructor(
    private userService: UserService,
    private postService: PostService,
    private router: Router
  ) { }

  ngOnInit(): void {
    const email = this.userService.getAzureUser()?.email || this.userService.getName();
    if (!email) {
      this.router.navigate(['/']);
      return;
    }

    this.userService.getUser(email).subscribe(user => {
      this.user = user;
      this.sede = user.center;
    });

    this.postService.getAll().subscribe(posts => {
      // Solo las publicaciones del usuario
      this.posts = posts.filter(p => p.idUser === email);
      this.totalPosts = this.posts.length;

      // Si tienes un sistema para obtener el número de comentarios por post,
      // aquí sumarías ese dato (por ejemplo, si el backend retorna posts con un campo 'commentsCount')
      // Por ahora, lo dejamos en cero, o si quieres, podrías hacer una petición extra por cada post.
      this.totalComments = 0;
    });
  }

  getUserInitial(): string {
    return this.user?.name ? this.user.name.charAt(0).toUpperCase() : '?';
  }

  guardarSede(): void {
    if (this.user) {
      const updatedUser = { ...this.user, center: this.sede };
      this.userService.registerUser(updatedUser).subscribe(() => {
        // Puede que quieras notificar al usuario de que el cambio fue exitoso
      });
    }
  }

  editar(post: Post): void {
    // Redirecciona a la vista de edición según categoría
    this.router.navigate(['/dashboard/ayudantias', post.idPost], { state: { editar: post } });
  }
}
