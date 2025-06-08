import { Injectable } from '@angular/core';
import { Publicacion } from '../../models/publicacion';

@Injectable({
  providedIn: 'root'
})
export class PublicacionesService {
  private publicaciones: Publicacion[] = [];
  private idCounter = 1;

  getAll(): Publicacion[] {
    return this.publicaciones;
  }

  crear(publicacion: Omit<Publicacion, 'id' | 'fecha'>): void {
    const nueva: Publicacion = {
      ...publicacion,
      id: this.idCounter++,
      fecha: new Date().toISOString(),
      visitas: Math.floor(Math.random() * 100),
      comentarios: []
    };

    this.publicaciones.unshift(nueva);
  }
}
