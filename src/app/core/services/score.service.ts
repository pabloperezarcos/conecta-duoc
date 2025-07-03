import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Score } from '../../models/post';

/**
 * Servicio encargado de gestionar las puntuaciones (scores) de las publicaciones
 * en la plataforma ConectaDuoc. Permite registrar, consultar y calcular promedios
 * según publicaciones y usuarios.
 */
@Injectable({
  providedIn: 'root'
})
export class ScoreService {
  /** URL base del API de puntuaciones */
  private apiUrl = 'http://localhost:9090/api/score';

  /** Cliente HTTP utilizado para realizar peticiones al backend */
  private http = inject(HttpClient);

  /**
   * Obtiene el promedio de puntuación de una publicación.
   * @param idPost ID de la publicación.
   * @returns Valor promedio (ej: 4.2).
   */
  getAverageScore(idPost: number): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/average/${idPost}`);
  }

  /**
   * Obtiene la puntuación que un usuario le dio a una publicación específica.
   * @param idPost ID de la publicación.
   * @param idUser ID del usuario.
   * @returns Objeto `Score` o `null` si el usuario no ha votado.
   */
  getUserScore(idPost: number, idUser: number): Observable<Score | null> {
    return this.http.get<Score | null>(`${this.apiUrl}/user/${idUser}/post/${idPost}`);
  }

  /**
   * Registra o actualiza la puntuación de un usuario sobre una publicación.
   * @param score Objeto `Score` con los datos a guardar.
   */
  setScore(score: Score): Observable<Score> {
    return this.http.post<Score>(`${this.apiUrl}/save`, score);
  }

  /**
   * Obtiene un resumen de puntuaciones del usuario, incluyendo promedio general
   * y su propia puntuación en cada publicación.
   * @param idUser ID del usuario.
   * @param idCategoria (opcional) ID de la categoría a filtrar.
   * @returns Arreglo de objetos con ID del post, promedio y puntuación personal.
   */
  getResumenScores(idUser: number, idCategoria?: number): Observable<{ idPost: number; promedio: number; miScore: number | null }[]> {
    let url = `${this.apiUrl}/resumen?idUser=${idUser}`;
    if (idCategoria !== undefined) url += `&idCategoria=${idCategoria}`;
    return this.http.get<{ idPost: number; promedio: number; miScore: number | null }[]>(url);
  }

}