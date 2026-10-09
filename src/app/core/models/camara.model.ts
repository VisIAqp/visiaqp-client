export type TipoCamara = 'fija' | 'movil';
export type EstadoCamara = 'activa' | 'inactiva' | 'mantenimiento';
// Vista pública: url_stream se envía solo al registrar o reemplazar la fuente.
export interface Camara {
  id: number;
  nombre: string;
  zonaId: number;
  tipo: TipoCamara;
  estado: EstadoCamara;
  intervaloMuestreoSeg: number;
  zonePolygon: [number, number][] | null;
  ultimaConexion: Date | null;
}
export interface ConfiguracionCamara {
  nombre: string;
  zonaId: number;
  tipo: TipoCamara;
  estado: EstadoCamara;
  intervaloMuestreoSeg: number;
  urlStream: string;
}
