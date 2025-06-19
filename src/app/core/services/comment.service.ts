import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Comment } from '../../models/post';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CommentService {
  private apiUrl = 'https://tu-backend-url.com/api/comments';
  private http = inject(HttpClient);

  // Obtener todos los comentarios de un post
  getByPostId(idPost: number): Observable<Comment[]> {
    return this.http.get<Comment[]>(`${this.apiUrl}?idPost=${idPost}`);
  }

  // Crear un nuevo comentario
  create(comment: Omit<Comment, 'idComment' | 'date'>): Observable<Comment> {
    return this.http.post<Comment>(this.apiUrl, comment);
  }

  // (Opcional) Eliminar comentario
  delete(idComment: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${idComment}`);
  }

  // (Opcional) Editar comentario
  update(idComment: number, content: string): Observable<Comment> {
    return this.http.put<Comment>(`${this.apiUrl}/${idComment}`, { content });
  }
}
