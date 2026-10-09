import { Injectable } from '@angular/core';
import { Camara, TipoFuente } from '../models/camara.model';

@Injectable({
  providedIn: 'root'
})
export class CamaraService {

  private camaras: Camara[] = [
    {
      id: 1,
      nombre: 'Cámara UTP 01',
      zonaId: 1,
      tipoFuente: 'RTSP',
      fuente: 'rtsp://192.168.1.101/stream',
      activa: true,
      analisisActivo: true
    },
    {
      id: 2,
      nombre: 'Cámara UTP 02',
      zonaId: 1,
      tipoFuente: 'LOCAL',
      fuente: '0',
      activa: true,
      analisisActivo: true
    },
    {
      id: 3,
      nombre: 'Cámara Plaza 01',
      zonaId: 2,
      tipoFuente: 'RTSP',
      fuente: 'rtsp://192.168.1.103/stream',
      activa: false,
      analisisActivo: false
    }
  ];

  obtenerCamaras(): Camara[] {
    return this.camaras;
  }

  obtenerCamaraPorId(id: number): Camara | undefined {
    return this.camaras.find(camara => camara.id === id);
  }

  agregarCamara(
    nombre: string,
    zonaId: number,
    tipoFuente: TipoFuente,
    fuente: string,
    analisisActivo: boolean
  ): void {

    const nuevoId =
      Math.max(0, ...this.camaras.map(camara => camara.id)) + 1;

    this.camaras.push({
      id: nuevoId,
      nombre: nombre.trim(),
      zonaId,
      tipoFuente,
      fuente: fuente.trim(),
      activa: true,
      analisisActivo
    });
  }

  actualizarCamara(
    id: number,
    nombre: string,
    zonaId: number,
    tipoFuente: TipoFuente,
    fuente: string,
    analisisActivo: boolean
  ): void {

    const camara = this.obtenerCamaraPorId(id);

    if (!camara) {
      return;
    }

    camara.nombre = nombre.trim();
    camara.zonaId = zonaId;
    camara.tipoFuente = tipoFuente;
    camara.fuente = fuente.trim();
    camara.analisisActivo = analisisActivo;
  }

  cambiarEstado(id: number): void {

    const camara = this.obtenerCamaraPorId(id);

    if (!camara) {
      return;
    }

    camara.activa = !camara.activa;

    if (!camara.activa) {
      camara.analisisActivo = false;
    }
  }

  contarCamarasPorZona(zonaId: number): number {
    return this.camaras.filter(
      camara => camara.zonaId === zonaId
    ).length;
  }
}