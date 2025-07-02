/**
 * Representa un usuario registrado en la plataforma ConectaDuoc.
 */
export interface User {
    /** ID único del usuario */
    idUser?: number;
    /** Correo institucional del usuario */
    email: string;
    /** Nombre completo del usuario */
    name: string;
    /** Rol del usuario (ej: student, admin) */
    role?: string;
    /** Sede del usuario (ej: Maipú, San Joaquín, etc.) */
    center: string;
    /** Estado de las reglas comunitarias */
    policies: number; // 0 No, 1 Sí
}