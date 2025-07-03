import { inject, Component } from '@angular/core';
import { ActivatedRoute, Data, NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { NavbarComponent } from './components/navbar/navbar.component';
import { FooterComponent } from './components/footer/footer.component';
import { filter } from 'rxjs';

/**
 * Componente raíz de la aplicación ConectaDuoc.
 * Gestiona la visibilidad del navbar y footer según la configuración de cada ruta.
 */
@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NavbarComponent, FooterComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  /** Servicio de enrutamiento para redirigir entre componentes o páginas */
  private router = inject(Router);

  /** Servicio para acceder a parámetros y datos de la ruta activa */
  private route = inject(ActivatedRoute);

  /** Título principal de la aplicación */
  title = 'Conecta-DUOC';

  /** Define si se debe mostrar el navbar */
  mostrarNavbar = true;

  /** Define si se debe mostrar el footer */
  mostrarFooter = true;

  /**
   * Escucha los cambios de navegación para actualizar la visibilidad
   * del navbar y footer según los `data` de la ruta activa.
   */
  constructor() {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        const currentRoute = this.getChild(this.route);
        const data: Data = currentRoute.snapshot.data;

        this.mostrarNavbar = data['showNavbar'] !== false;
        this.mostrarFooter = data['showFooter'] !== false;
      });
  }

  /**
   * Obtiene la ruta hija más profunda desde el árbol de rutas activas.
   * Esto es necesario para acceder correctamente a los `data` de la ruta actual.
   * @param route Ruta activa principal.
   * @returns Ruta hija más profunda.
   */
  private getChild(route: ActivatedRoute): ActivatedRoute {
    while (route.firstChild) {
      route = route.firstChild;
    }
    return route;
  }

}
