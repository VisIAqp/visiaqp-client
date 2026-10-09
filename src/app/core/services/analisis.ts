import { procesamientosAdicionales, resultadosAdicionales } from '../data/demo';
import { Injectable, inject } from '@angular/core';
import { Procesamiento, RegistroAnalisis, ResultadoDeteccion } from '../models/analisis.model';
import { UmbralService } from './umbral';
const fecha = (hora: string) => new Date('2026-10-09T' + hora + '-05:00');
@Injectable({ providedIn: 'root' })
export class AnalisisService {
  private umbral = inject(UmbralService);
  private procesamientos: Procesamiento[] = [
    { id: 1, zonaId: 1, camaraId: 1, usuarioId: null, tipoFuente: 'stream', rutaArchivo: null, fechaCapturaInicio: fecha('08:00:00'), fechaInicioProceso: fecha('08:00:00'), fechaFinProceso: null, estado: 'procesando', mensajeError: null },
    { id: 2, zonaId: 2, camaraId: null, usuarioId: null, tipoFuente: 'video', rutaArchivo: 'demo/utp.mp4', fechaCapturaInicio: fecha('09:00:00'), fechaInicioProceso: fecha('11:00:00'), fechaFinProceso: fecha('11:02:00'), estado: 'completado', mensajeError: null },
    { id: 3, zonaId: 3, camaraId: null, usuarioId: null, tipoFuente: 'imagen', rutaArchivo: 'demo/plaza.jpg', fechaCapturaInicio: fecha('10:00:00'), fechaInicioProceso: fecha('11:00:00'), fechaFinProceso: null, estado: 'pendiente', mensajeError: null },
    { id: 4, zonaId: 2, camaraId: 2, usuarioId: null, tipoFuente: 'stream', rutaArchivo: null, fechaCapturaInicio: fecha('10:00:00'), fechaInicioProceso: fecha('10:00:00'), fechaFinProceso: fecha('10:00:05'), estado: 'error', mensajeError: 'No se pudo conectar con la cámara (ejemplo).' },
    ...procesamientosAdicionales
  ];
  private resultados: ResultadoDeteccion[] = [
    { id: 1, procesamientoId: 1, periodoInicio: fecha('08:00:00'), periodoFin: fecha('08:01:00'), cantidadPeatones: 0, confianzaPromedio: null },
    { id: 2, procesamientoId: 1, periodoInicio: fecha('08:01:00'), periodoFin: fecha('08:02:00'), cantidadPeatones: 18, confianzaPromedio: 87.5 },
    { id: 3, procesamientoId: 1, periodoInicio: fecha('08:02:00'), periodoFin: fecha('08:03:00'), cantidadPeatones: 35, confianzaPromedio: 91.2 },
    { id: 4, procesamientoId: 2, periodoInicio: fecha('09:00:00'), periodoFin: fecha('09:01:00'), cantidadPeatones: 12, confianzaPromedio: 85 },
    { id: 5, procesamientoId: 2, periodoInicio: fecha('09:01:00'), periodoFin: fecha('09:02:00'), cantidadPeatones: 44, confianzaPromedio: 89 },
    ...resultadosAdicionales
  ];
  obtenerProcesamientos() { return this.procesamientos; }
  estaAnalizando(camaraId: number) { return this.procesamientos.some(p => p.camaraId === camaraId && p.estado === 'procesando'); }
  obtenerRegistros(): RegistroAnalisis[] {
    return this.resultados.map(r => {
      const p = this.procesamientos.find(p => p.id === r.procesamientoId)!;
      return { ...r, zonaId: p.zonaId, camaraId: p.camaraId, tipoFuente: p.tipoFuente, nivel: this.umbral.calcularNivel(p.zonaId, r.cantidadPeatones) };
    });
  }
}
