export type NivelConcentracion = 'Bajo' | 'Medio' | 'Alto';

export interface MonitoreoCamara {
  camaraId: number;
  peatonesDetectados: number;
  nivel: NivelConcentracion;
  ultimaActualizacion: Date;
}