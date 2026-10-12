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
  fechaCalculo: Date;
}
export interface UmbralConcentracion {
  id: number;
  zonaId: number;
  umbralMedio: number;
  umbralAlto: number;
}
