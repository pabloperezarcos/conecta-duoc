import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReportService } from '../../core/services/report.service';
import { Report } from '../../models/report';
import { PostService } from '../../core/services/post.service';
import { CommentService } from '../../core/services/comment.service';
import { BreadcrumbComponent } from '../breadcrumb/breadcrumb.component';

/**
 * Componente administrativo para revisar, moderar y resolver reportes
 * sobre publicaciones y comentarios en la plataforma ConectaDuoc.
 */
@Component({
  selector: 'app-publicaciones-reportadas',
  standalone: true,
  imports: [CommonModule, FormsModule, BreadcrumbComponent],
  templateUrl: './publicaciones-reportadas.component.html',
  styleUrls: ['./publicaciones-reportadas.component.scss']
})
export class PublicacionesReportadasComponent implements OnInit {
  /** Servicio que permite crear y gestionar reportes de publicaciones o comentarios */
  private reportService = inject(ReportService);

  /** Servicio que maneja operaciones CRUD sobre publicaciones */
  private postService = inject(PostService);

  /** Servicio encargado de gestionar comentarios asociados a publicaciones */
  private commentService = inject(CommentService);

  /** Reportes de publicaciones */
  postReports: Report[] = [];

  /** Reportes de comentarios */
  commentReports: Report[] = [];

  /** Indica si se están cargando los datos */
  loading = true;

  /** Muestra solo reportes pendientes si es `true` */
  mostrarSoloPendientes = true;

  /** Página actual de publicaciones */
  paginaActualPosts = 1;

  /** Cantidad de ítems por página */
  totalPorPagina = 5;

  /** Página actual de comentarios */
  paginaActualComments = 1;

  /** CONTADORES */
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

  /**
   * Al inicializar, obtiene todos los reportes del backend
   * y carga los datos de las publicaciones asociadas.
   */
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

  /**
   * Devuelve las publicaciones filtradas y ordenadas según la configuración actual de paginación.
   */
  get postReportsPaginados(): Report[] {
    const filtrados = this.mostrarSoloPendientes
      ? this.postReports.filter(r => r && r.status === 1 && r.createdDate)
      : this.postReports.filter(r => r && r.createdDate);

    const ordenados = filtrados.sort((a, b) =>
      new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime()
    );

    const inicio = (this.paginaActualPosts - 1) * this.totalPorPagina;
    return ordenados.slice(inicio, inicio + this.totalPorPagina);
  }

  /**
   * Devuelve los comentarios reportados, filtrados y paginados.
   */
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

  /**
   * Confirma y elimina la publicación reportada.
   * Marca el reporte como `concedido` (status = 2).
   * @param reporte Reporte a resolver.
   */
  confirmarPost(reporte: Report): void {
    const confirmar = confirm('¿Estás seguro de eliminar esta publicación? Esta acción no se puede deshacer.');
    if (!confirmar) return;

    if (!reporte.idReport || !reporte.idPost) return;
    this.postService.delete(reporte.idPost).subscribe(() => {
      this.reportService.updateStatus(reporte.idReport!, 2).subscribe(() => this.recargar());
    });
  }

  /**
   * Rechaza el reporte de una publicación (status = 3).
   * @param reporte Reporte a marcar como rechazado.
   */
  denegarPost(reporte: Report): void {
    if (!reporte.idReport) return;
    this.reportService.updateStatus(reporte.idReport, 3).subscribe(() => this.recargar());
  }

  /**
   * Elimina un comentario y marca el reporte como `concedido`.
   * @param reporte Reporte asociado al comentario.
   */
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

  /**
   * Rechaza un reporte de comentario (status = 3).
   * @param reporte Reporte a rechazar.
   */
  denegarComentario(reporte: Report): void {
    if (!reporte.idReport) return;
    this.reportService.updateStatus(reporte.idReport, 3).subscribe(() => {
      this.commentReports = this.commentReports.filter(r => r.idReport !== reporte.idReport);
    });
  }

  /**
   * Vuelve a cargar todos los reportes desde el backend.
   * Reinicia paginación y activa el spinner.
   */
  recargar(): void {
    this.paginaActualPosts = 1;
    this.paginaActualComments = 1;
    this.loading = true;
    this.ngOnInit();
  }

  /**
   * Cambia la página actual de publicaciones.
   * @param delta Desplazamiento (1 = siguiente, -1 = anterior).
   */
  cambiarPaginaPosts(delta: number): void {
    this.paginaActualPosts += delta;
  }

  /**
   * Cambia la página actual de comentarios.
   * @param delta Desplazamiento (1 = siguiente, -1 = anterior).
   */
  cambiarPaginaComments(delta: number): void {
    this.paginaActualComments += delta;
  }

}