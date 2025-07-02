import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

/**
 * Componente de pie de página global para la plataforma ConectaDuoc.
 * Muestra el año actual y enlaces relevantes si se requieren.
 */
@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss'
})
export class FooterComponent {
  /**
   * Año actual mostrado dinámicamente en el footer.
   */
  currentYear: number = new Date().getFullYear();

}
