import { Injectable } from '@angular/core';
import { MsalService } from '@azure/msal-angular';

@Injectable({
  providedIn: 'root'
})
export class RoleService {

  constructor(private msalService: MsalService) { }

  getUserRoles(): string[] {
    const account = this.msalService.instance.getActiveAccount();
    const idTokenClaims = account?.idTokenClaims as any;

    if (idTokenClaims && idTokenClaims.roles) {
      return idTokenClaims.roles;
    }

    return [];
  }

  hasRole(expectedRole: string): boolean {
    return this.getUserRoles().includes(expectedRole);
  }
}
