import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-reglas-de-la-comunidad',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reglas-de-la-comunidad.component.html',
  styleUrl: './reglas-de-la-comunidad.component.scss'
})
export class ReglasDeLaComunidadComponent {
  constructor(private router: Router) { }

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

  aceptarReglas() {
    localStorage.setItem('conectaReglasAceptadas', 'true');
    this.router.navigate(['/dashboard']);
  }
}