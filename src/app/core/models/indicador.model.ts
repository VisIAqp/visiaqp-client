import { NivelConcentracion } from './monitoreo.model';
export type PeriodoTipo = 'hora' | 'dia';
export interface IndicadorPeriodo {
  zonaId: number;
  periodoTipo: PeriodoTipo;
  periodoInicio: Date;
  periodoFin: Date;
  totalPeatones: number;
  promedioPeatones: number;
  maxPeatones: number;
  promedioPresentes?: number | null;
  maxPresentes?: number | null;
  segundosObservados?: number | null;
  nivelOcupacion?: NivelConcentracion | null;
  estadoOcupacion?: string;
}
export interface Indicador extends IndicadorPeriodo {
  id: number;
  nivelConcentracion: NivelConcentracion;
}
export interface UmbralConcentracion {
  zonaId: number;
  umbralMedio: number;
  umbralAlto: number;
}
