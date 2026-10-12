import { NivelConcentracion } from './monitoreo.model';
export type TipoFuente = 'imagen' | 'video' | 'stream';
export type EstadoProcesamiento = 'pendiente' | 'procesando' | 'completado' | 'error';
export interface Procesamiento {
  id: number;
  zonaId: number;
  camaraId: number | null;
  usuarioId: number | null;
  tipoFuente: TipoFuente;
  rutaArchivo: string | null;
  fechaCapturaInicio: Date;
  fechaInicioProceso: Date;
  fechaFinProceso: Date | null;
  estado: EstadoProcesamiento;
  mensajeError: string | null;
}
export interface ResultadoDeteccion {
  id: number;
  procesamientoId: number;
  periodoInicio: Date;
  periodoFin: Date;
  cantidadPeatones: number;
  confianzaPromedio: number | null;
}
// Vista de pantalla: combina resultado_deteccion con procesamiento.
export interface RegistroAnalisis extends ResultadoDeteccion {
  zonaId: number;
  camaraId: number | null;
  tipoFuente: TipoFuente;
  nivel: NivelConcentracion | null;
}
