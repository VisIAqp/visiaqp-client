export type TipoFuente = 'RTSP' | 'HTTP' | 'LOCAL';

export interface Camara {
  id: number;
  nombre: string;
  zonaId: number;
  tipoFuente: TipoFuente;
  fuente: string;
  activa: boolean;
  analisisActivo: boolean;
}