import { Component, OnInit, inject } from '@angular/core';
import { MsalService } from '@azure/msal-angular';

import { Router } from '@angular/router';
import { UserService } from '../../core/services/user.service';
import { User } from '../../models/user';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  private msalService = inject(MsalService);
  private router = inject(Router);
  private userService = inject(UserService);

  title = 'Conecta-DUOC';
  isLoggedIn = false;

  ngOnInit(): void {
    const account = this.msalService.instance.getActiveAccount();
    this.isLoggedIn = !!account;

    if (account) {
      this.checkAndRedirect(account.username);
    }
  }

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
   * Verifica si el usuario existe en la BD, si no existe lo fuerza a registrarse,
   * y si existe revisa si aceptó políticas para redirigirlo correctamente.
   */
  private checkAndRedirect(email: string) {
    this.userService.checkUserExists(email).subscribe({
      next: (exists) => {
        if (exists) {
          // Trae el usuario completo para guardar rol y otros datos en localStorage
          this.userService.getUser(email).subscribe({
            next: (user: User) => {
              this.userService.setRole(user.role || 'student');
              this.userService.setName(user.name);

              // Verifica si aceptó las políticas
              if (user.policies) {
                this.router.navigate(['/dashboard']);
              } else {
                this.router.navigate(['/reglas-de-la-comunidad']);
              }
            }
          });
        } else {
          // Redirige al registro (o muestra modal de registro)
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
