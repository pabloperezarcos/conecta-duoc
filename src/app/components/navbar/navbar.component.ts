import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { RouterLink } from '@angular/router';
import { UserService } from '../../core/services/user.service';
import { MsalService } from '@azure/msal-angular';
import { ModalConfirmacionComponent } from '../../shared/modal-confirmacion/modal-confirmacion.component';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, ModalConfirmacionComponent, CommonModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {
  private userService = inject(UserService);
  private router = inject(Router);
  private msal = inject(MsalService);

  username: string | null = null;
  mostrarModalLogout = false;
  userName$ = this.userService.userName$;


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

  logout() {
    this.mostrarModalLogout = true;
  }

  confirmarLogout() {
    this.msal.logoutPopup().subscribe({
      next: () => {
        this.userService.clearRole();
        // Si limpias más datos en logout, hazlo aquí
        this.router.navigate(['/']);
      }
    });
  }

  cancelarLogout() {
    this.mostrarModalLogout = false;
  }
}
