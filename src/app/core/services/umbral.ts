import { Injectable } from '@angular/core';
import { UmbralConcentracion } from '../models/indicador.model';
import { NivelConcentracion } from '../models/monitoreo.model';
@Injectable({ providedIn: 'root' })
export class UmbralService {
  private umbrales: UmbralConcentracion[] = [
    { id: 1, zonaId: 1, umbralMedio: 10, umbralAlto: 30 },
    { id: 2, zonaId: 2, umbralMedio: 20, umbralAlto: 40 }
  ];
  obtenerPorZona(zonaId: number) { return this.umbrales.find(u => u.zonaId === zonaId); }
  calcularNivel(zonaId: number, cantidad: number): NivelConcentracion | null {
    const umbral = this.obtenerPorZona(zonaId);
    if (!umbral) return null;
    return cantidad >= umbral.umbralAlto ? 'alto' : cantidad >= umbral.umbralMedio ? 'medio' : 'bajo';
  }
}
