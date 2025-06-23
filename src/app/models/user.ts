export interface User {
    idUser?: number;
    email: string;
    name: string;
    role?: string;
    center: string;
    policies: number; // 0 No, 1 Sí
}