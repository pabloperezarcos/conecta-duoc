import { inject, Injectable } from '@angular/core';
import { MsalService } from '@azure/msal-angular';
import { HttpClient } from '@angular/common/http';
import { User } from '../../models/user';
import { BehaviorSubject, Observable } from 'rxjs';

/**
 * Servicio responsable de gestionar la información de los usuarios
 * en la plataforma ConectaDuoc, incluyendo integración con Azure AD
 * y operaciones CRUD sobre la base de datos.
 */
@Injectable({
  providedIn: 'root'
})
export class UserService {
  /** URL base del API de usuarios */
  private apiUrl = 'http://localhost:9090/api/usuarios';
  //private apiUrl = 'https://yr3rp1l7fd.execute-api.us-east-1.amazonaws.com/api/usuarios';

  /** Servicio MSAL para autenticación con Azure Active Directory */
  private msalService = inject(MsalService);

  /** Cliente HTTP para interactuar con el backend vía API REST */
  private http = inject(HttpClient);

  /** Subject que mantiene el nombre del usuario en tiempo real */
  private userNameSubject = new BehaviorSubject<string | null>(null);

  /** Observable expuesto públicamente para suscribirse al nombre del usuario */
  userName$ = this.userNameSubject.asObservable();

  /**
   * Constructor del servicio.
   * Sincroniza el nombre del usuario desde Azure AD o localStorage,
   * y lo actualiza en el `BehaviorSubject` y almacenamiento local.
   */
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

  /**
   * Obtiene los datos del usuario actualmente autenticado mediante Azure AD.
   * @returns Objeto con email y nombre completo, o `null` si no hay sesión activa.
   */
  getAzureUser(): { email: string; fullName: string } | null {
    const account = this.msalService.instance.getActiveAccount();
    if (!account) return null;
    return {
      email: account.username,
      fullName: account.name || ''
    };
  }

  /**
   * Verifica si un usuario con el correo indicado ya está registrado.
   * @param email Correo institucional del usuario.
   * @returns `true` si existe, `false` si no.
   */
  checkUserExists(email: string): Observable<boolean> {
    const encodedEmail = encodeURIComponent(email);
    return this.http.get<boolean>(`${this.apiUrl}/exists/${encodedEmail}`);
  }

  /**
   * Registra un nuevo usuario en la base de datos.
   * @param user Objeto de tipo `User` con los datos del nuevo usuario.
   */
  registerUser(user: User): Observable<User> {
    return this.http.post<User>(this.apiUrl, user);
  }

  /**
   * Obtiene el usuario completo desde la base de datos según el correo.
   * @param email Correo del usuario.
   */
  getUser(email: string): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/${email}`);
  }

  /**
   * Guarda el rol del usuario en `localStorage` para uso en frontend.
   * @param role Rol del usuario (ej: "admin", "student").
   */
  setRole(role: string) {
    localStorage.setItem('userRole', role);
  }

  /** Obtiene el rol almacenado en `localStorage`. */
  getRole(): string | null {
    return localStorage.getItem('userRole');
  }

  /** Elimina el rol del usuario desde `localStorage`. */
  clearRole() {
    localStorage.removeItem('userRole');
  }

  /**
   * Guarda el nombre del usuario para mostrarlo en la interfaz.
   * @param name Nombre completo del usuario.
   */
  setName(name: string) {
    this.userNameSubject.next(name);
    localStorage.setItem('nombreUsuario', name);
  }

  /** Obtiene el nombre del usuario almacenado. */
  getName(): string | null {
    return localStorage.getItem('nombreUsuario');
  }

  /**
   * Guarda el ID del usuario autenticado.
   * @param idUser ID numérico del usuario.
   */
  setIdUser(idUser: number) {
    localStorage.setItem('idUser', idUser.toString());
  }

  /** Obtiene el ID del usuario almacenado. */
  getIdUser(): number | null {
    const raw = localStorage.getItem('idUser');
    return raw ? Number(raw) : null;
  }

  /**
   * Obtiene un usuario desde la base de datos por su ID.
   * @param idUser ID numérico del usuario.
   */
  getUserById(idUser: number): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/id/${idUser}`);
  }

  // ----------------------
  // Módulo de Configuraciones
  // ----------------------

  /** Obtiene todos los usuarios registrados. */
  getAll(): Observable<User[]> {
    return this.http.get<User[]>(this.apiUrl);
  }

  /**
   * Actualiza los datos de un usuario.
   * @param id ID del usuario a modificar.
   * @param user Nuevos datos del usuario.
   */
  updateUser(email: string, user: User): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/${email}`, user);
  }

  /**
   * Elimina un usuario por su ID.
   * @param id ID del usuario a eliminar.
   */
  deleteUser(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

}
