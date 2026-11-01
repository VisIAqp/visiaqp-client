import { PaginaMetricas, PuntoSerie } from './metricas.model';

export interface EstadoSincronizacion { ultimo_intento: string; ultimo_exito: string | null; estado: string; detalle: string | null; }
export interface EventoCalendario {
  id_evento: number; fecha: string; nombre: string; tipo: 'feriado' | 'no_laborable' | 'evento';
  alcance: 'nacional' | 'local'; id_zona: number | null; fuente: string; referencia: string;
  activo: boolean; actualizado_en: string; editable: boolean;
}
export interface EventoEntrada { fecha: string; nombre: string; tipo: 'feriado' | 'no_laborable' | 'evento';
  alcance: 'nacional' | 'local'; id_zona: number | null; referencia: string; activo: boolean; }
export interface ClimaHora { hora: string; temperatura_c: number | null; precipitacion_mm: number | null;
  humedad_porcentaje: number | null; codigo_tiempo: number | null; tipo_dato: string; modelo: string;
  fuente: string; consultado_en: string; }
export interface PaginaCalendario extends PaginaMetricas<EventoCalendario> { sincronizacion: EstadoSincronizacion | null; aviso: string; }
export interface PaginaClima extends PaginaMetricas<ClimaHora> { sincronizacion: EstadoSincronizacion | null; coordenadas_configuradas: boolean; atribucion: string; }
export interface SerieContexto extends PuntoSerie { temperatura_c: number | null; precipitacion_mm: number | null;
  humedad_porcentaje: number | null; codigo_tiempo: number | null; tipo_clima: string | null;
  modelo_clima: string | null; clima_consultado_en: string | null;
  es_feriado: boolean; es_no_laborable: boolean; tiene_evento: boolean; }
export interface ResultadoSincronizacion { estado: 'actualizado' | 'cache'; registros: number; consultado_en: string; }
