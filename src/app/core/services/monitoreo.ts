import { Injectable, inject } from '@angular/core';
import { AnalisisService } from './analisis';
import { MonitoreoCamara } from '../models/monitoreo.model';
@Injectable({ providedIn: 'root' })
export class MonitoreoService {
  private analisis = inject(AnalisisService);
  obtenerPorCamara(camaraId: number): MonitoreoCamara | undefined {
    const r = this.analisis.obtenerRegistros().filter(r => r.camaraId === camaraId).sort((a,b) => b.periodoFin.getTime() - a.periodoFin.getTime())[0];
    return r ? { camaraId, cantidadPeatones: r.cantidadPeatones, nivel: r.nivel, periodoInicio: r.periodoInicio, periodoFin: r.periodoFin } : undefined;
  }
  obtenerMonitoreo() { return this.analisis.obtenerProcesamientos().filter(p => p.camaraId !== null).map(p => this.obtenerPorCamara(p.camaraId!)).filter((m): m is MonitoreoCamara => !!m); }
}
