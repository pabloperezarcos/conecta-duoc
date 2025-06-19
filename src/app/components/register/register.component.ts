import { Component, OnInit } from '@angular/core';

import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from '../../core/services/user.service';
import { User } from '../../models/user';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {
  registerForm!: FormGroup;
  email = '';
  name = '';
  sedes: string[] = [
    'Modalidad online', 'Campus Virtual', 'Sede Alameda', 'Sede Padre Alonso de Ovalle',
    'Sede Antonio Varas', 'Sede Educación Continua', 'Sede Maipú', 'Sede Melipilla',
    'Sede Plaza Norte', 'Sede Plaza Oeste', 'Sede Plaza Vespucio', 'Sede Puente Alto',
    'Sede San Bernardo', 'Sede San Carlos de Apoquindo', 'Sede San Joaquín',
    'Sede Valparaíso', 'Sede Viña del Mar', 'Campus Arauco', 'Campus Nacimiento',
    'Sede San Andrés de Concepción', 'Campus Villarrica', 'Sede Puerto Montt'
  ];

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private router: Router
  ) { }

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

  guardarRegistro(): void {
    if (this.registerForm.invalid) return;

    const user: User = {
      email: this.email,
      name: this.name,
      center: this.registerForm.value.center,
      role: 'student',
      policies: false // Aceptación viene después en el flujo
    };

    this.userService.registerUser(user).subscribe({
      next: () => {
        // Al registrar, redirige a la pantalla de reglas de la comunidad
        this.router.navigate(['/reglas-de-la-comunidad']);
      },
      error: () => {
        // Aquí puedes mostrar un mensaje de error
      }
    });
  }
}
