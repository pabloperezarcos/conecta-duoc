import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Post } from '../../models/post';
import { Observable } from 'rxjs';

/**
 * Servicio encargado de gestionar las publicaciones en ConectaDuoc.
 * Permite crear, obtener, eliminar publicaciones y registrar visualizaciones.
 */
@Injectable({
  providedIn: 'root'
})
export class PostService {
  /** URL base del API para publicaciones */
  //private apiUrl = 'http://localhost:9090/api/post';
  private apiUrl = 'https://8d20h7wiag.execute-api.us-east-2.amazonaws.com/api/post';

  /** Cliente HTTP utilizado para realizar peticiones al backend */
  private http = inject(HttpClient);

  /**
   * Obtiene todas las publicaciones o filtra por categoría si se indica.
   * @param categoryId (Opcional) ID de la categoría para filtrar publicaciones.
   * @returns Lista de publicaciones.
   */
  getAll(categoryId?: number): Observable<Post[]> {
    if (categoryId) {
      return this.http.get<Post[]>(`${this.apiUrl}?idCategory=${categoryId}`);
    }
    return this.http.get<Post[]>(this.apiUrl);
  }

  /**
   * Obtiene una publicación específica por su ID.
   * @param idPost ID de la publicación.
   * @returns Objeto `Post`.
   */
  getById(idPost: number): Observable<Post> {
    return this.http.get<Post>(`${this.apiUrl}/${idPost}`);
  }

  /**
   * Crea una nueva publicación en la base de datos.
   * El ID, fecha y visualizaciones serán generadas automáticamente por el backend.
   * @param post Objeto con los datos de la publicación (sin `idPost`, `createdDate` ni `views`).
   * @returns Publicación creada.
   */
  createPost(post: Omit<Post, 'idPost' | 'createdDate' | 'views'>): Observable<Post> {
    return this.http.post<Post>(this.apiUrl, post);
  }

  /**
   * Elimina una publicación por su ID.
   * (Solo si esta acción está permitida por reglas del sistema).
   * @param idPost ID de la publicación a eliminar.
   */
  delete(idPost: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${idPost}`);
  }


  /**
   * Registra una nueva visualización para una publicación.
   * @param idPost ID de la publicación visualizada.
   */
  sumarVisualizacion(idPost: number): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${idPost}/view`, {});
  }

}
