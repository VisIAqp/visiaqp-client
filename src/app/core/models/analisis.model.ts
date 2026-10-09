import { NivelConcentracion } from './monitoreo.model';

export interface RegistroAnalisis {
  id: number;
  camaraId: number;
  fecha: Date;
  peatonesDetectados: number;
  nivel: NivelConcentracion;
}