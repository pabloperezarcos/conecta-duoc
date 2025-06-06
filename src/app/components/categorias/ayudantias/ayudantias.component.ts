import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
//import { Router, RouterLink } from '@angular/router';
import { BreadcrumbComponent } from '../../breadcrumb/breadcrumb.component';
import { NavbarComponent } from '../../navbar/navbar.component';

@Component({
  selector: 'app-ayudantias',
  standalone: true,
  imports: [CommonModule, NavbarComponent, BreadcrumbComponent],
  templateUrl: './ayudantias.component.html',
  styleUrls: ['./ayudantias.component.scss']
})
export class AyudantiasComponent {
  publicaciones = [];
}
