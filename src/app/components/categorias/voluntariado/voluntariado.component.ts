import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BreadcrumbComponent } from '../../breadcrumb/breadcrumb.component';
import { NavbarComponent } from '../../navbar/navbar.component';

@Component({
  selector: 'app-voluntariado',
  standalone: true,
  imports: [CommonModule, NavbarComponent, BreadcrumbComponent],
  templateUrl: './voluntariado.component.html',
  styleUrl: './voluntariado.component.scss'
})
export class VoluntariadoComponent {
  publicaciones = [];
}
