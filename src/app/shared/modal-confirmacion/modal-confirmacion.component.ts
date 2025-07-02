import { Component, EventEmitter, Input, Output } from '@angular/core';

/**
 * Componente reutilizable para mostrar un modal de confirmación.
 * Utilizado para confirmar acciones críticas como eliminar, cerrar sesión, etc.
 */
@Component({
  selector: 'app-modal-confirmacion',
  standalone: true,
  imports: [],
  templateUrl: './modal-confirmacion.component.html',
  styleUrls: ['./modal-confirmacion.component.scss']
})
export class ModalConfirmacionComponent {
  /**
   * Título del modal (por defecto: "¿Estás seguro?")
   */
  @Input() titulo = '¿Estás seguro?';

  /**
   * Mensaje que describe la acción a confirmar.
   */
  @Input() mensaje = '';

  /**
   * Controla la visibilidad del modal.
   * Si es `true`, el modal se muestra.
   */
  @Input() visible = false;

  /**
   * Evento emitido cuando el usuario confirma la acción.
   */
  @Output() confirmar = new EventEmitter<void>();

  /**
   * Evento emitido cuando el usuario cancela la acción.
   */
  @Output() cancelar = new EventEmitter<void>();

}