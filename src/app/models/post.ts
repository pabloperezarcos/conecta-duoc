export interface Post {
    idPost: number;
    title: string;
    idUser: string;
    content: string;
    idCategory: number;
    date: string;
    commentsCount?: number; // Número de comentarios, opcional
    views?: number; // Número de vistas, opcional
}

export interface Comment {
    idComment: number;
    idPost: number;
    idUser: string;
    content: string;
    date: string;
}

export interface Score {
    idPost: number;
    idUser: string;
    score: number; // 0 al 5
}

export interface PostView {
    idPost: number;
    views: number;
}