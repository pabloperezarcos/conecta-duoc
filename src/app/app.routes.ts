import { Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';
//import { RoleGuard } from './core/guards/role.guard';

export const routes: Routes = [
    {
        path: '',
        loadComponent: () => import('./components/login/login.component').then(m => m.LoginComponent),
    },
    {
        path: 'dashboard/perfil',
        loadComponent: () =>
            import('./components/perfil/perfil.component').then(m => m.PerfilComponent),
        canActivate: [AuthGuard],
        //data: { allowedRoles: ['alumno', 'admin'] }
    },
    {
        path: 'dashboard',
        loadComponent: () => import('./components/dashboard/dashboard.component').then(m => m.DashboardComponent),
        canActivate: [AuthGuard]
    },
    {
        path: 'categoria/ayudantias',
        loadComponent: () => import('./components/categorias/ayudantias/ayudantias.component').then(m => m.AyudantiasComponent),
        canActivate: [AuthGuard]
    },
    {
        path: 'dashboard/ayudantias/:id',
        loadComponent: () => import('./components/categorias/ayudantias/detalle-ayudantia/detalle-ayudantia.component').then(m => m.DetalleAyudantiaComponent),
        canActivate: [AuthGuard]
    },
    {
        path: 'categoria/culturales',
        loadComponent: () => import('./components/categorias/culturales/culturales.component').then(m => m.CulturalesComponent),
        canActivate: [AuthGuard]
    },
    {
        path: 'categoria/deportes',
        loadComponent: () => import('./components/categorias/deportes/deportes.component').then(m => m.DeportesComponent),
        canActivate: [AuthGuard]
    },
    {
        path: 'categoria/trueques',
        loadComponent: () => import('./components/categorias/deportes/deportes.component').then(m => m.DeportesComponent),
        canActivate: [AuthGuard]
    },
    {
        path: 'categoria/voluntariado',
        loadComponent: () => import('./components/categorias/voluntariado/voluntariado.component').then(m => m.VoluntariadoComponent),
        canActivate: [AuthGuard]
    },
    {
        path: '**',
        redirectTo: ''
    },

    /*     {
            path: 'admin',
            loadComponent: () => import('./components/admin/admin.component').then(m => m.AdminComponent),
            canActivate: [RoleGuard],
            data: { expectedRole: 'admin' }
        },
        {
            path: 'alumno',
            loadComponent: () => import('./components/alumno/alumno.component').then(m => m.AlumnoComponent),
            canActivate: [RoleGuard],
            data: { expectedRole: 'alumno' }
        } */

];