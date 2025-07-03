import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { UserService } from '../../../core/services/user.service';
import { User } from '../../../models/user';
import { BreadcrumbComponent } from '../../breadcrumb/breadcrumb.component';

/**
 * Componente del panel de configuración para administrar usuarios.
 * Permite listar, filtrar, editar y actualizar datos de usuarios registrados.
 */
@Component({
  selector: 'app-config-usuarios',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, BreadcrumbComponent, FormsModule],
  templateUrl: './usuarios.component.html',
  styleUrls: ['./usuarios.component.scss']
})
export class UsuariosComponent implements OnInit {
  /** Servicio para construir y manejar formularios reactivos */
  private fb = inject(FormBuilder);

  /** Servicio para gestionar la información del usuario en la aplicación */
  private userService = inject(UserService);

  /** Lista de usuarios cargados desde el backend */
  users: User[] = [];

  /** Formulario para editar usuario */
  userForm!: FormGroup;

  /** Usuario que está siendo editado actualmente */
  editing: User | null = null;

  /** Texto para filtrar usuarios por nombre */
  filtroNombre: string = '';

  /** Lista de sedes posibles */
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


  /**
   * Inicializa el formulario de edición y carga los usuarios existentes.
   */
  ngOnInit(): void {
    this.userForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      name: ['', Validators.required],
      role: ['student', Validators.required],
      center: ['', Validators.required]
    });

    this.cargarUsuarios();
  }

  /**
   * Devuelve los usuarios filtrados por nombre.
   */
  get usuariosFiltrados(): User[] {
    if (!this.filtroNombre.trim()) return this.users;
    const filtro = this.filtroNombre.toLowerCase();
    return this.users.filter(u => u.name?.toLowerCase().includes(filtro));
  }

  /**
   * Carga todos los usuarios desde el backend.
   */
  cargarUsuarios(): void {
    this.userService.getAll().subscribe(users => (this.users = users));
  }

  /**
   * Prepara el formulario para editar un usuario seleccionado.
   * @param user Usuario a editar.
   */
  editar(user: User): void {
    this.editing = { ...user };
    this.userForm.patchValue(this.editing);
  }

  /**
   * Cancela la edición del usuario y limpia el formulario.
   */
  cancelarEdicion(): void {
    this.editing = null;
    this.userForm.reset({ role: 'student' });
  }

  /**
   * Guarda los cambios realizados al usuario actualmente en edición.
   */
  guardar(): void {
    if (this.userForm.invalid || !this.editing?.idUser) return;

    const datos = {
      ...this.userForm.value,
      policies: 1
    };

    this.userService.updateUser(this.editing.email, datos).subscribe(() => {
      this.userService.setName(datos.name);
      this.cargarUsuarios();
      this.cancelarEdicion();
    });
  }

  /**
   * (Comentado) Elimina un usuario del sistema.
   * @param user Usuario a eliminar.
   */
  /*   
  eliminar(user: User): void {
      if (!user.idUser) return;
      if (!confirm('¿Eliminar usuario?')) return;
      this.userService.deleteUser(user.idUser).subscribe(() => {
        this.cargarUsuarios();
      });
    } 
    */

}