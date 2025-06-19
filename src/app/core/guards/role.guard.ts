import { inject, Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router } from '@angular/router';
import { UserService } from '../services/user.service';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {
  private userService = inject(UserService);
  private router = inject(Router);

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
