import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReportService } from '../../core/services/report.service';
import { Report } from '../../models/report';
import { PostService } from '../../core/services/post.service';
import { CommentService } from '../../core/services/comment.service';
import { BreadcrumbComponent } from '../breadcrumb/breadcrumb.component';

@Component({
  selector: 'app-publicaciones-reportadas',
  standalone: true,
  imports: [CommonModule, FormsModule, BreadcrumbComponent],
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
  mostrarSoloPendientes = true;
  // Paginación publicaciones
  paginaActualPosts = 1;
  totalPorPagina = 5;

  // Paginación comentarios
  paginaActualComments = 1;

  get postPendientes() {
    return this.postReports?.filter(r => r.status === 1).length || 0;
  }
  get postConcedidos() {
    return this.postReports?.filter(r => r.status === 2).length || 0;
  }
  get postRechazados() {
    return this.postReports?.filter(r => r.status === 3).length || 0;
  }
  get commentPendientes() {
    return this.commentReports?.filter(r => r.status === 1).length || 0;
  }
  get commentConcedidos() {
    return this.commentReports?.filter(r => r.status === 2).length || 0;
  }
  get commentRechazados() {
    return this.commentReports?.filter(r => r.status === 3).length || 0;
  }



  ngOnInit(): void {
    this.reportService.getAllReports().subscribe({
      next: (reports: Report[]) => {
        const postReports = reports.filter(r => r.idPost && !r.idComment);
        const commentReports = reports.filter(r => r.idComment);

        // Cargar publicaciones asociadas a los reportes
        postReports.forEach(rep => {
          if (rep.idPost) {
            this.postService.getById(rep.idPost).subscribe({
              next: (post) => rep.post = post,
              error: () => console.warn('No se pudo cargar el contenido de la publicación #' + rep.idPost)
            });
          }
        });

        this.postReports = postReports;
        this.commentReports = commentReports;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar reportes:', error);
        this.loading = false;
      }
    });
  }

  get postReportsPaginados(): Report[] {
    const filtrados = this.mostrarSoloPendientes
      ? this.postReports.filter(r => r.status === 1)
      : this.postReports;

    const ordenados = filtrados.sort((a, b) =>
      new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime()
    );

    const inicio = (this.paginaActualPosts - 1) * this.totalPorPagina;
    return ordenados.slice(inicio, inicio + this.totalPorPagina);
  }

  get commentReportsPaginados(): Report[] {
    const filtrados = this.mostrarSoloPendientes
      ? this.commentReports.filter(r => r.status === 1)
      : this.commentReports;

    const ordenados = filtrados.sort((a, b) =>
      new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime()
    );

    const inicio = (this.paginaActualComments - 1) * this.totalPorPagina;
    return ordenados.slice(inicio, inicio + this.totalPorPagina);
  }

  get paginasPosts(): number[] {
    return Array.from({ length: this.totalPaginasPosts }, (_, i) => i + 1);
  }

  get totalPaginasPosts(): number {
    const total = this.mostrarSoloPendientes
      ? this.postReports.filter(r => r.status === 1).length
      : this.postReports.length;
    return Math.ceil(total / this.totalPorPagina);
  }

  get paginasComments(): number[] {
    return Array.from({ length: this.totalPaginasComments }, (_, i) => i + 1);
  }

  get totalPaginasComments(): number {
    const total = this.mostrarSoloPendientes
      ? this.commentReports.filter(r => r.status === 1).length
      : this.commentReports.length;
    return Math.ceil(total / this.totalPorPagina);
  }

  confirmarPost(reporte: Report): void {
    const confirmar = confirm('¿Estás seguro de eliminar esta publicación? Esta acción no se puede deshacer.');
    if (!confirmar) return;

    if (!reporte.idReport || !reporte.idPost) return;
    this.postService.delete(reporte.idPost).subscribe(() => {
      this.reportService.updateStatus(reporte.idReport!, 2).subscribe(() => this.recargar());
    });
  }

  denegarPost(reporte: Report): void {
    if (!reporte.idReport) return;
    this.reportService.updateStatus(reporte.idReport, 3).subscribe(() => this.recargar());
  }


  confirmarComentario(reporte: Report): void {
    const confirmar = confirm('¿Estás seguro de eliminar este comentario? Esta acción no se puede deshacer.');
    if (!confirmar) return;

    if (!reporte.idReport || !reporte.idComment) return;

    this.commentService.delete(reporte.idComment).subscribe(() => {
      this.reportService.updateStatus(reporte.idReport!, 2).subscribe(() => {
        this.commentReports = this.commentReports.filter(r => r.idReport !== reporte.idReport);
      });
    });
  }

  denegarComentario(reporte: Report): void {
    if (!reporte.idReport) return;
    this.reportService.updateStatus(reporte.idReport, 3).subscribe(() => {
      this.commentReports = this.commentReports.filter(r => r.idReport !== reporte.idReport);
    });
  }

  recargar(): void {
    this.paginaActualPosts = 1;
    this.paginaActualComments = 1;
    this.loading = true;
    this.ngOnInit();
  }

  cambiarPaginaPosts(delta: number) {
    this.paginaActualPosts += delta;
  }

  cambiarPaginaComments(delta: number) {
    this.paginaActualComments += delta;
  }



}