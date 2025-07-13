import { Injectable } from '@angular/core';

/**
 * Servicio para la gestión de roles de usuario en la aplicación.
 * Utiliza `localStorage` para almacenar y verificar el rol actual.
 */
@Injectable({
  providedIn: 'root'
})
export class RoleService {

  private readonly STORAGE_KEY = 'userRole';

  setRole(role: string): void {
    localStorage.setItem(this.STORAGE_KEY, role);
  }

  clearRole(): void {
    localStorage.removeItem(this.STORAGE_KEY);
  }

  /**
   * Obtiene el rol actual almacenado en `localStorage`.
   * @returns Rol como string (ej: 'admin', 'student') o `null` si no está definido.
   */
  getRole(): string | null {
    //return localStorage.getItem('userRole');
    const role = localStorage.getItem(this.STORAGE_KEY);
    return role ? role : null; 
  }

  /**
   * Verifica si el usuario tiene el rol esperado.
   * @param expectedRole Rol que se desea verificar.
   * @returns `true` si el rol coincide, `false` en caso contrario.
   */
  hasRole(expectedRole: string): boolean {
    const role = this.getRole();
    return role === expectedRole;
  }

  /**
   * Verifica si el rol actual corresponde a un administrador.
   * @returns `true` si es 'admin', `false` en caso contrario.
   */
  isAdmin(): boolean {
    return this.getRole() === 'admin';
  }

  /**
   * Verifica si el rol actual corresponde a un estudiante.
   * @returns `true` si es 'student', `false` en caso contrario.
   */
  isStudent(): boolean {
    return this.getRole() === 'student';
  }
}
