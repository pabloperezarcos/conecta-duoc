import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { NotificacionGlobal } from '../../models/notificacionGlobal';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NotificacionService {
  private apiUrl = 'http://localhost:9090/api/notificaciones';

  constructor(private http: HttpClient) { }

  getTodas(): Observable<NotificacionGlobal[]> {
    return this.http.get<NotificacionGlobal[]>(this.apiUrl);
  }

  crear(nueva: NotificacionGlobal): Observable<NotificacionGlobal> {
    return this.http.post<NotificacionGlobal>(this.apiUrl, nueva);
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getVigentes(): Observable<NotificacionGlobal[]> {
    return this.http.get<NotificacionGlobal[]>(`${this.apiUrl}/vigentes`);
  }
}
