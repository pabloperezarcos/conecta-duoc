/**
 * Representa una notificación global dentro de la plataforma.
 * Utilizada para mostrar mensajes visibles a todos los usuarios.
 */
export interface NotificacionGlobal {
    /**
     * ID único de la notificación.
     */
    id: number;

    /**
     * Título de la notificación.
     */
    titulo: string;

    /**
     * Contenido o cuerpo del mensaje a mostrar.
     */
    mensaje: string;

    /**
     * Fecha de inicio de la visibilidad de la notificación (formato ISO).
     */
    fechaInicio: string;

    /**
     * Fecha de término de la visibilidad de la notificación (formato ISO).
     */
    fechaFin: string;
}
