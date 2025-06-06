import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { RouterLink } from '@angular/router';
import { UserService } from '../../core/services/user.service';
import { MsalService } from '@azure/msal-angular';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent {
  username: string | null = null;

  constructor(private userService: UserService, private router: Router, private msal: MsalService) {
    this.username = this.userService.getUsername();
  }

  logout() {
    this.msal.logoutPopup().subscribe({
      next: () => {
        this.userService.clearRole();
        this.router.navigate(['/']);
      }
    });
  }
}
