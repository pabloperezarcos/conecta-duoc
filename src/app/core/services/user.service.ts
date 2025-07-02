import { inject, Injectable } from '@angular/core';
import { MsalService } from '@azure/msal-angular';
import { HttpClient } from '@angular/common/http';
import { User } from '../../models/user';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = 'http://localhost:9090/api/usuarios';
  //private apiUrl = 'https://yr3rp1l7fd.execute-api.us-east-1.amazonaws.com/api/usuarios';
  private msalService = inject(MsalService);
  private http = inject(HttpClient);

  private userNameSubject = new BehaviorSubject<string | null>(null);
  userName$ = this.userNameSubject.asObservable();

  constructor() {
    const account = this.msalService.instance.getActiveAccount();
    const localName = localStorage.getItem('nombreUsuario');

    if (account && !localName) {
      const fullName = account.name || account.username || 'Desconocido';
      this.setName(fullName); // guarda en BehaviorSubject + localStorage
    } else if (localName) {
      this.userNameSubject.next(localName); // sincroniza el observable
    }
  }


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
    const encodedEmail = encodeURIComponent(email);
    return this.http.get<boolean>(`${this.apiUrl}/exists/${encodedEmail}`);
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
    this.userNameSubject.next(name);
    localStorage.setItem('nombreUsuario', name);
  }

  getName(): string | null {
    return localStorage.getItem('nombreUsuario');
  }


  setIdUser(idUser: number) {
    localStorage.setItem('idUser', idUser.toString());
  }

  getIdUser(): number | null {
    const raw = localStorage.getItem('idUser');
    return raw ? Number(raw) : null;
  }

  getUserById(idUser: number): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/id/${idUser}`);
  }


  /* ADICIONALES PARA MODULO DE CONFIGURACIONES */

  // Obtener todos los usuarios
  getAll(): Observable<User[]> {
    return this.http.get<User[]>(this.apiUrl);
  }

  // Actualizar usuario
  updateUser(email: string, user: User): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/${email}`, user);
  }

  // Eliminar usuario
  deleteUser(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }



}
