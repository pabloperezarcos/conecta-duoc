import { Component, OnInit, inject } from '@angular/core';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';


/**
 * Componente encargado de generar la ruta de navegación (breadcrumb)
 * dinámicamente según la URL actual. Mejora la usabilidad al mostrar al usuario
 * su posición dentro de la app y permite volver a rutas anteriores.
 */
@Component({
  selector: 'app-breadcrumb',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './breadcrumb.component.html',
  styleUrls: ['./breadcrumb.component.scss']
})
export class BreadcrumbComponent implements OnInit {
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  /**
   * Arreglo de ítems que componen el breadcrumb. Cada ítem tiene un `label` visible
   * y un `path` (opcional) para navegar hacia esa sección.
   */
  items: { label: string; path?: string }[] = [];

  /**
   * Al inicializar el componente, construye los ítems del breadcrumb en base a la URL activa.
   * Se ignoran rutas como `dashboard` o `categoria` para evitar redundancia visual.
   */
  ngOnInit(): void {
    const fullPath = this.router.url.split('?')[0];
    const segments = fullPath.split('/').filter(Boolean);

    let cumulativePath = '';
    this.items = [];

    segments.forEach((seg, index) => {
      cumulativePath += `/${seg}`;

      // Evitar mostrar rutas irrelevantes
      if (seg === 'dashboard' || seg === 'categoria') {
        return;
      }

      const isLast = index === segments.length - 1;
      this.items.push({
        label: this.toReadable(seg),
        path: isLast ? undefined : cumulativePath
      });
    });

    // Agregar manualmente 'Inicio' al comienzo
    this.items.unshift({ label: 'Inicio', path: '/dashboard' });
  }

  /**
   * Convierte un segmento de la URL en un texto legible para mostrar en el breadcrumb.
   * @param slug Fragmento de la URL.
   * @returns Texto más amigable y traducido si aplica.
   */
  private toReadable(slug: string): string {
    const mapa: Record<string, string> = {
      ayudantias: 'Ayudantías',
      deportes: 'Deportes',
      culturales: 'Culturales y Recreativas',
      voluntariado: 'Voluntariado',
      trueques: 'Trueques',
      dashboard: 'Inicio'
    };

    return mapa[slug] || slug.charAt(0).toUpperCase() + slug.slice(1);
  }

}
