import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-modal-confirmacion',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './modal-confirmacion.component.html',
  styleUrls: ['./modal-confirmacion.component.scss']
})
export class ModalConfirmacionComponent {
  @Input() titulo = '¿Estás seguro de que no deseas aceptar las reglas de la comunidad?\n\nSin aceptarlas, no podrás usar la plataforma.';
  @Input() mensaje = '';
  @Input() visible = false;

  @Output() confirmar = new EventEmitter<void>();
  @Output() cancelar = new EventEmitter<void>();
}
