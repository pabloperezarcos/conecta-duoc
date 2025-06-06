export interface Publicacion {
    id: number;
    titulo: string;
    descripcion: string;
    fecha: string;
    autor: string;
    sede: string;
    comentarios?: Comentario[];
}

export interface Comentario {
    id: number;
    texto: string;
    autor: string;
    fecha: string;
}