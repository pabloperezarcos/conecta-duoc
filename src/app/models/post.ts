export interface Post {
    idPost: number;
    title: string;
    content: string;
    idCategory: number;
    idUser: number;
    createdDate?: string;
    views?: number;
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
    score: number;
}

export interface PostView {
    idPost: number;
    views: number;
}