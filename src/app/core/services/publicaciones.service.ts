import { Injectable } from '@angular/core';
import { Publicacion } from '../../models/publicacion';

@Injectable({
  providedIn: 'root'
})
export class PublicacionesService {
  private publicaciones: { [categoria: string]: Publicacion[] } = {};
  private idCounter = 1;

  private ensureCategoria(categoria: string): void {
    if (!this.publicaciones[categoria]) {
      this.publicaciones[categoria] = [];
    }
  }

  getAll(categoria?: string): Publicacion[] {
    if (categoria) {
      this.ensureCategoria(categoria);
      return this.publicaciones[categoria];
    }
    return Object.values(this.publicaciones).flat();
  }

  getById(categoria: string, id: number): Publicacion | undefined {
    this.ensureCategoria(categoria);
    return this.publicaciones[categoria].find(p => p.id === id);
  }

  crear(categoria: string, publicacion: Omit<Publicacion, 'id' | 'fecha' | 'categoria'>): void {
    this.ensureCategoria(categoria);
    const nueva: Publicacion = {
      ...publicacion,
      categoria,
      id: this.idCounter++,
      fecha: new Date().toISOString(),
      visitas: Math.floor(Math.random() * 100),
      comentarios: []
    };

    this.publicaciones[categoria].unshift(nueva);
  }
}
