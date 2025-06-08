import { Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';
//import { RoleGuard } from './core/guards/role.guard';

export const routes: Routes = [
    {
        path: '',
        loadComponent: () => import('./components/login/login.component').then(m => m.LoginComponent),
        data: { showNavbar: false, showFooter: false }
    },
    {
        path: 'dashboard/perfil',
        loadComponent: () =>
            import('./components/perfil/perfil.component').then(m => m.PerfilComponent),
        canActivate: [AuthGuard],
        data: { showNavbar: true, showFooter: true }
        //data: { allowedRoles: ['alumno', 'admin'] }
    },
    {
        path: 'dashboard',
        loadComponent: () => import('./components/dashboard/dashboard.component').then(m => m.DashboardComponent),
        canActivate: [AuthGuard],
        data: { showNavbar: true, showFooter: true }
    },
    {
        path: 'categoria/ayudantias',
        loadComponent: () => import('./components/categorias/ayudantias/ayudantias.component').then(m => m.AyudantiasComponent),
        canActivate: [AuthGuard],
        data: { showNavbar: true, showFooter: true }
    },
    {
        path: 'dashboard/ayudantias/:id',
        loadComponent: () => import('./components/categorias/ayudantias/detalle-ayudantia/detalle-ayudantia.component').then(m => m.DetalleAyudantiaComponent),
        canActivate: [AuthGuard],
        data: { showNavbar: true, showFooter: true }
    },
    {
        path: 'categoria/culturales',
        loadComponent: () => import('./components/categorias/culturales/culturales.component').then(m => m.CulturalesComponent),
        canActivate: [AuthGuard],
        data: { showNavbar: true, showFooter: true }
    },
    {
        path: 'categoria/deportes',
        loadComponent: () => import('./components/categorias/deportes/deportes.component').then(m => m.DeportesComponent),
        canActivate: [AuthGuard],
        data: { showNavbar: true, showFooter: true }
    },
    {
        path: 'categoria/trueques',
        loadComponent: () => import('./components/categorias/trueques/trueques.component').then(m => m.TruequesComponent),
        canActivate: [AuthGuard],
        data: { showNavbar: true, showFooter: true }
    },
    {
        path: 'categoria/voluntariado',
        loadComponent: () => import('./components/categorias/voluntariado/voluntariado.component').then(m => m.VoluntariadoComponent),
        canActivate: [AuthGuard],
        data: { showNavbar: true, showFooter: true }
    },
    {
        path: '**',
        redirectTo: ''
    },

];