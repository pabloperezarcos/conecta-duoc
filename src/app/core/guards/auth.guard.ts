import { inject, Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { MsalService } from '@azure/msal-angular';

/**
 * Guard para proteger rutas mediante la autenticación de MSAL (Microsoft Authentication Library).
 */
@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  private msalService = inject(MsalService);
  private router = inject(Router);

  /**
   * Verifica si el usuario tiene una sesión activa para permitir el acceso a la ruta protegida.
   * @returns `true` si el usuario está autenticado, de lo contrario, redirige al inicio de sesión y retorna `false`.
   */
  canActivate(): boolean {
    const account = this.msalService.instance.getActiveAccount();

    if (account) {
      // Usuario autenticado
      return true;
    } else {
      // Usuario no autenticado, redirigir al login
      console.warn('No se encontró una cuenta activa, redirigiendo al inicio de sesión.');
      this.router.navigate(['/']);
      return false;
    }
  }
}
// Este guard se utiliza para proteger rutas que requieren autenticación.
// Si el usuario no está autenticado, se le redirige a la página de inicio de sesión.