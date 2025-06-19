export interface Report {
    idReport?: number;
    idPost?: number;
    idComment?: number;
    reason: string;
    status: boolean; // 0 Inactivo, 1 Activo
    date: string;
}
