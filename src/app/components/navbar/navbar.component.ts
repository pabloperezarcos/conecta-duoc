import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { RouterLink } from '@angular/router';
import { UserService } from '../../core/services/user.service';
import { MsalService } from '@azure/msal-angular';
import { ModalConfirmacionComponent } from '../../shared/modal-confirmacion/modal-confirmacion.component';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, ModalConfirmacionComponent],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent {
  username: string | null = null;
  mostrarModalLogout = false;

  constructor(private userService: UserService, private router: Router, private msal: MsalService) {
    this.username = this.userService.getUsername();
  }

  logout() {
    this.mostrarModalLogout = true;
  }

  confirmarLogout() {
    this.msal.logoutPopup().subscribe({
      next: () => {
        this.userService.clearRole();
        this.router.navigate(['/']);
      }
    });
  }

  cancelarLogout() {
    this.mostrarModalLogout = false;
  }
}
