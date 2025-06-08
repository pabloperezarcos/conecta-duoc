import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-breadcrumb',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './breadcrumb.component.html',
  styleUrls: ['./breadcrumb.component.scss']
})
export class BreadcrumbComponent implements OnInit {
  items: { label: string; path?: string }[] = [];

  constructor(private router: Router, private route: ActivatedRoute) { }

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
