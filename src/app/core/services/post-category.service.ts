import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PostCategory } from '../../models/postCategory';

@Injectable({
  providedIn: 'root'
})
export class PostCategoryService {
  private apiUrl = 'https://tu-backend-url.com/api/post-categories';

  constructor(private http: HttpClient) { }

  getAll(): Observable<PostCategory[]> {
    return this.http.get<PostCategory[]>(this.apiUrl);
  }
}
