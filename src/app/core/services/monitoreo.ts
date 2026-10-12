import { inject, Injectable } from '@angular/core';
import { forkJoin } from 'rxjs';
import { ZonaService } from './zona';
import { CamaraService } from './camara';
import { IndicadorService } from './indicador';
import { AnalisisService } from './analisis';
@Injectable({ providedIn: 'root' })
export class MonitoreoService {
  private zonas = inject(ZonaService);
  private camaras = inject(CamaraService);
  private indicadores = inject(IndicadorService);
  private procesamientos = inject(AnalisisService);
  consultar() {
    return forkJoin({
      zonas: this.zonas.listar(),
      camaras: this.camaras.listar(),
      indicadores: this.indicadores.actuales(),
      procesamientos: this.procesamientos.listar(),
    });
  }
}
