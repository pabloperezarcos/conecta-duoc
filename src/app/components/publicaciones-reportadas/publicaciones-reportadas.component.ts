import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReportesService, ReportePublicacion, ReporteComentario } from '../../core/services/reportes.service';

@Component({
  selector: 'app-publicaciones-reportadas',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './publicaciones-reportadas.component.html',
  styleUrls: ['./publicaciones-reportadas.component.scss']
})
export class PublicacionesReportadasComponent implements OnInit {
  publicacionesReportadas: ReportePublicacion[] = [];
  comentariosReportados: ReporteComentario[] = [];

  constructor(private reportesService: ReportesService) {}

  ngOnInit(): void {
    this.publicacionesReportadas = this.reportesService.getPublicacionesReportadas();
    this.comentariosReportados = this.reportesService.getComentariosReportados();
  }
}
