import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from '../../core/services/user.service';
import { User } from '../../models/user';

/**
 * Componente encargado de registrar un nuevo usuario en ConectaDuoc
 * al iniciar sesión por primera vez con Azure AD. El usuario debe seleccionar su sede.
 */
@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {
  private fb = inject(FormBuilder);
  private userService = inject(UserService);
  private router = inject(Router);

  /** Formulario reactivo para el registro */
  registerForm!: FormGroup;

  /** Correo del usuario autenticado (obtenido desde Azure AD) */
  email = '';

  /** Nombre completo del usuario autenticado (Azure AD) */
  name = '';

  /**
   * Lista de sedes disponibles en Duoc UC.
   * El usuario debe seleccionar una como parte del registro.
   */
  sedes: string[] = [
    'Modalidad online', 'Campus Virtual', 'Sede Alameda', 'Sede Padre Alonso de Ovalle',
    'Sede Antonio Varas', 'Sede Educación Continua', 'Sede Maipú', 'Sede Melipilla',
    'Sede Plaza Norte', 'Sede Plaza Oeste', 'Sede Plaza Vespucio', 'Sede Puente Alto',
    'Sede San Bernardo', 'Sede San Carlos de Apoquindo', 'Sede San Joaquín',
    'Sede Valparaíso', 'Sede Viña del Mar', 'Campus Arauco', 'Campus Nacimiento',
    'Sede San Andrés de Concepción', 'Campus Villarrica', 'Sede Puerto Montt'
  ];

  /**
   * Inicializa el formulario y carga los datos del usuario desde Azure AD.
   * Si no hay sesión activa, redirige a la pantalla de inicio.
   */
  ngOnInit(): void {
    const azureUser = this.userService.getAzureUser();
    if (!azureUser) {
      this.router.navigate(['/']);
      return;
    }

    this.email = azureUser.email;
    this.name = azureUser.fullName;

    this.registerForm = this.fb.group({
      center: ['', Validators.required]
    });
  }

  /**
   * Envía el formulario de registro al backend.
   * Una vez registrado, redirige al usuario a las reglas de la comunidad.
   */
  guardarRegistro(): void {
    if (this.registerForm.invalid) return;

    const user: User = {
      email: this.email,
      name: this.name,
      center: this.registerForm.value.center,
      role: 'student',
      policies: 0 // Aceptación viene después en el flujo
    };

    this.userService.registerUser(user).subscribe({
      next: () => {
        // Al registrar, redirige a la pantalla de reglas de la comunidad
        this.router.navigate(['/reglas-de-la-comunidad']);
      },
      error: () => {
        // Manejo de error, podrías mostrar un mensaje al usuario
        console.error('Error al registrar el usuario');
      }
    });
  }

}
