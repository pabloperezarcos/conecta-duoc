import { Router, Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';
import { RoleGuard } from './core/guards/role.guard';
import { inject } from '@angular/core';

/**
 * Guard personalizado que verifica si el usuario ha aceptado las reglas de la comunidad.
 * Si no lo ha hecho, redirige a la ruta `/reglas-de-la-comunidad`.
 * Se usa en conjunto con `AuthGuard` para rutas protegidas.
 * @returns `true` si las reglas fueron aceptadas, `false` si se redirige.
 */
const reglasAceptadasGuard = () => {
    const router = inject(Router);
    const aceptadas = localStorage.getItem('conectaReglasAceptadas') === 'true';

    if (!aceptadas) {
        router.navigate(['/reglas-de-la-comunidad']);
        return false;
    }

    return true;
};

/**
 * Definición de todas las rutas de la aplicación ConectaDuoc.
 * Incluye configuración de guards, carga perezosa de componentes,
 * visibilidad de navbar/footer, y control de acceso por rol.
 */
export const routes: Routes = [
    {
        path: '',
        loadComponent: () => import('./components/login/login.component').then(m => m.LoginComponent),
        data: { showNavbar: false, showFooter: false }
    },
    {
        path: 'dashboard/perfil',
        loadComponent: () => import('./components/perfil/perfil.component').then(m => m.PerfilComponent),
        canActivate: [AuthGuard, reglasAceptadasGuard],
        data: { showNavbar: true, showFooter: true }
    },
    {
        path: 'dashboard',
        loadComponent: () => import('./components/dashboard/dashboard.component').then(m => m.DashboardComponent),
        canActivate: [AuthGuard, reglasAceptadasGuard],
        data: { showNavbar: true, showFooter: true }
    },
    {
        path: 'dashboard/reportes',
        loadComponent: () => import('./components/publicaciones-reportadas/publicaciones-reportadas.component')
            .then(m => m.PublicacionesReportadasComponent),
        canActivate: [AuthGuard, RoleGuard, reglasAceptadasGuard],
        data: { showNavbar: true, showFooter: true, expectedRoles: ['admin'] }
    },
    {
        path: 'dashboard/panel-de-configuracion',
        loadComponent: () => import('./components/configuracion/configuracion.component').then(m => m.ConfiguracionComponent),
        canActivate: [AuthGuard, reglasAceptadasGuard],
        data: { showNavbar: true, showFooter: true }
    },
    {
        path: 'dashboard/panel-de-configuracion/usuarios',
        loadComponent: () => import('./components/configuracion/usuarios/usuarios.component').then(m => m.UsuariosComponent),
        canActivate: [AuthGuard, reglasAceptadasGuard],
        data: { showNavbar: true, showFooter: true }
    },
    {
        path: 'dashboard/panel-de-configuracion/categorias',
        loadComponent: () => import('./components/configuracion/categorias-admin/categorias-admin.component').then(m => m.CategoriasAdminComponent),
        canActivate: [AuthGuard, reglasAceptadasGuard],
        data: { showNavbar: true, showFooter: true }
    },
    {
        path: 'dashboard/panel-de-configuracion/notificaciones',
        loadComponent: () => import('./components/configuracion/notificaciones/notificaciones.component').then(m => m.NotificacionesComponent),
        canActivate: [AuthGuard, reglasAceptadasGuard],
        data: { showNavbar: true, showFooter: true }
    },
    {
        path: 'categoria/:slug',
        loadComponent: () => import('./components/categorias/categorias.component').then(m => m.CategoriasComponent),
        canActivate: [AuthGuard, reglasAceptadasGuard],
        data: { showNavbar: true, showFooter: true }
    },
    {
        path: 'categoria/:slug/:id',
        loadComponent: () => import('./components/categorias/detalle/detalle.component').then(m => m.DetalleComponent),
        canActivate: [AuthGuard, reglasAceptadasGuard],
        data: { showNavbar: true, showFooter: true }
    },
    {
        path: 'reglas-de-la-comunidad',
        loadComponent: () => import('./components/reglas-de-la-comunidad/reglas-de-la-comunidad.component').then(m => m.ReglasDeLaComunidadComponent),
        canActivate: [AuthGuard],
        data: { showNavbar: true, showFooter: true }
    },
    {
        path: 'forbidden',
        loadComponent: () => import('./components/forbidden/forbidden.component').then(m => m.ForbiddenComponent),
        canActivate: [AuthGuard],
        data: { showNavbar: true, showFooter: true }
    },
    {
        path: 'registro',
        loadComponent: () => import('./components/register/register.component').then(m => m.RegisterComponent),
        canActivate: [AuthGuard],
        data: { showNavbar: false, showFooter: false }
    },
    {
        path: '**',
        redirectTo: ''
    },
];