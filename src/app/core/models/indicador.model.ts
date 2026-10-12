import { NivelConcentracion } from './monitoreo.model';
export type PeriodoTipo = 'hora' | 'dia';
export interface Indicador {
  id: number;
  zonaId: number;
  periodoTipo: PeriodoTipo;
  periodoInicio: Date;
  periodoFin: Date;
  totalPeatones: number;
  promedioPeatones: number;
  maxPeatones: number;
  nivelConcentracion: NivelConcentracion;
}
export interface UmbralConcentracion {
  zonaId: number;
  umbralMedio: number;
  umbralAlto: number;
}
