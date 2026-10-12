import { DestroyRef, inject, Injectable } from '@angular/core';
import { ZonaService } from '../services/zona';
import { IndicadorService } from '../services/indicador';
import { Zona } from '../models/zona.model';
import { Indicador, PeriodoTipo } from '../models/indicador.model';
import { RequestState } from './request-state';
import { addDays, exclusiveEnd, limaToday } from './dates';
@Injectable()
export class IndicatorQuery {
  private zonasApi = inject(ZonaService);
  private indicadoresApi = inject(IndicadorService);
  readonly request = new RequestState(inject(DestroyRef));
  zonas: Zona[] = [];
  rows: Indicador[] = [];
  zoneId = 0;
  periodo: PeriodoTipo = 'hora';
  desde = addDays(limaToday(), -6);
  hasta = limaToday();
  pagina = 1;
  changed = () => {};
  get pages() {
    return Math.max(1, Math.ceil(this.rows.length / 15));
  }
  get page() {
    return Math.min(this.pagina, this.pages);
  }
  get visible() {
    return this.rows.slice((this.page - 1) * 15, this.page * 15);
  }
  get sum() {
    return this.rows.reduce((sum, i) => sum + i.totalPeatones, 0);
  }
  get max() {
    return this.rows.length ? Math.max(...this.rows.map((i) => i.maxPeatones)) : null;
  }
  inicializar() {
    this.request.run(this.zonasApi.listar(), (zonas) => {
      this.zonas = zonas;
      if (!this.zonas.some((z) => z.id === this.zoneId)) this.zoneId = zonas[0]?.id || 0;
      this.buscar();
    });
  }
  buscar() {
    this.rows = [];
    this.pagina = 1;
    this.changed();
    if (!this.zoneId) {
      this.request.error.set('Selecciona una zona para consultar los indicadores.');
      return;
    }
    if (!this.desde || !this.hasta || this.hasta < this.desde) {
      this.request.error.set('Revisa el rango de fechas.');
      return;
    }
    this.request.run(
      this.indicadoresApi.historico(
        this.zoneId,
        this.periodo,
        this.desde + 'T00:00:00',
        exclusiveEnd(this.hasta),
      ),
      (rows) => {
        this.rows = rows;
        this.changed();
      },
    );
  }
  limpiar() {
    this.periodo = 'hora';
    this.desde = addDays(limaToday(), -6);
    this.hasta = limaToday();
    this.buscar();
  }
  cambiarPagina(delta: number) {
    this.pagina = Math.max(1, Math.min(this.pages, this.page + delta));
  }
  nombreZona(id: number) {
    return this.zonas.find((z) => z.id === id)?.nombre || 'Zona ' + id;
  }
}
