import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PostCategory } from '../../models/postCategory';

/**
 * Servicio para gestionar las categorías de publicaciones en ConectaDuoc.
 * Permite obtener, crear, actualizar y eliminar categorías.
 */
@Injectable({
  providedIn: 'root'
})
export class PostCategoryService {
  /** URL base del API para categorías de publicaciones */
  private apiUrl = 'http://localhost:9090/api/post-category';
  private http = inject(HttpClient);

  /**
   * Obtiene todas las categorías disponibles.
   * @returns Lista de objetos `PostCategory`.
   */
  getAll(): Observable<PostCategory[]> {
    return this.http.get<PostCategory[]>(this.apiUrl);
  }

  // ----------------------
  // Módulo de Configuraciones
  // ----------------------

  /**
   * Crea una nueva categoría.
   * @param category Objeto sin `idCategory`, ya que es generado por el backend.
   * @returns Categoría creada.
   */
  create(category: Omit<PostCategory, 'idCategory'>): Observable<PostCategory> {
    return this.http.post<PostCategory>(this.apiUrl, category);
  }

  /**
   * Actualiza una categoría existente.
   * @param id ID de la categoría a actualizar.
   * @param category Objeto `PostCategory` con los nuevos valores.
   * @returns Categoría actualizada.
   */
  update(id: number, category: PostCategory): Observable<PostCategory> {
    return this.http.put<PostCategory>(`${this.apiUrl}/${id}`, category);
  }

  /**
   * Elimina una categoría por su ID.
   * @param id ID de la categoría a eliminar.
   */
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

}
