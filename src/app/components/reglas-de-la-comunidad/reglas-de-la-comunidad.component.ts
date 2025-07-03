import { Component, inject } from '@angular/core';

import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ModalConfirmacionComponent } from '../../shared/modal-confirmacion/modal-confirmacion.component';
import { UserService } from '../../core/services/user.service';

/**
 * Componente que muestra las reglas de la comunidad de ConectaDuoc.
 * Obliga al usuario a aceptarlas antes de utilizar la plataforma por primera vez.
 * Si las rechaza, se le cierra la sesión.
 */
@Component({
  selector: 'app-reglas-de-la-comunidad',
  standalone: true,
  imports: [FormsModule, ModalConfirmacionComponent],
  templateUrl: './reglas-de-la-comunidad.component.html',
  styleUrls: ['./reglas-de-la-comunidad.component.scss']
})
export class ReglasDeLaComunidadComponent {
  private userService = inject(UserService);
  private router = inject(Router);

  /** Controla la visibilidad del modal de confirmación de rechazo */
  mostrarModal = false;

  /**
   * Lista de reglas visibles para el usuario, con título y descripción.
   */
  reglas = [
    {
      titulo: '1. Respeto ante todo',
      descripcion: 'No se toleran comentarios ofensivos, discriminatorios, acosadores o violentos. Toda persona debe ser tratada con dignidad y cortesía.'
    },
    {
      titulo: '2. Actividades sin fines de lucro',
      descripcion: 'ConectaDuoc es un espacio colaborativo. Está prohibida toda oferta o venta comercial dentro de la plataforma.'
    },
    {
      titulo: '3. Contenido adecuado',
      descripcion: 'Se prohíbe la publicación de material con lenguaje vulgar, violencia gráfica, apología de drogas, apuestas o cualquier contenido ilícito.'
    },
    {
      titulo: '4. Protección de datos personales',
      descripcion: 'No publiques datos personales tuyos o de terceros sin consentimiento explícito. Esto incluye RUT, correos, teléfonos o direcciones.'
    },
    {
      titulo: '5. Moderación activa',
      descripcion: 'Los administradores podrán eliminar o editar publicaciones que infrinjan las reglas. Las reincidencias pueden derivar en la suspensión del perfil.'
    },
    {
      titulo: '6. Lenguaje inclusivo y empático',
      descripcion: 'Fomentamos un lenguaje claro, inclusivo y que promueva el respeto por la diversidad de género, origen y creencias.'
    },
    {
      titulo: '7. Sistema de reportes',
      descripcion: 'Los usuarios pueden reportar contenido inapropiado mediante el botón correspondiente. Todas las denuncias serán revisadas.'
    },
    {
      titulo: '8. Contenido académico y estudiantil preferente',
      descripcion: 'Se espera que las publicaciones estén relacionadas con el quehacer estudiantil: ayudantías, actividades culturales, voluntariado, etc.'
    },
    {
      titulo: '9. Responsabilidad en encuentros presenciales',
      descripcion: 'En caso de concretarse actividades fuera de la plataforma, los usuarios deben ser responsables, actuar con respeto y cuidar su seguridad.'
    },
    {
      titulo: '10. Prohibición de suplantación de identidad',
      descripcion: 'Está estrictamente prohibido crear perfiles falsos, impersonar a terceros o utilizar datos que no correspondan.'
    },
    {
      titulo: '11. Uso exclusivo de cuentas institucionales',
      descripcion: 'Para participar en la plataforma, debes iniciar sesión con tu cuenta institucional Duoc UC. Esto asegura un entorno seguro y controlado.'
    }
  ];

  /**
   * Acepta las reglas de la comunidad y actualiza el campo `policies` del usuario a 1.
   * También se guarda la aceptación en `localStorage` para prevenir múltiples redirecciones.
   */
  aceptarReglas() {
    // Llamamos al backend para marcar "policies" como true
    const email = this.userService.getAzureUser()?.email;
    if (email) {
      this.userService.getUser(email).subscribe(user => {
        const updatedUser = { ...user, policies: 1 };
        this.userService.registerUser(updatedUser).subscribe(() => {
          localStorage.setItem('conectaReglasAceptadas', 'true');
          this.router.navigate(['/dashboard']);
        });
      });
    } else {
      // Fallback: solo localStorage (en caso de error raro)
      localStorage.setItem('conectaReglasAceptadas', 'true');
      this.router.navigate(['/dashboard']);
    }
  }

  /**
   * Abre el modal de confirmación para rechazar las reglas.
   */
  rechazarReglas() {
    this.mostrarModal = true;
  }

  /**
   * Confirma el rechazo de las reglas.
   * Se marca `policies` como 0, se limpia el localStorage y se redirige al login.
   */
  confirmarRechazo() {
    const email = this.userService.getAzureUser()?.email;
    if (email) {
      this.userService.getUser(email).subscribe(user => {
        const updatedUser = { ...user, policies: 0 };
        this.userService.registerUser(updatedUser).subscribe(() => {
          // Ahora sí, limpia el storage y cierra sesión
          localStorage.removeItem('conectaReglasAceptadas');
          localStorage.removeItem('userRole');
          localStorage.removeItem('name');
          sessionStorage.clear();
          this.router.navigate(['/login']);
        });
      });
    } else {
      // Si por algún motivo no hay email, igual cierra sesión
      localStorage.removeItem('conectaReglasAceptadas');
      localStorage.removeItem('userRole');
      localStorage.removeItem('name');
      sessionStorage.clear();
      this.router.navigate(['/login']);
    }
  }

  /**
   * Cancela el intento de rechazo de las reglas, cerrando el modal.
   */
  cancelarRechazo() {
    this.mostrarModal = false;
  }

}