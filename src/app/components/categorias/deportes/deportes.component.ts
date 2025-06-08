import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BreadcrumbComponent } from '../../breadcrumb/breadcrumb.component';

@Component({
  selector: 'app-deportes',
  standalone: true,
  imports: [CommonModule, BreadcrumbComponent],
  templateUrl: './deportes.component.html',
  styleUrl: './deportes.component.scss'
})
export class DeportesComponent {
  publicaciones = [];
}
