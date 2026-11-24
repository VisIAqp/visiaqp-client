import { inject, Injectable } from '@angular/core';
import { map } from 'rxjs';
import { Api } from '../api/api';
import { DtoMapper, IndicadorDto, IndicadorPeriodoDto } from '../api/dto';
import { PeriodoTipo } from '../models/indicador.model';
@Injectable({ providedIn: 'root' })
export class IndicadorService {
  private api = inject(Api);
  private mapper = inject(DtoMapper);
  actuales() {
    return this.api
      .get<IndicadorDto[]>('/indicadores/actual')
      .pipe(map((rows) => rows.map((d) => this.mapper.indicador(d))));
  }
  historico(zonaId: number, periodo: PeriodoTipo, desde?: string, hasta?: string) {
    return this.api
      .get<IndicadorDto[]>('/indicadores', {
        id_zona: zonaId,
        periodo_tipo: periodo,
        desde,
        hasta,
        limite: 2000,
      })
      .pipe(map((rows) => rows.map((d) => this.mapper.indicador(d))));
  }
  transmisiones({ id_zona, periodo, desde, hasta }: {
    id_zona: number; periodo: PeriodoTipo; desde: string; hasta: string;
  }) {
    return this.api.get<IndicadorPeriodoDto[]>('/indicadores/transmisiones', {
      id_zona, periodo_tipo: periodo, desde, hasta, limite: 2000,
    }).pipe(map((rows) => rows.map((d) => this.mapper.indicadorPeriodo(d))));
  }
  recalcular(zonaId: number, desde: string, hasta: string) {
    return this.api.post<{ horas_recalculadas: number }>('/indicadores/recalcular', {
      id_zona: zonaId,
      desde,
      hasta,
    });
  }
}
