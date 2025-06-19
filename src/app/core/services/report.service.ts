import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Report } from '../../models/report';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ReportService {
  private apiUrl = 'https://tu-backend-url.com/api/reports';
  private http = inject(HttpClient);

  // Reportar una publicación
  reportPost(idPost: number, reason: string): Observable<Report> {
    const report: Report = {
      idPost,
      reason,
      status: true,
      date: new Date().toISOString()
    };
    return this.http.post<Report>(`${this.apiUrl}`, report);
  }

  // Reportar un comentario
  reportComment(idComment: number, reason: string): Observable<Report> {
    const report: Report = {
      idComment,
      reason,
      status: true,
      date: new Date().toISOString()
    };
    return this.http.post<Report>(`${this.apiUrl}`, report);
  }

  // Obtener todos los reportes (solo para administrador o revisión)
  getAllReports(): Observable<Report[]> {
    return this.http.get<Report[]>(`${this.apiUrl}`);
  }
}