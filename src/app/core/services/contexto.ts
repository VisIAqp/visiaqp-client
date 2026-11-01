import { inject, Injectable } from '@angular/core';
import { Api } from '../api/api';
import { FiltrosMetricas, PaginaMetricas } from '../models/metricas.model';
import { EventoCalendario, EventoEntrada, PaginaCalendario, PaginaClima, ResultadoSincronizacion, SerieContexto } from '../models/contexto.model';

@Injectable({ providedIn: 'root' })
export class ContextoService {
  private api = inject(Api);
  calendario(anio: number, id_zona?: number, desplazamiento = 0) {
    return this.api.get<PaginaCalendario>('/contexto/calendario', { anio, id_zona, desplazamiento, limite: 100 });
  }
  sincronizarCalendario(anio: number) { return this.api.post<ResultadoSincronizacion>('/contexto/calendario/sincronizar?anio=' + anio, {}); }
  clima(id_zona: number, desde: string, hasta: string, desplazamiento = 0) {
    return this.api.get<PaginaClima>('/contexto/clima', { id_zona, desde, hasta, desplazamiento, limite: 100 });
  }
  sincronizarClima(id_zona: number, desde: string, hasta: string) {
    return this.api.post<ResultadoSincronizacion>('/contexto/clima/sincronizar', { id_zona, desde, hasta });
  }
  series(filtros: FiltrosMetricas, desplazamiento = 0) {
    return this.api.get<PaginaMetricas<SerieContexto>>('/contexto/series', { ...filtros, desplazamiento, limite: 100 });
  }
  guardarEvento(datos: EventoEntrada, id?: number) {
    return id ? this.api.put<EventoCalendario>('/contexto/eventos/' + id, datos) : this.api.post<EventoCalendario>('/contexto/eventos', datos);
  }
}
