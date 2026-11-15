import { Routes } from '@angular/router';
import { MainLayout } from './layout/main-layout/main-layout';
import { Zonas } from './pages/zonas/zonas';
import { Camaras } from './pages/camaras/camaras';
import { Monitoreo } from './pages/monitoreo/listado/monitoreo';
import { Reportes } from './pages/reportes/reportes';
import { Login } from './pages/login/login';
import { authGuard } from './core/auth/auth-guard';
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
      { path: 'zonas', component: Zonas },
      { path: 'camaras', component: Camaras },
      { path: 'monitoreo', component: Monitoreo, pathMatch: 'full' },
      { path: 'monitoreo/:id', loadComponent: () =>
        import('./pages/monitoreo/detalle/detalle-camara').then((m) => m.DetalleCamara) },
      { path: 'analisis', loadComponent: () => import('./pages/analisis/analisis').then((m) => m.Analisis) },
      { path: 'reportes', component: Reportes },
      { path: 'contexto', redirectTo: 'dashboard', pathMatch: 'full' },
    ],
  },
  { path: '**', redirectTo: 'dashboard' },
];
