import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { UserService } from '../../../core/services/user.service';
import { User } from '../../../models/user';
import { BreadcrumbComponent } from '../../breadcrumb/breadcrumb.component';

@Component({
  selector: 'app-config-usuarios',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, BreadcrumbComponent],
  templateUrl: './usuarios.component.html',
  styleUrls: ['./usuarios.component.scss']
})
export class UsuariosComponent implements OnInit {
  private fb = inject(FormBuilder);
  private userService = inject(UserService);

  users: User[] = [];
  userForm!: FormGroup;
  editing: User | null = null;

  ngOnInit(): void {
    this.userForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      name: ['', Validators.required],
      role: ['student', Validators.required],
      center: ['', Validators.required]
    });

    this.cargarUsuarios();
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
    if (this.userForm.invalid) return;

    const datos = this.userForm.value as User;
    if (this.editing && this.editing.idUser) {
      this.userService.updateUser(this.editing.idUser, datos).subscribe(() => {
        this.cargarUsuarios();
        this.cancelarEdicion();
      });
    } else {
      this.userService.registerUser({ ...datos, policies: 1 }).subscribe(() => {
        this.cargarUsuarios();
        this.userForm.reset({ role: 'student' });
      });
    }
  }

  eliminar(user: User): void {
    if (!user.idUser) return;
    if (!confirm('¿Eliminar usuario?')) return;
    this.userService.deleteUser(user.idUser).subscribe(() => {
      this.cargarUsuarios();
    });
  }
}