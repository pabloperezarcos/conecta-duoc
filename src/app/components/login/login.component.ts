import { Component, OnInit, inject } from '@angular/core';
import { MsalService } from '@azure/msal-angular';
import { Router } from '@angular/router';
import { UserService } from '../../core/services/user.service';
import { User } from '../../models/user';

/**
 * Componente responsable del inicio de sesión con Azure AD.
 * Valida si el usuario existe, redirige a registro o dashboard,
 * y maneja la lógica de aceptación de políticas.
 */
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  /** Servicio de autenticación MSAL para gestionar login y sesión con Azure AD */
  private msalService = inject(MsalService);

  /** Servicio de enrutamiento para redirigir al usuario según su estado */
  private router = inject(Router);

  /** Servicio encargado de manejar los datos del usuario en la app */
  private userService = inject(UserService);

  /** Título de la pantalla de inicio de sesión */
  title = 'Conecta-DUOC';

  /** Indica si el usuario está autenticado actualmente */
  isLoggedIn = false;

  /**
   * Al iniciar, verifica si ya hay una sesión activa.
   * Si existe, intenta redirigir al flujo correspondiente.
   */
  ngOnInit(): void {
    const account = this.msalService.instance.getActiveAccount();
    this.isLoggedIn = !!account;

    if (account) {
      this.checkAndRedirect(account.username);
    }
  }

  /**
   * Inicia sesión usando MSAL (popup).
   * Si es exitoso, valida al usuario en el backend y redirige.
   */
  login() {
    this.msalService.loginPopup().subscribe({
      next: () => {
        const account = this.msalService.instance.getAllAccounts()[0];
        this.msalService.instance.setActiveAccount(account);

        this.isLoggedIn = true;

        if (account) {
          this.checkAndRedirect(account.username);
        } else {
          this.isLoggedIn = false;
        }
      },
      error: (error) => {
        console.error('Login error:', error);
        this.isLoggedIn = false;
      },
    });
  }

  /**
   * Cierra sesión mediante MSAL y limpia los datos locales.
   */
  logout() {
    this.msalService.logoutPopup().subscribe({
      next: () => {
        this.isLoggedIn = false;
        this.userService.clearRole();
        this.router.navigate(['/']);
      },
      error: (error) => {
        console.error('Logout error:', error);
      },
    });
  }

  /**
   * Verifica si el usuario ya existe en la base de datos.
   * - Si no existe, lo redirige a la vista de registro.
   * - Si existe, guarda sus datos y lo redirige según si aceptó políticas.
   * @param email Correo del usuario autenticado por MSAL.
   */
  private checkAndRedirect(email: string) {
    this.userService.checkUserExists(email).subscribe({
      next: (exists) => {
        //console.log('Existe usuario?', exists);

        if (exists) {
          this.userService.getUser(email).subscribe({
            next: (user: User) => {
              this.userService.setRole(user.role || 'student');
              this.userService.setName(user.name);

              if (user.idUser !== undefined && user.idUser !== null) {
                this.userService.setIdUser(user.idUser);
              }

              if (user.policies === 1) {
                this.router.navigate(['/dashboard']);
              } else {
                this.router.navigate(['/reglas-de-la-comunidad']);
              }
            },
            error: err => {
              console.error('Error al traer usuario:', err);
            }
          });
        }

        else {
          console.log('Redirijo a registro');
          this.router.navigate(['/registro']);
        }
      },
      error: (err) => {
        console.error('Error validando usuario:', err);
        this.logout();
      }
    });
  }

}
