import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReportService } from '../../core/services/report.service';
import { Report } from '../../models/report';
import { PostService } from '../../core/services/post.service';
import { CommentService } from '../../core/services/comment.service';

@Component({
  selector: 'app-publicaciones-reportadas',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './publicaciones-reportadas.component.html',
  styleUrls: ['./publicaciones-reportadas.component.scss']
})
export class PublicacionesReportadasComponent implements OnInit {
  private reportService = inject(ReportService);
  private postService = inject(PostService);
  private commentService = inject(CommentService);

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

  confirmarPost(reporte: Report): void {
    if (!reporte.idReport || !reporte.idPost) return;

    this.postService.delete(reporte.idPost).subscribe(() => {
      this.reportService.updateStatus(reporte.idReport!, 0).subscribe(() => {
        this.postReports = this.postReports.filter(r => r.idReport !== reporte.idReport);
      });
    });
  }

  denegarPost(reporte: Report): void {
    if (!reporte.idReport) return;
    this.reportService.updateStatus(reporte.idReport, 0).subscribe(() => {
      this.postReports = this.postReports.filter(r => r.idReport !== reporte.idReport);
    });
  }

  confirmarComentario(reporte: Report): void {
    if (!reporte.idReport || !reporte.idComment) return;

    this.commentService.delete(reporte.idComment).subscribe(() => {
      this.reportService.updateStatus(reporte.idReport!, 0).subscribe(() => {
        this.commentReports = this.commentReports.filter(r => r.idReport !== reporte.idReport);
      });
    });
  }

  denegarComentario(reporte: Report): void {
    if (!reporte.idReport) return;
    this.reportService.updateStatus(reporte.idReport, 0).subscribe(() => {
      this.commentReports = this.commentReports.filter(r => r.idReport !== reporte.idReport);
    });
  }
}