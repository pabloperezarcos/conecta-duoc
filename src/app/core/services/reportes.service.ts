import { Injectable } from '@angular/core';
import { Publicacion, Comentario } from '../../models/publicacion';

export interface ReportePublicacion {
  categoria: string;
  publicacion: Publicacion;
}

export interface ReporteComentario {
  categoria: string;
  publicacionId: number;
  comentario: Comentario;
}

@Injectable({
  providedIn: 'root'
})
export class ReportesService {
  private publicaciones: ReportePublicacion[] = [];
  private comentarios: ReporteComentario[] = [];

  reportarPublicacion(categoria: string, publicacion: Publicacion): void {
    this.publicaciones.push({ categoria, publicacion });
  }

  reportarComentario(categoria: string, publicacionId: number, comentario: Comentario): void {
    this.comentarios.push({ categoria, publicacionId, comentario });
  }

  getPublicacionesReportadas(): ReportePublicacion[] {
    return this.publicaciones;
  }

  getComentariosReportados(): ReporteComentario[] {
    return this.comentarios;
  }
}
