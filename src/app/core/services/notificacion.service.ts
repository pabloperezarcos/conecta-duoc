import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { NotificacionGlobal } from '../../models/notificacionGlobal';
import { Observable } from 'rxjs';

/**
 * Servicio encargado de gestionar las notificaciones globales
 * visibles para todos los usuarios de la plataforma.
 */
@Injectable({
  providedIn: 'root'
})
export class NotificacionService {
  /** URL base del API para notificaciones globales */
  private apiUrl = 'http://localhost:9090/api/notificaciones';

  constructor(private http: HttpClient) { }

  /**
   * Obtiene todas las notificaciones registradas (vigentes e históricas).
   * @returns Arreglo de `NotificacionGlobal`.
   */
  getTodas(): Observable<NotificacionGlobal[]> {
    return this.http.get<NotificacionGlobal[]>(this.apiUrl);
  }

  /**
   * Crea una nueva notificación global.
   * @param nueva Objeto de tipo `NotificacionGlobal` a registrar.
   * @returns Notificación creada.
   */
  crear(nueva: NotificacionGlobal): Observable<NotificacionGlobal> {
    return this.http.post<NotificacionGlobal>(this.apiUrl, nueva);
  }

  /**
   * Elimina una notificación global por su ID.
   * @param id ID de la notificación a eliminar.
   */
  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  /**
   * Obtiene solo las notificaciones vigentes (activas según fecha actual).
   * @returns Arreglo de notificaciones activas.
   */
  getVigentes(): Observable<NotificacionGlobal[]> {
    return this.http.get<NotificacionGlobal[]>(`${this.apiUrl}/vigentes`);
  }
}
