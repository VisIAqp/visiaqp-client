export type NivelConcentracion = 'bajo' | 'medio' | 'alto';
export interface MonitoreoCamara {
  camaraId: number;
  cantidadPeatones: number;
  nivel: NivelConcentracion | null;
  periodoInicio: Date;
  periodoFin: Date;
}
