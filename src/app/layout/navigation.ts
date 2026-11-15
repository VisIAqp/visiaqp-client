export interface NavigationLink {
  readonly ruta: string;
  readonly etiqueta: string;
  readonly icono: string;
}

export const navegacion = {
  resumen: {
    ruta: '/dashboard',
    etiqueta: 'Resumen',
    icono: 'M3 10 12 3l9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1Z',
  },
  monitoreo: {
    ruta: '/monitoreo',
    etiqueta: 'Monitoreo',
    icono: 'M5 4h14a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Zm3 17h8m-4-4v4m-6-10h3l2-3 3 6 2-3h2',
  },
  analisis: {
    ruta: '/analisis',
    etiqueta: 'Análisis de videos',
    icono: 'M4 20V10m6 10V4m6 16v-7m5 7H2',
  },
  reportes: {
    ruta: '/reportes',
    etiqueta: 'Reportes',
    icono: 'M5 3h10l4 4v14H5ZM9 11h6m-6 4h6M9 7h2',
  },
  camaras: {
    ruta: '/camaras',
    etiqueta: 'Cámaras',
    icono: 'M3 6h12v12H3ZM15 10l6-3v10l-6-3',
  },
  zonas: {
    ruta: '/zonas',
    etiqueta: 'Zonas',
    icono: 'M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 1 1 14 0ZM14 10a2 2 0 1 0-4 0 2 2 0 0 0 4 0Z',
  },
} satisfies Record<string, NavigationLink>;
