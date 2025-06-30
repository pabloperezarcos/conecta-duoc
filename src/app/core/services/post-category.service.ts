import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PostCategory } from '../../models/postCategory';

@Injectable({
  providedIn: 'root'
})
export class PostCategoryService {
  private apiUrl = 'http://localhost:9090/api/post-category';
  private http = inject(HttpClient);

  getAll(): Observable<PostCategory[]> {
    return this.http.get<PostCategory[]>(this.apiUrl);
  }

  /* ADICIONALES PARA MODULO DE CONFIGURACIONES */

  create(category: Omit<PostCategory, 'idCategory'>): Observable<PostCategory> {
    return this.http.post<PostCategory>(this.apiUrl, category);
  }

  update(id: number, category: PostCategory): Observable<PostCategory> {
    return this.http.put<PostCategory>(`${this.apiUrl}/${id}`, category);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
