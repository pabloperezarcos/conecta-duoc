import { Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';

export const routes: Routes = [
    {
        path: '',
        loadComponent: () => import('./components/login/login.component').then(m => m.LoginComponent),
    },
    {
        path: 'dashboard',
        loadComponent: () => import('./components/dashboard/dashboard.component').then(m => m.DashboardComponent),
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