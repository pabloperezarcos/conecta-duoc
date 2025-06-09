import { Injectable } from '@angular/core';
import { MsalService } from '@azure/msal-angular';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(private msalService: MsalService) { }

  setRole(role: string) {
    localStorage.setItem('userRole', role);
  }

  getRole(): string | null {
    return localStorage.getItem('userRole');
  }

  clearRole() {
    localStorage.removeItem('userRole');
  }

  getUsername(): string | null {
    const account = this.msalService.instance.getActiveAccount();
    return account?.username || null;
  }

  getNombre(): string | null {
    return localStorage.getItem('nombre');
  }


}
