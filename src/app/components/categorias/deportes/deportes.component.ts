import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BreadcrumbComponent } from '../../breadcrumb/breadcrumb.component';
import { NavbarComponent } from '../../navbar/navbar.component';

@Component({
  selector: 'app-deportes',
  standalone: true,
  imports: [CommonModule, NavbarComponent, BreadcrumbComponent],
  templateUrl: './deportes.component.html',
  styleUrl: './deportes.component.scss'
})
export class DeportesComponent {
  publicaciones = [];
}
