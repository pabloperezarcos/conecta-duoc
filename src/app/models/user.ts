export interface User {
    email: string;
    name: string;
    role?: string;
    center: string;
    policies: boolean; // 0 No, 1 Sí
}