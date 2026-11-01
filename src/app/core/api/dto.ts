import { inject, Injectable } from '@angular/core';
import { API_CONFIG } from './api-config';
import { Zona } from '../models/zona.model';
import { Camara } from '../models/camara.model';
import { Indicador, PeriodoTipo } from '../models/indicador.model';
import { Procesamiento, EstadoProcesamiento, TipoFuente } from '../models/analisis.model';
import { NivelConcentracion } from '../models/monitoreo.model';

export interface ZonaDto {
  id_zona: number;
  nombre: string;
  descripcion: string | null;
  ubicacion: string | null;
  pais: string;
  latitud: number | string | null;
  longitud: number | string | null;
  estado: 'activa' | 'inactiva';
}
export interface CamaraDto {
  id_camara: number;
  id_zona: number;
  nombre: string;
  tipo: Camara['tipo'];
  estado: Camara['estado'];
  intervalo_muestreo_seg: number;
  zone_polygon: [number, number][] | null;
  ultima_conexion: string | null;
  tiene_url_stream: boolean;
}
export interface IndicadorDto {
  id_indicador: number;
  id_zona: number;
  periodo_tipo: PeriodoTipo;
  periodo_inicio: string;
  periodo_fin: string;
  total_peatones: number;
  promedio_peatones: number;
  max_peatones: number;
  nivel_concentracion: NivelConcentracion;
  promedio_presentes?: number | null;
  max_presentes?: number | null;
  segundos_observados?: number | null;
  nivel_ocupacion?: NivelConcentracion | null;
  estado_ocupacion?: string;
  nombre_zona?: string;
}
export interface ProcesamientoDto {
  id_procesamiento: number;
  id_zona: number;
  id_camara: number | null;
  id_usuario: number | null;
  tipo_fuente: TipoFuente;
  ruta_archivo: string | null;
  fecha_captura_inicio: string;
  fecha_inicio_proceso: string;
  fecha_fin_proceso: string | null;
  estado: EstadoProcesamiento;
  mensaje_error: string | null;
  inactividad_limite_seg?: number;
  ultima_actividad?: string | null;
  ultima_muestra?: string | null;
  fps_procesamiento?: number | null;
  retraso_seg?: number | null;
}
export interface VideoDto {
  id_video: number;
  nombre_archivo: string;
  tamano_bytes: number;
  fecha_modificacion: string;
  disponible: boolean;
  fecha_ultima_sincronizacion: string;
}

@Injectable({ providedIn: 'root' })
export class DtoMapper {
  private config = inject(API_CONFIG);
  date(value: string): Date {
    // Current API returns naive datetimes. Offset is an explicit integration setting.
    const zoned = /(?:Z|[+-]\d{2}:\d{2})$/i.test(value)
      ? value
      : value + this.config.naiveDateOffset;
    return new Date(zoned);
  }
  zona(d: ZonaDto): Zona {
    return {
      id: d.id_zona,
      nombre: d.nombre,
      descripcion: d.descripcion,
      ubicacion: d.ubicacion,
      pais: d.pais,
      latitud: d.latitud === null ? null : Number(d.latitud),
      longitud: d.longitud === null ? null : Number(d.longitud),
      estado: d.estado,
    };
  }
  camara(d: CamaraDto): Camara {
    return {
      id: d.id_camara,
      zonaId: d.id_zona,
      nombre: d.nombre,
      tipo: d.tipo,
      estado: d.estado,
      intervaloMuestreoSeg: d.intervalo_muestreo_seg,
      zonePolygon: d.zone_polygon,
      ultimaConexion: d.ultima_conexion ? this.date(d.ultima_conexion) : null,
      tieneUrlStream: d.tiene_url_stream,
    };
  }
  indicador(d: IndicadorDto): Indicador {
    return {
      id: d.id_indicador,
      zonaId: d.id_zona,
      periodoTipo: d.periodo_tipo,
      periodoInicio: this.date(d.periodo_inicio),
      periodoFin: this.date(d.periodo_fin),
      totalPeatones: d.total_peatones,
      promedioPeatones: d.promedio_peatones,
      maxPeatones: d.max_peatones,
      nivelConcentracion: d.nivel_concentracion,
      promedioPresentes: d.promedio_presentes ?? null,
      maxPresentes: d.max_presentes ?? null,
      segundosObservados: d.segundos_observados ?? null,
      nivelOcupacion: d.nivel_ocupacion ?? null,
      estadoOcupacion: d.estado_ocupacion ?? 'sin_datos',
    };
  }
  procesamiento(d: ProcesamientoDto): Procesamiento {
    return {
      id: d.id_procesamiento,
      zonaId: d.id_zona,
      camaraId: d.id_camara,
      usuarioId: d.id_usuario,
      tipoFuente: d.tipo_fuente,
      rutaArchivo: d.ruta_archivo,
      fechaCapturaInicio: this.date(d.fecha_captura_inicio),
      fechaInicioProceso: this.date(d.fecha_inicio_proceso),
      fechaFinProceso: d.fecha_fin_proceso ? this.date(d.fecha_fin_proceso) : null,
      estado: d.estado,
      mensajeError: d.mensaje_error,
      limiteInactividadSeg: d.inactividad_limite_seg ?? 120,
      ultimaActividad: d.ultima_actividad ? this.date(d.ultima_actividad) : null,
      ultimaMuestra: d.ultima_muestra ? this.date(d.ultima_muestra) : null,
      fpsProcesamiento: d.fps_procesamiento ?? null,
      retrasoSeg: d.retraso_seg ?? null,
    };
  }
}
