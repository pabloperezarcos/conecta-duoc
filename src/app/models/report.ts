import { Post } from "./post";

export interface Report {
    idReport?: number;
    idPost?: number;
    idComment?: number;
    reason: string;
    status: number; // 0 Inactivo, 1 Activo
    createdDate: string;
    idUser: number;

    post?: Post;
    comment?: Comment;
    resolucion?: 'concedido' | 'rechazado';
}
