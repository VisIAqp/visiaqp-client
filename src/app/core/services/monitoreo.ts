import { inject, Injectable } from '@angular/core';
import { forkJoin } from 'rxjs';
import { ZonaService } from './zona';
import { CamaraService } from './camara';
@Injectable({ providedIn: 'root' })
export class MonitoreoService {
  private zonas = inject(ZonaService);
  private camaras = inject(CamaraService);
  consultar() {
    return forkJoin({
      zonas: this.zonas.listar(),
      camaras: this.camaras.listar(),
    });
  }
}
