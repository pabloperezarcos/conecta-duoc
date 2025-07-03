import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { RouterLink } from '@angular/router';
import { UserService } from '../../core/services/user.service';
import { MsalService } from '@azure/msal-angular';
import { ModalConfirmacionComponent } from '../../shared/modal-confirmacion/modal-confirmacion.component';

/**
 * Componente de barra de navegación superior.
 * Muestra el nombre del usuario, permite navegar y cerrar sesión.
 */
@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, ModalConfirmacionComponent, CommonModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {
  /** Servicio de autenticación MSAL para gestionar login y sesión con Azure AD */
  private msal = inject(MsalService);

  /** Servicio de enrutamiento para redirigir al usuario según su estado */
  private router = inject(Router);

  /** Servicio encargado de manejar los datos del usuario en la app */
  private userService = inject(UserService);


  /** Nombre del usuario visible en el navbar */
  username: string | null = null;

  /** Controla la visibilidad del modal de confirmación de cierre de sesión */
  mostrarModalLogout = false;

  /** Observable del nombre de usuario para actualizaciones reactivas */
  userName$ = this.userService.userName$;

  /**
   * Al iniciar, obtiene el nombre del usuario desde el servicio MSAL o `localStorage`.
   */
  ngOnInit(): void {
    // Mostrar en consola todos los datos del usuario activo de Azure AD
    const account = this.msal.instance.getActiveAccount();
    //if (account) {
    //console.log('ACCOUNT:', account);
    //console.log('ID TOKEN CLAIMS:', account.idTokenClaims);
    //}

    // Obtener el nombre de usuario desde el servicio UserService
    this.username =
      this.userService.getName() ||
      this.userService.getAzureUser()?.fullName ||
      this.userService.getAzureUser()?.email ||
      null;
  }

  /**
   * Muestra el modal de confirmación para cerrar sesión.
   */
  logout() {
    this.mostrarModalLogout = true;
  }

  /**
   * Cierra la sesión del usuario usando MSAL y limpia los datos locales.
   */
  confirmarLogout() {
    this.msal.logoutPopup().subscribe({
      next: () => {
        this.userService.clearRole();
        // Si limpias más datos en logout, hazlo aquí
        this.router.navigate(['/']);
      }
    });
  }

  /**
   * Cancela el cierre de sesión y cierra el modal.
   */
  cancelarLogout() {
    this.mostrarModalLogout = false;
  }

}
