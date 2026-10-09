import { Injectable } from '@angular/core';
import { Indicador } from '../models/indicador.model';
// Fixtures de indicador; los agregados reales los calculará el backend.
@Injectable({ providedIn: 'root' })
export class IndicadorService {
  private indicadores: Indicador[] = [
    { id: 1, zonaId: 1, periodoTipo: 'hora', periodoInicio: new Date('2026-10-09T08:00:00-05:00'), periodoFin: new Date('2026-10-09T09:00:00-05:00'), totalPeatones: 53, promedioPeatones: 17.67, maxPeatones: 35, nivelConcentracion: 'medio', fechaCalculo: new Date('2026-10-09T11:05:00-05:00') },
    { id: 2, zonaId: 2, periodoTipo: 'hora', periodoInicio: new Date('2026-10-09T09:00:00-05:00'), periodoFin: new Date('2026-10-09T10:00:00-05:00'), totalPeatones: 56, promedioPeatones: 28, maxPeatones: 44, nivelConcentracion: 'medio', fechaCalculo: new Date('2026-10-09T11:05:00-05:00') },
    { id: 3, zonaId: 1, periodoTipo: 'dia', periodoInicio: new Date('2026-10-09T00:00:00-05:00'), periodoFin: new Date('2026-10-10T00:00:00-05:00'), totalPeatones: 53, promedioPeatones: 17.67, maxPeatones: 35, nivelConcentracion: 'medio', fechaCalculo: new Date('2026-10-09T11:05:00-05:00') },
    { id: 4, zonaId: 2, periodoTipo: 'dia', periodoInicio: new Date('2026-10-09T00:00:00-05:00'), periodoFin: new Date('2026-10-10T00:00:00-05:00'), totalPeatones: 56, promedioPeatones: 28, maxPeatones: 44, nivelConcentracion: 'medio', fechaCalculo: new Date('2026-10-09T11:05:00-05:00') }
  ];
  obtenerIndicadores() { return this.indicadores; }
}
