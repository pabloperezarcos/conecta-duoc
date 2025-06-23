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
}
