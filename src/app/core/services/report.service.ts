import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Report } from '../../models/report';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ReportService {
  private apiUrl = 'http://localhost:9090/api/reportes';
  private http = inject(HttpClient);

  // Reportar una publicación
  reportPost(idPost: number, reason: string): Observable<Report> {
    const report: Report = { idPost, reason, status: 1, date: new Date().toISOString() };
    return this.http.post<Report>(`${this.apiUrl}/publicacion`, report);
  }

  // Reportar un comentario
  reportComment(idComment: number, reason: string): Observable<Report> {
    const report: Report = { idComment, reason, status: 1, date: new Date().toISOString() };
    return this.http.post<Report>(`${this.apiUrl}/comentario`, report);
  }

  // Obtener todos los reportes (solo para administrador o revisión)
  getAllReports(): Observable<Report[]> {
    return this.http.get<Report[]>(`${this.apiUrl}`);
  }

  // Actualizar el estado de un reporte
  updateStatus(idReport: number, status: number): Observable<Report> {
    return this.http.put<Report>(`${this.apiUrl}/${idReport}`, { status });
  }
}