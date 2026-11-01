import { inject, Injectable } from '@angular/core';
import { of, switchMap } from 'rxjs';
import { Api } from '../api/api';
import { DistribucionNivel, FiltrosMetricas, MedicionAgregada, PaginaCamaras,
  PaginaMetricas, PatronHorario, PuntoSerie, ResumenMetricas } from '../models/metricas.model';

@Injectable({ providedIn: 'root' })
export class MetricasService {
  private api = inject(Api);
  resumen(filtros: FiltrosMetricas) {
    return this.api.get<ResumenMetricas>('/metricas/resumen', { ...filtros });
  }
  series(filtros: FiltrosMetricas, desplazamiento = 0, limite = 200) {
    return this.api.get<PaginaMetricas<PuntoSerie>>('/metricas/series', { ...filtros, desplazamiento, limite });
  }
  comparativas(filtros: FiltrosMetricas, desplazamiento = 0) {
    return this.api.get<PaginaMetricas<MedicionAgregada>>('/metricas/comparativas', { ...filtros, desplazamiento, limite: 100 });
  }
  patrones(filtros: FiltrosMetricas, desplazamiento = 0) {
    return this.api.get<PaginaMetricas<PatronHorario>>('/metricas/patrones', { ...filtros, desplazamiento, limite: 200 });
  }
  distribucion(filtros: FiltrosMetricas, desplazamiento = 0) {
    return this.api.get<PaginaMetricas<DistribucionNivel>>('/metricas/distribucion-niveles', { ...filtros, desplazamiento, limite: 100 });
  }
  estadoCamaras(filtros: { id_zona?: number; id_camara?: number } = {}, desplazamiento = 0) {
    return this.api.get<PaginaCamaras>('/metricas/estado-camaras', { ...filtros, desplazamiento, limite: 100 });
  }
  ultimaSerie(filtros: FiltrosMetricas) {
    return this.series(filtros, 0, 1).pipe(switchMap((pagina) =>
      pagina.total > 1 ? this.series(filtros, pagina.total - 1, 1) : of(pagina)));
  }
}
