import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class RoleService {

  // Obtener el rol actual desde localStorage
  getRole(): string | null {
    return localStorage.getItem('userRole');
  }

  // Verifica si el usuario tiene un rol específico
  hasRole(expectedRole: string): boolean {
    const role = this.getRole();
    return role === expectedRole;
  }

  // Verifica si el usuario es admin
  isAdmin(): boolean {
    return this.getRole() === 'admin';
  }

  // Verifica si el usuario es estudiante
  isStudent(): boolean {
    return this.getRole() === 'student';
  }
}
