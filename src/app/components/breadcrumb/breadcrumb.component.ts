import { Component, OnInit, inject } from '@angular/core';

import { RouterModule, ActivatedRoute, Router } from '@angular/router';

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

  items: { label: string; path?: string }[] = [];

  ngOnInit(): void {
    const fullPath = this.router.url.split('?')[0];
    const segments = fullPath.split('/').filter(Boolean);
    
    let cumulativePath = '';
    this.items = [];

    segments.forEach((seg, index) => {
      cumulativePath += `/${seg}`;

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
