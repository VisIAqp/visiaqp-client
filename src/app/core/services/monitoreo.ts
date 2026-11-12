import { inject, Injectable } from '@angular/core';
import { forkJoin } from 'rxjs';
import { ZonaService } from './zona';
import { CamaraService } from './camara';
import { Api } from '../api/api';
import { PronosticoOcupacion } from '../models/pronostico.model';
@Injectable({ providedIn: 'root' })
export class MonitoreoService {
  private zonas = inject(ZonaService);
  private camaras = inject(CamaraService);
  private api = inject(Api);
  consultar() {
    return forkJoin({
      zonas: this.zonas.listar(),
      camaras: this.camaras.listar(),
    });
  }
  pronostico(id_camara: number) {
    return this.api.get<PronosticoOcupacion>('/pronosticos/ocupacion', { id_camara });
  }
}
