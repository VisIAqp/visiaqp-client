import { DestroyRef, inject, Injectable, signal } from '@angular/core';
import { ZonaService } from '../services/zona';
import { IndicadorService } from '../services/indicador';
import { Zona } from '../models/zona.model';
import { Indicador, PeriodoTipo } from '../models/indicador.model';
import { RequestState } from './request-state';
import { addDays, exclusiveEnd, limaToday } from './dates';

interface FiltrosIndicadores {
  zoneId: number;
  periodo: PeriodoTipo;
  desde: string;
  hasta: string;
}

@Injectable()
export class IndicatorQuery {
  private zonasApi = inject(ZonaService);
  private indicadoresApi = inject(IndicadorService);
  private readonly ref = inject(DestroyRef);
  readonly catalogo = new RequestState(this.ref);
  readonly request = new RequestState(this.ref, true);
  readonly aplicado = signal<FiltrosIndicadores | null>(null);
  readonly errorFiltros = signal('');
  private ultimoIntento: FiltrosIndicadores | null = null;
  zonas: Zona[] = [];
  rows: Indicador[] = [];
  zoneId = 0;
  periodo: PeriodoTipo = 'hora';
  desde = addDays(limaToday(), -6);
  hasta = limaToday();
  pagina = 1;
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
  inicializar() {
    this.catalogo.run(this.zonasApi.listar(), (zonas) => {
      this.zonas = zonas;
      if (!this.zonas.some((z) => z.id === this.zoneId)) this.zoneId = zonas[0]?.id || 0;
      this.buscar();
    });
  }
  buscar() {
    this.errorFiltros.set('');
    if (!this.zoneId) {
      this.errorFiltros.set('Selecciona una zona para consultar los indicadores.');
      return;
    }
    if (!this.desde || !this.hasta || this.hasta < this.desde) {
      this.errorFiltros.set('Revisa el rango de fechas.');
      return;
    }
    this.consultar({ zoneId: this.zoneId, periodo: this.periodo, desde: this.desde, hasta: this.hasta });
  }
  reintentar() {
    if (this.ultimoIntento) this.consultar(this.ultimoIntento);
  }
  private consultar(filtros: FiltrosIndicadores) {
    this.ultimoIntento = filtros;
    this.request.run(
      this.indicadoresApi.historico(
        filtros.zoneId,
        filtros.periodo,
        filtros.desde + 'T00:00:00',
        exclusiveEnd(filtros.hasta),
      ),
      (rows) => {
        this.rows = rows;
        this.pagina = 1;
        this.aplicado.set(filtros);
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
