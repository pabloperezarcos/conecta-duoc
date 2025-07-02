<<<<<<< Updated upstream
import { Post } from "./post";

=======
/**
 * Representa un reporte generado por un usuario sobre una publicación o comentario.
 */
>>>>>>> Stashed changes
export interface Report {
    /** ID único del reporte */
    idReport?: number;

    /** ID de la publicación reportada (si aplica) */
    idPost?: number;

    /** ID del comentario reportado (si aplica) */
    idComment?: number;

    /** Razón o motivo del reporte */
    reason: string;
<<<<<<< Updated upstream
    status: number; // 0 Inactivo, 1 Activo
    createdDate: string;
    idUser: number;

    post?: Post;
    comment?: Comment;
    resolucion?: 'concedido' | 'rechazado';
=======

    /** Estado del reporte: 0 = Inactivo, 1 = Activo */
    status: number;

    /** Fecha en que se generó el reporte (ISO string) */
    date: string;
>>>>>>> Stashed changes
}
