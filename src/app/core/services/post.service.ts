import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Post } from '../../models/post';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PostService {
  private apiUrl = 'http://localhost:9090/api/post';
  private http = inject(HttpClient);

  // Obtener todas las publicaciones (opcional: por categoría)
  getAll(categoryId?: number): Observable<Post[]> {
    if (categoryId) {
      return this.http.get<Post[]>(`${this.apiUrl}?idCategory=${categoryId}`);
    }
    return this.http.get<Post[]>(this.apiUrl);
  }

  // Obtener una publicación por ID
  getById(idPost: number): Observable<Post> {
    return this.http.get<Post>(`${this.apiUrl}/${idPost}`);
  }

  // Crear una nueva publicación
  createPost(post: Omit<Post, 'idPost' | 'createdDate' | 'views'>): Observable<Post> {
    return this.http.post<Post>(this.apiUrl, post);
  }

  // Eliminar una publicación (si decides permitirlo)
  delete(idPost: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${idPost}`);
  }

  /* ADICIONALES */
  // Sumar una visualización a un post
  sumarVisualizacion(idPost: number): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${idPost}/view`, {});
  }






}
