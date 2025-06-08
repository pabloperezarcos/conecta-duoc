import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BreadcrumbComponent } from '../../breadcrumb/breadcrumb.component';

@Component({
  selector: 'app-voluntariado',
  standalone: true,
  imports: [CommonModule, BreadcrumbComponent],
  templateUrl: './voluntariado.component.html',
  styleUrl: './voluntariado.component.scss'
})
export class VoluntariadoComponent {
  publicaciones = [];
}
