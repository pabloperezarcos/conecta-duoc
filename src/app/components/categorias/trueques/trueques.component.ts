import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BreadcrumbComponent } from '../../breadcrumb/breadcrumb.component';

@Component({
  selector: 'app-trueques',
  standalone: true,
  imports: [CommonModule, BreadcrumbComponent],
  templateUrl: './trueques.component.html',
  styleUrl: './trueques.component.scss'
})
export class TruequesComponent {
  publicaciones = [];
}
