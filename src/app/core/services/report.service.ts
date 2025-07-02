import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Report } from '../../models/report';
import { Observable } from 'rxjs';
import { UserService } from './user.service';

/**
 * Servicio encargado de gestionar reportes (denuncias) sobre publicaciones
 * y comentarios en la plataforma ConectaDuoc.
 */
@Injectable({
  providedIn: 'root'
})
export class ReportService {
  /** URL base del API para reportes */
  private apiUrl = 'http://localhost:9090/api/report';
  private http = inject(HttpClient);
  private userService = inject(UserService);

  /**
   * Envía un reporte sobre una publicación específica.
   * @param idPost ID de la publicación a reportar.
   * @param reason Motivo del reporte.
   * @returns Observable con el reporte creado.
   */
  reportPost(idPost: number, reason: string): Observable<Report> {
    const idUser = this.userService.getIdUser();

    const now = new Date();
    const localDateTime = now.getFullYear() + '-' +
      String(now.getMonth() + 1).padStart(2, '0') + '-' +
      String(now.getDate()).padStart(2, '0') + 'T' +
      String(now.getHours()).padStart(2, '0') + ':' +
      String(now.getMinutes()).padStart(2, '0') + ':' +
      String(now.getSeconds()).padStart(2, '0');

    const report: Report = {
      idPost,
      reason,
      status: 1,
      createdDate: localDateTime,
      idUser: idUser!
    };

    return this.http.post<Report>(`${this.apiUrl}/publicacion`, report);
  }

  /**
   * Envía un reporte sobre un comentario específico.
   * @param idComment ID del comentario a reportar.
   * @param reason Motivo del reporte.
   * @returns Observable con el reporte creado.
   */
  reportComment(idComment: number, reason: string): Observable<Report> {
    const idUser = this.userService.getIdUser();
    const report: Report = {
      idComment,
      reason,
      status: 1,
      createdDate: new Date().toISOString(),
      idUser: idUser!
    };
    return this.http.post<Report>(`${this.apiUrl}/comentario`, report);
  }

  /**
   * Obtiene todos los reportes registrados en el sistema.
   * Generalmente usado por el administrador para revisión y gestión.
   * @returns Lista de objetos `Report`.
   */
  getAllReports(): Observable<Report[]> {
    return this.http.get<Report[]>(`${this.apiUrl}`);
  }

  /**
   * Actualiza el estado de un reporte (por ejemplo, para marcarlo como revisado).
   * @param idReport ID del reporte a modificar.
   * @param status Nuevo estado (0 = inactivo, 1 = activo).
   * @returns Reporte actualizado.
   */
  updateStatus(idReport: number, status: number): Observable<Report> {
    return this.http.put<Report>(`${this.apiUrl}/${idReport}`, { status });
  }
}