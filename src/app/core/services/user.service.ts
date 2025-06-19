import { Injectable } from '@angular/core';
import { MsalService } from '@azure/msal-angular';
import { HttpClient } from '@angular/common/http';
import { User } from '../../models/user';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private apiUrl = 'https://tu-backend-url.com/api/users';

  constructor(private msalService: MsalService, private http: HttpClient) { }

  // Obtener el usuario actual desde Azure AD
  getAzureUser(): { email: string; fullName: string } | null {
    const account = this.msalService.instance.getActiveAccount();
    if (!account) return null;
    return {
      email: account.username,
      fullName: account.name || ''
    };
  }

  // Buscar si el usuario ya está registrado en la base de datos
  checkUserExists(email: string): Observable<boolean> {
    return this.http.get<boolean>(`${this.apiUrl}/exists/${email}`);
  }

  // Registrar usuario nuevo
  registerUser(user: User): Observable<User> {
    return this.http.post<User>(this.apiUrl, user);
  }

  // Obtener el usuario completo desde la BD
  getUser(email: string): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/${email}`);
  }

  // Guardar el rol en localStorage (por conveniencia de uso en frontend)
  setRole(role: string) {
    localStorage.setItem('userRole', role);
  }

  getRole(): string | null {
    return localStorage.getItem('userRole');
  }

  clearRole() {
    localStorage.removeItem('userRole');
  }

  // Guardar nombre también si quieres mostrarlo en el UI
  setName(name: string) {
    localStorage.setItem('name', name);
  }

  getName(): string | null {
    return localStorage.getItem('name');
  }
}
