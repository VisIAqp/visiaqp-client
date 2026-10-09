import { Injectable } from '@angular/core';
import { RegistroAnalisis } from '../models/analisis.model';

@Injectable({
  providedIn: 'root'
})
export class AnalisisService {

  private registros: RegistroAnalisis[] = [
    {
      id: 1,
      camaraId: 1,
      fecha: new Date(2026, 9, 2, 8, 0),
      peatonesDetectados: 18,
      nivel: 'Bajo'
    },
    {
      id: 2,
      camaraId: 1,
      fecha: new Date(2026, 9, 2, 9, 0),
      peatonesDetectados: 35,
      nivel: 'Medio'
    },
    {
      id: 3,
      camaraId: 1,
      fecha: new Date(2026, 9, 2, 10, 0),
      peatonesDetectados: 52,
      nivel: 'Medio'
    },
    {
      id: 4,
      camaraId: 1,
      fecha: new Date(2026, 9, 2, 11, 0),
      peatonesDetectados: 71,
      nivel: 'Alto'
    },
    {
      id: 5,
      camaraId: 2,
      fecha: new Date(2026, 9, 2, 8, 0),
      peatonesDetectados: 12,
      nivel: 'Bajo'
    },
    {
      id: 6,
      camaraId: 2,
      fecha: new Date(2026, 9, 2, 9, 0),
      peatonesDetectados: 28,
      nivel: 'Bajo'
    },
    {
      id: 7,
      camaraId: 2,
      fecha: new Date(2026, 9, 2, 10, 0),
      peatonesDetectados: 44,
      nivel: 'Medio'
    },
    {
      id: 8,
      camaraId: 2,
      fecha: new Date(2026, 9, 2, 11, 0),
      peatonesDetectados: 63,
      nivel: 'Alto'
    }
  ];

  obtenerRegistros(): RegistroAnalisis[] {
    return this.registros;
  }
}