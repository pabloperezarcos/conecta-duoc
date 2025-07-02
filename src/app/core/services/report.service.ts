import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Report } from '../../models/report';
import { Observable } from 'rxjs';
import { UserService } from './user.service';

@Injectable({
  providedIn: 'root'
})
export class ReportService {
  private apiUrl = 'http://localhost:9090/api/report';
  private http = inject(HttpClient);
  private userService = inject(UserService);

  // Reportar una publicación
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


  // Reportar un comentario
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

  // Obtener todos los reportes
  getAllReports(): Observable<Report[]> {
    return this.http.get<Report[]>(`${this.apiUrl}`);
  }

  // Actualizar estado (opcional si lo implementas en backend)
  updateStatus(idReport: number, status: number): Observable<Report> {
    return this.http.put<Report>(`${this.apiUrl}/${idReport}`, { status });
  }
}