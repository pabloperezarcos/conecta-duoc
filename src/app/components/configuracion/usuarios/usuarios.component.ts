import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { UserService } from '../../../core/services/user.service';
import { User } from '../../../models/user';
import { BreadcrumbComponent } from '../../breadcrumb/breadcrumb.component';

@Component({
  selector: 'app-config-usuarios',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, BreadcrumbComponent, FormsModule],
  templateUrl: './usuarios.component.html',
  styleUrls: ['./usuarios.component.scss']
})
export class UsuariosComponent implements OnInit {
  private fb = inject(FormBuilder);
  private userService = inject(UserService);

  users: User[] = [];
  userForm!: FormGroup;
  editing: User | null = null;
  filtroNombre: string = '';
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

  ngOnInit(): void {
    this.userForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      name: ['', Validators.required],
      role: ['student', Validators.required],
      center: ['', Validators.required]
    });

    this.cargarUsuarios();
  }

  get usuariosFiltrados(): User[] {
    if (!this.filtroNombre.trim()) return this.users;
    const filtro = this.filtroNombre.toLowerCase();
    return this.users.filter(u => u.name?.toLowerCase().includes(filtro));
  }

  cargarUsuarios(): void {
    this.userService.getAll().subscribe(users => (this.users = users));
  }

  editar(user: User): void {
    this.editing = { ...user };
    this.userForm.patchValue(this.editing);
  }

  cancelarEdicion(): void {
    this.editing = null;
    this.userForm.reset({ role: 'student' });
  }

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