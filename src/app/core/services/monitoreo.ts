import { inject, Injectable } from '@angular/core';
import { EMPTY, expand, forkJoin, reduce } from 'rxjs';
import { ZonaService } from './zona';
import { CamaraService } from './camara';
import { Api } from '../api/api';
import { MetricasService } from './metricas';
import { EstadoCamara } from '../models/metricas.model';
import { PronosticoOcupacion } from '../models/pronostico.model';
@Injectable({ providedIn: 'root' })
export class MonitoreoService {
  private zonas = inject(ZonaService);
  private camaras = inject(CamaraService);
  private api = inject(Api);
  private metricas = inject(MetricasService);
  consultar() {
    return forkJoin({
      zonas: this.zonas.listar(),
      camaras: this.camaras.listar(),
    });
  }
  actividadCamaras() {
    return this.metricas.estadoCamaras().pipe(
      expand((pagina) => pagina.tiene_mas
        ? this.metricas.estadoCamaras({}, pagina.desplazamiento + pagina.limite)
        : EMPTY),
      reduce((filas, pagina) => filas.concat(pagina.datos), [] as EstadoCamara[]),
    );
  }
  pronostico(id_camara: number) {
    return this.api.get<PronosticoOcupacion>('/pronosticos/ocupacion', { id_camara });
  }
}
