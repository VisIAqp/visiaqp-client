import { Routes } from '@angular/router';
import { MainLayout } from './layout/main-layout/main-layout';
import { Zonas } from './pages/zonas/listado/zonas';
import { Camaras } from './pages/camaras/listado/camaras';
import { Monitoreo } from './pages/monitoreo/listado/monitoreo';
import { Login } from './pages/login/login';
import { authGuard } from './core/auth/auth-guard';
import { adminGuard } from './core/auth/admin-guard';

const cargarFormularioCamara = () =>
  import('./pages/camaras/formulario/formulario-camara').then((m) => m.FormularioCamara);
const cargarFormularioZona = () =>
  import('./pages/zonas/formulario/formulario-zona').then((m) => m.FormularioZona);
export const routes: Routes = [
  { path: 'login', component: Login },
  {
    path: '',
    component: MainLayout,
    canActivate: [authGuard],
    canActivateChild: [authGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', loadComponent: () => import('./pages/dashboard/dashboard').then((m) => m.Dashboard) },
      { path: 'zonas', component: Zonas, pathMatch: 'full' },
      { path: 'zonas/nueva', canActivate: [adminGuard], data: { sinPermiso: '/zonas' },
        loadComponent: cargarFormularioZona },
      { path: 'zonas/:id/editar', canActivate: [adminGuard], data: { sinPermiso: '/zonas' },
        loadComponent: cargarFormularioZona },
      { path: 'zonas/:id/umbrales', data: { soloUmbrales: true }, loadComponent: cargarFormularioZona },
      { path: 'camaras', component: Camaras, pathMatch: 'full' },
      { path: 'camaras/nueva', canActivate: [adminGuard], data: { sinPermiso: '/camaras' },
        loadComponent: cargarFormularioCamara },
      { path: 'camaras/:id/editar', canActivate: [adminGuard], data: { sinPermiso: '/camaras' },
        loadComponent: cargarFormularioCamara },
      { path: 'monitoreo', component: Monitoreo, pathMatch: 'full' },
      { path: 'monitoreo/:id', loadComponent: () =>
        import('./pages/monitoreo/detalle/detalle-camara').then((m) => m.DetalleCamara) },
      { path: 'analisis', loadComponent: () => import('./pages/analisis/analisis').then((m) => m.Analisis) },
      { path: 'reportes', loadComponent: () => import('./pages/reportes/reportes').then((m) => m.Reportes) },
      { path: 'contexto', redirectTo: 'dashboard', pathMatch: 'full' },
    ],
  },
  { path: '**', redirectTo: 'dashboard' },
];
