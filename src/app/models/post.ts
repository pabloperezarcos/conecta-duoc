/**
 * Representa una publicación realizada por un usuario dentro de ConectaDuoc.
 */
export interface Post {
    /** ID único de la publicación */
    idPost: number;

    /** Título de la publicación */
    title: string;

    /** Contenido detallado de la publicación */
    content: string;

    /** ID de la categoría asociada a la publicación */
    idCategory: number;

    /** ID del usuario que creó la publicación */
    idUser: number;

    /** Fecha de creación de la publicación (ISO string) */
    createdDate: string;

    /** Número de visualizaciones que ha recibido la publicación */
    views: number;
}

/**
 * Representa un comentario realizado por un usuario en una publicación.
 */
export interface Comment {
    /** ID único del comentario */
    idComment: number;

    /** ID de la publicación a la que pertenece el comentario */
    idPost: number;

    /** ID del usuario que escribió el comentario */
    idUser: string;

    /** Contenido del comentario */
    content: string;

    /** Fecha en que se realizó el comentario (ISO string) */
    date: string;
}

/**
 * Representa una puntuación (score) que un usuario otorga a una publicación.
 */
export interface Score {
    /** ID de la publicación puntuada */
    idPost: number;

    /** ID del usuario que otorgó la puntuación */
    idUser: number;

    /** Valor de la puntuación (por ejemplo: 1 a 5 estrellas) */
    score: number;
}

/**
 * Representa la cantidad de visualizaciones que ha recibido una publicación.
 */
export interface PostView {
    /** ID de la publicación */
    idPost: number;

    /** Número total de visualizaciones registradas */
    views: number;
}
