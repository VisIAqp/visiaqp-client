export type EstadoMedicion = 'disponible' | 'sin_datos' | 'datos_incompletos' |
  'fuentes_sin_consolidar' | 'ejecuciones_sin_consolidar';
export interface FiltrosMetricas {
  desde: string;
  hasta: string;
  periodo: 'hora' | 'dia';
  id_zona?: number;
  id_camara?: number;
  id_procesamiento?: number;
  tipo_fuente?: 'imagen' | 'video' | 'stream';
}
export interface PaginaMetricas<T> {
  consultado_en: string;
  zona_horaria: string;
  desde?: string;
  hasta?: string;
  total: number;
  limite: number;
  desplazamiento: number;
  tiene_mas: boolean;
  datos: T[];
}
export interface ResumenMetricas {
  desde: string;
  hasta: string;
  consultado_en: string;
  cantidad_ventanas: number;
  suma_identificadores: number;
  ventanas_con_ocupacion: number;
  zonas_con_resultados: number;
  camaras_con_resultados: number;
  procesamientos_con_resultados: number;
  ultima_ventana_fin: string | null;
  ultima_recepcion: string | null;
  camaras_habilitadas: number;
  camaras_registradas: number;
  zonas_activas: number;
  procesamientos_en_curso: number;
  videos_pendientes: number;
  transmisiones_reportando: number;
}
export interface MedicionAgregada {
  id_zona: number;
  nombre_zona: string;
  cantidad_ventanas: number;
  suma_identificadores: number;
  ventanas_con_ocupacion: number;
  camaras_distintas: number;
  procesamientos_distintos: number;
  primera_ventana_inicio: string;
  ultima_ventana_fin: string;
  ultima_recepcion: string;
  promedio_presentes: number | null;
  max_presentes: number | null;
  segundos_observados: number | null;
  nivel_ocupacion: 'bajo' | 'medio' | 'alto' | null;
  estado_ocupacion: EstadoMedicion;
}
export interface PuntoSerie extends MedicionAgregada {
  id_camara: number | null;
  id_procesamiento: number;
  tipo_fuente: string;
  periodo_inicio: string;
  periodo_fin: string;
  periodo_cerrado: boolean;
}
export interface PatronHorario extends MedicionAgregada {
  dia_semana: number;
  hora: number;
}
export interface DistribucionNivel {
  id_zona: number;
  nombre_zona: string;
  nivel_ocupacion: 'bajo' | 'medio' | 'alto' | null;
  estado_ocupacion: EstadoMedicion;
  cantidad_periodos: number;
}
export interface EstadoCamara {
  id_camara: number;
  id_zona: number;
  nombre_camara: string;
  nombre_zona: string;
  estado_configuracion: string;
  estado_operativo: string;
  id_procesamiento: number | null;
  ultima_actividad: string | null;
  ultima_muestra: string | null;
  segundos_sin_actividad: number | null;
  fps_procesamiento: number | null;
  edad_imagen_seg: number | null;
}
export interface PaginaCamaras extends PaginaMetricas<EstadoCamara> {
  inactividad_limite_seg: number;
}
