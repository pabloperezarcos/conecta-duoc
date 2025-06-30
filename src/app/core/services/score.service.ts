import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Score } from '../../models/post';

@Injectable({
  providedIn: 'root'
})
export class ScoreService {
  private apiUrl = 'http://localhost:9090/api/score';
  private http = inject(HttpClient);

  getAverageScore(idPost: number): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/average/${idPost}`);
  }

  getUserScore(idPost: number, idUser: number): Observable<Score | null> {
    return this.http.get<Score | null>(`${this.apiUrl}/user/${idUser}/post/${idPost}`);
  }

  setScore(score: Score): Observable<Score> {
    return this.http.post<Score>(`${this.apiUrl}/save`, score);
  }

  getResumenScores(idUser: number, idCategoria?: number): Observable<{ idPost: number; promedio: number; miScore: number | null }[]> {
    let url = `${this.apiUrl}/resumen?idUser=${idUser}`;
    if (idCategoria !== undefined) url += `&idCategoria=${idCategoria}`;
    return this.http.get<{ idPost: number; promedio: number; miScore: number | null }[]>(url);
  }

}