import { inject, Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router } from '@angular/router';
import { UserService } from '../services/user.service';

/**
 * Guard de rutas que restringe el acceso según el rol del usuario.
 * Se basa en la información almacenada en `localStorage` por el `UserService`.
 */
@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {
  private userService = inject(UserService);
  private router = inject(Router);

  /**
   * Verifica si el usuario tiene uno de los roles esperados para acceder a una ruta.
   * Si no cumple, redirige a la raíz y niega el acceso.
   *
   * @param route Snapshot de la ruta actual.
   * @returns `true` si el usuario tiene el rol adecuado, `false` en caso contrario.
   */
  canActivate(route: ActivatedRouteSnapshot): boolean {
    const expectedRoles: string[] = route.data['expectedRoles'];
    const userRole = this.userService.getRole();

    if (!userRole || !expectedRoles.includes(userRole)) {
      console.warn(`Acceso Denegado. Rol "${userRole}" no está autorizado para esta ruta.`);
      this.router.navigate(['/']);
      return false;
    }

    return true;
  }
}
