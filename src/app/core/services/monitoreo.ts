import { Injectable } from '@angular/core';
import {
  MonitoreoCamara,
  NivelConcentracion
} from '../models/monitoreo.model';

@Injectable({
  providedIn: 'root'
})
export class MonitoreoService {

  private monitoreo: MonitoreoCamara[] = [
    {
      camaraId: 1,
      peatonesDetectados: 42,
      nivel: 'Medio',
      ultimaActualizacion: new Date()
    },
    {
      camaraId: 2,
      peatonesDetectados: 18,
      nivel: 'Bajo',
      ultimaActualizacion: new Date()
    }
  ];

  obtenerMonitoreo(): MonitoreoCamara[] {
    return this.monitoreo;
  }

  obtenerPorCamara(
    camaraId: number
  ): MonitoreoCamara | undefined {

    return this.monitoreo.find(
      monitoreo => monitoreo.camaraId === camaraId
    );
  }

  calcularNivel(cantidad: number): NivelConcentracion {

    if (cantidad >= 60) {
      return 'Alto';
    }

    if (cantidad >= 30) {
      return 'Medio';
    }

    return 'Bajo';
  }

  actualizarConteo(
    camaraId: number,
    cantidad: number
  ): void {

    const registro = this.obtenerPorCamara(camaraId);

    if (registro) {

      registro.peatonesDetectados = cantidad;
      registro.nivel = this.calcularNivel(cantidad);
      registro.ultimaActualizacion = new Date();

      return;
    }

    this.monitoreo.push({
      camaraId,
      peatonesDetectados: cantidad,
      nivel: this.calcularNivel(cantidad),
      ultimaActualizacion: new Date()
    });
  }
}