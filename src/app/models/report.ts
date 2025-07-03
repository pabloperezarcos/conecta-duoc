import { Post } from "./post";

/**
 * Representa un reporte generado por un usuario sobre una publicación o comentario.
 */

export interface Report {
    /** ID único del reporte */
    idReport?: number;

    /** ID de la publicación reportada (si aplica) */
    idPost?: number;

    /** ID del comentario reportado (si aplica) */
    idComment?: number;

    /** Razón o motivo del reporte */
    reason: string;

    /** Estado del reporte: 0 = Inactivo, 1 = Activo */
    status: number;

    /** Fecha en que se generó el reporte (ISO string) */
    createdDate: string;

    /** ID del usuario que generó el reporte */
    idUser: number;

    /** Publicación asociada al reporte (si aplica) */
    post?: Post;

    /** Comentario asociado al reporte (si aplica) */
    comment?: Comment;

    /** Resolución tomada por el administrador: 'concedido' o 'rechazado' */
    resolucion?: 'concedido' | 'rechazado';

}
