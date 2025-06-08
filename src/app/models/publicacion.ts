export interface Publicacion {
    id: number;
    titulo: string;
    descripcion: string;
    categoria: string;
    fecha: string;
    autor: string;
    sede: string;
    comentarios: Comentario[];
    visitas?: number;
}

export interface Comentario {
    id: number;
    texto: string;
    autor: string;
    fecha: string;
}