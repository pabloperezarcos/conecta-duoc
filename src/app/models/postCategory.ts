/**
 * Representa una categoría en la que pueden clasificarse las publicaciones dentro de ConectaDuoc.
 */
export interface PostCategory {
    /** ID único de la categoría */
    idCategory: number;

    /** Nombre de la categoría (ej: Ayudantías, Deportes, Trueques, etc.) */
    name: string;

    /** Descripción breve de la categoría */
    description: string;

    /** Estado de la categoría: 0 = Inactiva, 1 = Activa */
    status: number;
}
