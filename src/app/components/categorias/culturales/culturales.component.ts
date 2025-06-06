import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BreadcrumbComponent } from '../../breadcrumb/breadcrumb.component';
import { NavbarComponent } from '../../navbar/navbar.component';

@Component({
  selector: 'app-culturales',
  standalone: true,
  imports: [CommonModule, NavbarComponent, BreadcrumbComponent],
  templateUrl: './culturales.component.html',
  styleUrl: './culturales.component.scss'
})
export class CulturalesComponent {
  publicaciones = [];
}
