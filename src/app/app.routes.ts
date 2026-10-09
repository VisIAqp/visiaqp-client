import { Routes } from '@angular/router';
import { MainLayout } from './layout/main-layout/main-layout';
import { Dashboard } from './pages/dashboard/dashboard';
import { Zonas } from './pages/zonas/zonas';
import { Camaras } from './pages/camaras/camaras';
import { Monitoreo } from './pages/monitoreo/monitoreo';
import { Analisis } from './pages/analisis/analisis';
import { Reportes } from './pages/reportes/reportes';

export const routes: Routes = [
    {
        path: '',
        component: MainLayout,
        children: [
            {
                path: '',
                redirectTo: 'dashboard',
                pathMatch: 'full'
            },
            {
                path: 'dashboard',
                component: Dashboard
            },
            {
                path: 'zonas',
                component: Zonas
            },
            {
                path: 'camaras',
                component: Camaras
            },
            {
                path: 'monitoreo',
                component: Monitoreo
            },
            {
                path: 'analisis',
                component: Analisis
            },
            {
                path: 'reportes',
                component: Reportes
            }
        ]
    },
    {
        path: '**',
        redirectTo: 'dashboard'
    }
];