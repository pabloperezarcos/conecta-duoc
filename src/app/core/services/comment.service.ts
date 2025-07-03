import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Comment } from '../../models/post';
import { Observable } from 'rxjs';

/**
 * Servicio encargado de gestionar los comentarios en las publicaciones de ConectaDuoc.
 * Permite obtener, crear, editar y eliminar comentarios.
 */
@Injectable({
  providedIn: 'root'
})
export class CommentService {
  /** URL base del API para comentarios */
  private apiUrl = 'http://localhost:9090/api/comment';

  /** Cliente HTTP utilizado para realizar peticiones al backend */
  private http = inject(HttpClient);

  /**
   * Obtiene todos los comentarios asociados a una publicación.
   * @param idPost ID de la publicación.
   * @returns Lista de comentarios.
   */
  getByPostId(idPost: number): Observable<Comment[]> {
    return this.http.get<Comment[]>(`${this.apiUrl}?idPost=${idPost}`);
  }

  /**
   * Crea un nuevo comentario en una publicación.
   * @param comment Objeto `Comment` sin `idComment` ni `date`, que serán generados por el backend.
   * @returns Comentario creado.
   */
  create(comment: Omit<Comment, 'idComment' | 'date'>): Observable<Comment> {
    return this.http.post<Comment>(this.apiUrl, comment);
  }

  /**
   * Elimina un comentario por su ID.
   * (Requiere permisos adecuados).
   * @param idComment ID del comentario a eliminar.
   */
  delete(idComment: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${idComment}`);
  }

  /**
   * Actualiza el contenido de un comentario existente.
   * @param idComment ID del comentario.
   * @param content Nuevo contenido del comentario.
   * @returns Comentario actualizado.
   */
  update(idComment: number, content: string): Observable<Comment> {
    return this.http.put<Comment>(`${this.apiUrl}/${idComment}`, { content });
  }

}
