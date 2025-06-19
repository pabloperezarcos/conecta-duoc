import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReportService } from '../../core/services/report.service';
import { Report } from '../../models/report';

@Component({
  selector: 'app-publicaciones-reportadas',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './publicaciones-reportadas.component.html',
  styleUrls: ['./publicaciones-reportadas.component.scss']
})
export class PublicacionesReportadasComponent implements OnInit {
  private reportService = inject(ReportService);

  postReports: Report[] = [];
  commentReports: Report[] = [];
  loading = true;

  ngOnInit(): void {
    this.reportService.getAllReports().subscribe({
      next: (reports: Report[]) => {
        // Reportes de publicaciones
        this.postReports = reports.filter(r => r.idPost && !r.idComment);
        // Reportes de comentarios
        this.commentReports = reports.filter(r => r.idComment);
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar reportes:', error);
        this.loading = false;
      }
    });
  }
}
