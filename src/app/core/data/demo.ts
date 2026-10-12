// Datos ficticios deterministas para revisar las pantallas. No son datos reales.
import { Zona } from '../models/zona.model';
import { Camara } from '../models/camara.model';
import { Procesamiento, ResultadoDeteccion } from '../models/analisis.model';
import { Indicador } from '../models/indicador.model';

export const zonasAdicionales: Zona[] = [
  {
    id: 4,
    nombre: "Av. Ejército",
    descripcion: "Sector comercial de prueba",
    ubicacion: "Cayma, Arequipa",
    pais: "PE",
    latitud: null,
    longitud: null,
    estado: "activa"
  },
  {
    id: 5,
    nombre: "Parque de prueba",
    descripcion: "Ejemplo sin umbral configurado",
    ubicacion: "Arequipa, Perú",
    pais: "PE",
    latitud: null,
    longitud: null,
    estado: "activa"
  },
  {
    id: 6,
    nombre: "Zona activa sin resultados",
    descripcion: "Cámara disponible sin ventanas",
    ubicacion: "Arequipa, Perú",
    pais: "PE",
    latitud: null,
    longitud: null,
    estado: "activa"
  }
];

export const camarasAdicionales: Camara[] = [
  {
    id: 4,
    nombre: "UTP · acceso peatonal",
    zonaId: 2,
    tipo: "fija",
    estado: "activa",
    intervaloMuestreoSeg: 60,
    zonePolygon: null,
    ultimaConexion: null
  },
  {
    id: 5,
    nombre: "Ejército · sector comercial",
    zonaId: 4,
    tipo: "fija",
    estado: "activa",
    intervaloMuestreoSeg: 60,
    zonePolygon: null,
    ultimaConexion: null
  },
  {
    id: 6,
    nombre: "Parque · cámara móvil",
    zonaId: 5,
    tipo: "movil",
    estado: "activa",
    intervaloMuestreoSeg: 60,
    zonePolygon: null,
    ultimaConexion: null
  },
  {
    id: 7,
    nombre: "Prueba · esperando conexión",
    zonaId: 6,
    tipo: "fija",
    estado: "activa",
    intervaloMuestreoSeg: 120,
    zonePolygon: null,
    ultimaConexion: null
  },
  {
    id: 8,
    nombre: "Ejército · cámara retirada",
    zonaId: 4,
    tipo: "fija",
    estado: "inactiva",
    intervaloMuestreoSeg: 60,
    zonePolygon: null,
    ultimaConexion: null
  }
];

export const procesamientosAdicionales: Procesamiento[] = [
  {
    id: 5,
    zonaId: 1,
    camaraId: 1,
    usuarioId: null,
    tipoFuente: "video",
    rutaArchivo: "demo/zona-1-7.mp4",
    fechaCapturaInicio: new Date("2026-10-07T08:10:00-05:00"),
    fechaInicioProceso: new Date("2026-10-07T08:10:00-05:00"),
    fechaFinProceso: new Date("2026-10-07T18:00:00-05:00"),
    estado: "completado",
    mensajeError: null
  },
  {
    id: 6,
    zonaId: 2,
    camaraId: 4,
    usuarioId: null,
    tipoFuente: "video",
    rutaArchivo: "demo/zona-2-7.mp4",
    fechaCapturaInicio: new Date("2026-10-07T08:10:00-05:00"),
    fechaInicioProceso: new Date("2026-10-07T08:10:00-05:00"),
    fechaFinProceso: new Date("2026-10-07T18:00:00-05:00"),
    estado: "completado",
    mensajeError: null
  },
  {
    id: 7,
    zonaId: 4,
    camaraId: 5,
    usuarioId: null,
    tipoFuente: "video",
    rutaArchivo: "demo/zona-4-7.mp4",
    fechaCapturaInicio: new Date("2026-10-07T08:10:00-05:00"),
    fechaInicioProceso: new Date("2026-10-07T08:10:00-05:00"),
    fechaFinProceso: new Date("2026-10-07T18:00:00-05:00"),
    estado: "completado",
    mensajeError: null
  },
  {
    id: 8,
    zonaId: 1,
    camaraId: 1,
    usuarioId: null,
    tipoFuente: "video",
    rutaArchivo: "demo/zona-1-8.mp4",
    fechaCapturaInicio: new Date("2026-10-08T08:10:00-05:00"),
    fechaInicioProceso: new Date("2026-10-08T08:10:00-05:00"),
    fechaFinProceso: new Date("2026-10-08T18:00:00-05:00"),
    estado: "completado",
    mensajeError: null
  },
  {
    id: 9,
    zonaId: 2,
    camaraId: 4,
    usuarioId: null,
    tipoFuente: "video",
    rutaArchivo: "demo/zona-2-8.mp4",
    fechaCapturaInicio: new Date("2026-10-08T08:10:00-05:00"),
    fechaInicioProceso: new Date("2026-10-08T08:10:00-05:00"),
    fechaFinProceso: new Date("2026-10-08T18:00:00-05:00"),
    estado: "completado",
    mensajeError: null
  },
  {
    id: 10,
    zonaId: 4,
    camaraId: 5,
    usuarioId: null,
    tipoFuente: "video",
    rutaArchivo: "demo/zona-4-8.mp4",
    fechaCapturaInicio: new Date("2026-10-08T08:10:00-05:00"),
    fechaInicioProceso: new Date("2026-10-08T08:10:00-05:00"),
    fechaFinProceso: new Date("2026-10-08T18:00:00-05:00"),
    estado: "completado",
    mensajeError: null
  },
  {
    id: 11,
    zonaId: 1,
    camaraId: 1,
    usuarioId: null,
    tipoFuente: "stream",
    rutaArchivo: null,
    fechaCapturaInicio: new Date("2026-10-09T08:10:00-05:00"),
    fechaInicioProceso: new Date("2026-10-09T08:10:00-05:00"),
    fechaFinProceso: null,
    estado: "procesando",
    mensajeError: null
  },
  {
    id: 12,
    zonaId: 2,
    camaraId: 4,
    usuarioId: null,
    tipoFuente: "stream",
    rutaArchivo: null,
    fechaCapturaInicio: new Date("2026-10-09T08:10:00-05:00"),
    fechaInicioProceso: new Date("2026-10-09T08:10:00-05:00"),
    fechaFinProceso: null,
    estado: "procesando",
    mensajeError: null
  },
  {
    id: 13,
    zonaId: 4,
    camaraId: 5,
    usuarioId: null,
    tipoFuente: "stream",
    rutaArchivo: null,
    fechaCapturaInicio: new Date("2026-10-09T08:10:00-05:00"),
    fechaInicioProceso: new Date("2026-10-09T08:10:00-05:00"),
    fechaFinProceso: null,
    estado: "procesando",
    mensajeError: null
  },
  {
    id: 14,
    zonaId: 5,
    camaraId: 6,
    usuarioId: null,
    tipoFuente: "stream",
    rutaArchivo: null,
    fechaCapturaInicio: new Date("2026-10-09T12:00:00-05:00"),
    fechaInicioProceso: new Date("2026-10-09T12:00:00-05:00"),
    fechaFinProceso: null,
    estado: "procesando",
    mensajeError: null
  },
  {
    id: 15,
    zonaId: 6,
    camaraId: 7,
    usuarioId: null,
    tipoFuente: "stream",
    rutaArchivo: null,
    fechaCapturaInicio: new Date("2026-10-09T12:00:00-05:00"),
    fechaInicioProceso: new Date("2026-10-09T12:00:00-05:00"),
    fechaFinProceso: null,
    estado: "pendiente",
    mensajeError: null
  }
];

export const resultadosAdicionales: ResultadoDeteccion[] = [
  {
    id: 6,
    procesamientoId: 5,
    periodoInicio: new Date("2026-10-07T08:10:00-05:00"),
    periodoFin: new Date("2026-10-07T08:11:00-05:00"),
    cantidadPeatones: 0,
    confianzaPromedio: null
  },
  {
    id: 7,
    procesamientoId: 5,
    periodoInicio: new Date("2026-10-07T08:11:00-05:00"),
    periodoFin: new Date("2026-10-07T08:12:00-05:00"),
    cantidadPeatones: 0,
    confianzaPromedio: null
  },
  {
    id: 8,
    procesamientoId: 5,
    periodoInicio: new Date("2026-10-07T08:12:00-05:00"),
    periodoFin: new Date("2026-10-07T08:13:00-05:00"),
    cantidadPeatones: 0,
    confianzaPromedio: null
  },
  {
    id: 9,
    procesamientoId: 5,
    periodoInicio: new Date("2026-10-07T08:13:00-05:00"),
    periodoFin: new Date("2026-10-07T08:14:00-05:00"),
    cantidadPeatones: 0,
    confianzaPromedio: null
  },
  {
    id: 10,
    procesamientoId: 5,
    periodoInicio: new Date("2026-10-07T09:10:00-05:00"),
    periodoFin: new Date("2026-10-07T09:11:00-05:00"),
    cantidadPeatones: 10,
    confianzaPromedio: 87.7
  },
  {
    id: 11,
    procesamientoId: 5,
    periodoInicio: new Date("2026-10-07T09:11:00-05:00"),
    periodoFin: new Date("2026-10-07T09:12:00-05:00"),
    cantidadPeatones: 12,
    confianzaPromedio: 88.4
  },
  {
    id: 12,
    procesamientoId: 5,
    periodoInicio: new Date("2026-10-07T09:12:00-05:00"),
    periodoFin: new Date("2026-10-07T09:13:00-05:00"),
    cantidadPeatones: 14,
    confianzaPromedio: 89.1
  },
  {
    id: 13,
    procesamientoId: 5,
    periodoInicio: new Date("2026-10-07T09:13:00-05:00"),
    periodoFin: new Date("2026-10-07T09:14:00-05:00"),
    cantidadPeatones: 16,
    confianzaPromedio: 89.8
  },
  {
    id: 14,
    procesamientoId: 5,
    periodoInicio: new Date("2026-10-07T12:10:00-05:00"),
    periodoFin: new Date("2026-10-07T12:11:00-05:00"),
    cantidadPeatones: 33,
    confianzaPromedio: 90.5
  },
  {
    id: 15,
    procesamientoId: 5,
    periodoInicio: new Date("2026-10-07T12:11:00-05:00"),
    periodoFin: new Date("2026-10-07T12:12:00-05:00"),
    cantidadPeatones: 35,
    confianzaPromedio: 91.2
  },
  {
    id: 16,
    procesamientoId: 5,
    periodoInicio: new Date("2026-10-07T12:12:00-05:00"),
    periodoFin: new Date("2026-10-07T12:13:00-05:00"),
    cantidadPeatones: 37,
    confianzaPromedio: 91.9
  },
  {
    id: 17,
    procesamientoId: 5,
    periodoInicio: new Date("2026-10-07T12:13:00-05:00"),
    periodoFin: new Date("2026-10-07T12:14:00-05:00"),
    cantidadPeatones: 39,
    confianzaPromedio: 92.6
  },
  {
    id: 18,
    procesamientoId: 5,
    periodoInicio: new Date("2026-10-07T17:10:00-05:00"),
    periodoFin: new Date("2026-10-07T17:11:00-05:00"),
    cantidadPeatones: 50,
    confianzaPromedio: 93.3
  },
  {
    id: 19,
    procesamientoId: 5,
    periodoInicio: new Date("2026-10-07T17:11:00-05:00"),
    periodoFin: new Date("2026-10-07T17:12:00-05:00"),
    cantidadPeatones: 52,
    confianzaPromedio: 94
  },
  {
    id: 20,
    procesamientoId: 5,
    periodoInicio: new Date("2026-10-07T17:12:00-05:00"),
    periodoFin: new Date("2026-10-07T17:13:00-05:00"),
    cantidadPeatones: 54,
    confianzaPromedio: 94.7
  },
  {
    id: 21,
    procesamientoId: 5,
    periodoInicio: new Date("2026-10-07T17:13:00-05:00"),
    periodoFin: new Date("2026-10-07T17:14:00-05:00"),
    cantidadPeatones: 56,
    confianzaPromedio: 95.4
  },
  {
    id: 22,
    procesamientoId: 6,
    periodoInicio: new Date("2026-10-07T08:10:00-05:00"),
    periodoFin: new Date("2026-10-07T08:11:00-05:00"),
    cantidadPeatones: 0,
    confianzaPromedio: null
  },
  {
    id: 23,
    procesamientoId: 6,
    periodoInicio: new Date("2026-10-07T08:11:00-05:00"),
    periodoFin: new Date("2026-10-07T08:12:00-05:00"),
    cantidadPeatones: 0,
    confianzaPromedio: null
  },
  {
    id: 24,
    procesamientoId: 6,
    periodoInicio: new Date("2026-10-07T08:12:00-05:00"),
    periodoFin: new Date("2026-10-07T08:13:00-05:00"),
    cantidadPeatones: 0,
    confianzaPromedio: null
  },
  {
    id: 25,
    procesamientoId: 6,
    periodoInicio: new Date("2026-10-07T08:13:00-05:00"),
    periodoFin: new Date("2026-10-07T08:14:00-05:00"),
    cantidadPeatones: 0,
    confianzaPromedio: null
  },
  {
    id: 26,
    procesamientoId: 6,
    periodoInicio: new Date("2026-10-07T09:10:00-05:00"),
    periodoFin: new Date("2026-10-07T09:11:00-05:00"),
    cantidadPeatones: 21,
    confianzaPromedio: 98.9
  },
  {
    id: 27,
    procesamientoId: 6,
    periodoInicio: new Date("2026-10-07T09:11:00-05:00"),
    periodoFin: new Date("2026-10-07T09:12:00-05:00"),
    cantidadPeatones: 23,
    confianzaPromedio: 80.6
  },
  {
    id: 28,
    procesamientoId: 6,
    periodoInicio: new Date("2026-10-07T09:12:00-05:00"),
    periodoFin: new Date("2026-10-07T09:13:00-05:00"),
    cantidadPeatones: 25,
    confianzaPromedio: 81.3
  },
  {
    id: 29,
    procesamientoId: 6,
    periodoInicio: new Date("2026-10-07T09:13:00-05:00"),
    periodoFin: new Date("2026-10-07T09:14:00-05:00"),
    cantidadPeatones: 27,
    confianzaPromedio: 82
  },
  {
    id: 30,
    procesamientoId: 6,
    periodoInicio: new Date("2026-10-07T12:10:00-05:00"),
    periodoFin: new Date("2026-10-07T12:11:00-05:00"),
    cantidadPeatones: 41,
    confianzaPromedio: 82.7
  },
  {
    id: 31,
    procesamientoId: 6,
    periodoInicio: new Date("2026-10-07T12:11:00-05:00"),
    periodoFin: new Date("2026-10-07T12:12:00-05:00"),
    cantidadPeatones: 43,
    confianzaPromedio: 83.4
  },
  {
    id: 32,
    procesamientoId: 6,
    periodoInicio: new Date("2026-10-07T12:12:00-05:00"),
    periodoFin: new Date("2026-10-07T12:13:00-05:00"),
    cantidadPeatones: 45,
    confianzaPromedio: 84.1
  },
  {
    id: 33,
    procesamientoId: 6,
    periodoInicio: new Date("2026-10-07T12:13:00-05:00"),
    periodoFin: new Date("2026-10-07T12:14:00-05:00"),
    cantidadPeatones: 47,
    confianzaPromedio: 84.8
  },
  {
    id: 34,
    procesamientoId: 6,
    periodoInicio: new Date("2026-10-07T17:10:00-05:00"),
    periodoFin: new Date("2026-10-07T17:11:00-05:00"),
    cantidadPeatones: 60,
    confianzaPromedio: 85.5
  },
  {
    id: 35,
    procesamientoId: 6,
    periodoInicio: new Date("2026-10-07T17:11:00-05:00"),
    periodoFin: new Date("2026-10-07T17:12:00-05:00"),
    cantidadPeatones: 62,
    confianzaPromedio: 86.2
  },
  {
    id: 36,
    procesamientoId: 6,
    periodoInicio: new Date("2026-10-07T17:12:00-05:00"),
    periodoFin: new Date("2026-10-07T17:13:00-05:00"),
    cantidadPeatones: 64,
    confianzaPromedio: 86.9
  },
  {
    id: 37,
    procesamientoId: 6,
    periodoInicio: new Date("2026-10-07T17:13:00-05:00"),
    periodoFin: new Date("2026-10-07T17:14:00-05:00"),
    cantidadPeatones: 66,
    confianzaPromedio: 87.6
  },
  {
    id: 38,
    procesamientoId: 7,
    periodoInicio: new Date("2026-10-07T08:10:00-05:00"),
    periodoFin: new Date("2026-10-07T08:11:00-05:00"),
    cantidadPeatones: 0,
    confianzaPromedio: null
  },
  {
    id: 39,
    procesamientoId: 7,
    periodoInicio: new Date("2026-10-07T08:11:00-05:00"),
    periodoFin: new Date("2026-10-07T08:12:00-05:00"),
    cantidadPeatones: 0,
    confianzaPromedio: null
  },
  {
    id: 40,
    procesamientoId: 7,
    periodoInicio: new Date("2026-10-07T08:12:00-05:00"),
    periodoFin: new Date("2026-10-07T08:13:00-05:00"),
    cantidadPeatones: 0,
    confianzaPromedio: null
  },
  {
    id: 41,
    procesamientoId: 7,
    periodoInicio: new Date("2026-10-07T08:13:00-05:00"),
    periodoFin: new Date("2026-10-07T08:14:00-05:00"),
    cantidadPeatones: 0,
    confianzaPromedio: null
  },
  {
    id: 42,
    procesamientoId: 7,
    periodoInicio: new Date("2026-10-07T09:10:00-05:00"),
    periodoFin: new Date("2026-10-07T09:11:00-05:00"),
    cantidadPeatones: 17,
    confianzaPromedio: 91.1
  },
  {
    id: 43,
    procesamientoId: 7,
    periodoInicio: new Date("2026-10-07T09:11:00-05:00"),
    periodoFin: new Date("2026-10-07T09:12:00-05:00"),
    cantidadPeatones: 19,
    confianzaPromedio: 91.8
  },
  {
    id: 44,
    procesamientoId: 7,
    periodoInicio: new Date("2026-10-07T09:12:00-05:00"),
    periodoFin: new Date("2026-10-07T09:13:00-05:00"),
    cantidadPeatones: 21,
    confianzaPromedio: 92.5
  },
  {
    id: 45,
    procesamientoId: 7,
    periodoInicio: new Date("2026-10-07T09:13:00-05:00"),
    periodoFin: new Date("2026-10-07T09:14:00-05:00"),
    cantidadPeatones: 23,
    confianzaPromedio: 93.2
  },
  {
    id: 46,
    procesamientoId: 7,
    periodoInicio: new Date("2026-10-07T12:10:00-05:00"),
    periodoFin: new Date("2026-10-07T12:11:00-05:00"),
    cantidadPeatones: 45,
    confianzaPromedio: 93.9
  },
  {
    id: 47,
    procesamientoId: 7,
    periodoInicio: new Date("2026-10-07T12:11:00-05:00"),
    periodoFin: new Date("2026-10-07T12:12:00-05:00"),
    cantidadPeatones: 47,
    confianzaPromedio: 94.6
  },
  {
    id: 48,
    procesamientoId: 7,
    periodoInicio: new Date("2026-10-07T12:12:00-05:00"),
    periodoFin: new Date("2026-10-07T12:13:00-05:00"),
    cantidadPeatones: 49,
    confianzaPromedio: 95.3
  },
  {
    id: 49,
    procesamientoId: 7,
    periodoInicio: new Date("2026-10-07T12:13:00-05:00"),
    periodoFin: new Date("2026-10-07T12:14:00-05:00"),
    cantidadPeatones: 51,
    confianzaPromedio: 96
  },
  {
    id: 50,
    procesamientoId: 7,
    periodoInicio: new Date("2026-10-07T17:10:00-05:00"),
    periodoFin: new Date("2026-10-07T17:11:00-05:00"),
    cantidadPeatones: 67,
    confianzaPromedio: 96.7
  },
  {
    id: 51,
    procesamientoId: 7,
    periodoInicio: new Date("2026-10-07T17:11:00-05:00"),
    periodoFin: new Date("2026-10-07T17:12:00-05:00"),
    cantidadPeatones: 69,
    confianzaPromedio: 97.4
  },
  {
    id: 52,
    procesamientoId: 7,
    periodoInicio: new Date("2026-10-07T17:12:00-05:00"),
    periodoFin: new Date("2026-10-07T17:13:00-05:00"),
    cantidadPeatones: 71,
    confianzaPromedio: 98.1
  },
  {
    id: 53,
    procesamientoId: 7,
    periodoInicio: new Date("2026-10-07T17:13:00-05:00"),
    periodoFin: new Date("2026-10-07T17:14:00-05:00"),
    cantidadPeatones: 73,
    confianzaPromedio: 98.8
  },
  {
    id: 54,
    procesamientoId: 8,
    periodoInicio: new Date("2026-10-08T08:10:00-05:00"),
    periodoFin: new Date("2026-10-08T08:11:00-05:00"),
    cantidadPeatones: 1,
    confianzaPromedio: 80.5
  },
  {
    id: 55,
    procesamientoId: 8,
    periodoInicio: new Date("2026-10-08T08:11:00-05:00"),
    periodoFin: new Date("2026-10-08T08:12:00-05:00"),
    cantidadPeatones: 3,
    confianzaPromedio: 81.2
  },
  {
    id: 56,
    procesamientoId: 8,
    periodoInicio: new Date("2026-10-08T08:12:00-05:00"),
    periodoFin: new Date("2026-10-08T08:13:00-05:00"),
    cantidadPeatones: 5,
    confianzaPromedio: 81.9
  },
  {
    id: 57,
    procesamientoId: 8,
    periodoInicio: new Date("2026-10-08T08:13:00-05:00"),
    periodoFin: new Date("2026-10-08T08:14:00-05:00"),
    cantidadPeatones: 7,
    confianzaPromedio: 82.6
  },
  {
    id: 58,
    procesamientoId: 8,
    periodoInicio: new Date("2026-10-08T09:10:00-05:00"),
    periodoFin: new Date("2026-10-08T09:11:00-05:00"),
    cantidadPeatones: 13,
    confianzaPromedio: 83.3
  },
  {
    id: 59,
    procesamientoId: 8,
    periodoInicio: new Date("2026-10-08T09:11:00-05:00"),
    periodoFin: new Date("2026-10-08T09:12:00-05:00"),
    cantidadPeatones: 15,
    confianzaPromedio: 84
  },
  {
    id: 60,
    procesamientoId: 8,
    periodoInicio: new Date("2026-10-08T09:12:00-05:00"),
    periodoFin: new Date("2026-10-08T09:13:00-05:00"),
    cantidadPeatones: 17,
    confianzaPromedio: 84.7
  },
  {
    id: 61,
    procesamientoId: 8,
    periodoInicio: new Date("2026-10-08T09:13:00-05:00"),
    periodoFin: new Date("2026-10-08T09:14:00-05:00"),
    cantidadPeatones: 19,
    confianzaPromedio: 85.4
  },
  {
    id: 62,
    procesamientoId: 8,
    periodoInicio: new Date("2026-10-08T12:10:00-05:00"),
    periodoFin: new Date("2026-10-08T12:11:00-05:00"),
    cantidadPeatones: 36,
    confianzaPromedio: 86.1
  },
  {
    id: 63,
    procesamientoId: 8,
    periodoInicio: new Date("2026-10-08T12:11:00-05:00"),
    periodoFin: new Date("2026-10-08T12:12:00-05:00"),
    cantidadPeatones: 38,
    confianzaPromedio: 86.8
  },
  {
    id: 64,
    procesamientoId: 8,
    periodoInicio: new Date("2026-10-08T12:12:00-05:00"),
    periodoFin: new Date("2026-10-08T12:13:00-05:00"),
    cantidadPeatones: 40,
    confianzaPromedio: 87.5
  },
  {
    id: 65,
    procesamientoId: 8,
    periodoInicio: new Date("2026-10-08T12:13:00-05:00"),
    periodoFin: new Date("2026-10-08T12:14:00-05:00"),
    cantidadPeatones: 42,
    confianzaPromedio: 88.2
  },
  {
    id: 66,
    procesamientoId: 8,
    periodoInicio: new Date("2026-10-08T17:10:00-05:00"),
    periodoFin: new Date("2026-10-08T17:11:00-05:00"),
    cantidadPeatones: 53,
    confianzaPromedio: 88.9
  },
  {
    id: 67,
    procesamientoId: 8,
    periodoInicio: new Date("2026-10-08T17:11:00-05:00"),
    periodoFin: new Date("2026-10-08T17:12:00-05:00"),
    cantidadPeatones: 55,
    confianzaPromedio: 89.6
  },
  {
    id: 68,
    procesamientoId: 8,
    periodoInicio: new Date("2026-10-08T17:12:00-05:00"),
    periodoFin: new Date("2026-10-08T17:13:00-05:00"),
    cantidadPeatones: 57,
    confianzaPromedio: 90.3
  },
  {
    id: 69,
    procesamientoId: 8,
    periodoInicio: new Date("2026-10-08T17:13:00-05:00"),
    periodoFin: new Date("2026-10-08T17:14:00-05:00"),
    cantidadPeatones: 59,
    confianzaPromedio: 91
  },
  {
    id: 70,
    procesamientoId: 9,
    periodoInicio: new Date("2026-10-08T08:10:00-05:00"),
    periodoFin: new Date("2026-10-08T08:11:00-05:00"),
    cantidadPeatones: 5,
    confianzaPromedio: 91.7
  },
  {
    id: 71,
    procesamientoId: 9,
    periodoInicio: new Date("2026-10-08T08:11:00-05:00"),
    periodoFin: new Date("2026-10-08T08:12:00-05:00"),
    cantidadPeatones: 7,
    confianzaPromedio: 92.4
  },
  {
    id: 72,
    procesamientoId: 9,
    periodoInicio: new Date("2026-10-08T08:12:00-05:00"),
    periodoFin: new Date("2026-10-08T08:13:00-05:00"),
    cantidadPeatones: 9,
    confianzaPromedio: 93.1
  },
  {
    id: 73,
    procesamientoId: 9,
    periodoInicio: new Date("2026-10-08T08:13:00-05:00"),
    periodoFin: new Date("2026-10-08T08:14:00-05:00"),
    cantidadPeatones: 11,
    confianzaPromedio: 93.8
  },
  {
    id: 74,
    procesamientoId: 9,
    periodoInicio: new Date("2026-10-08T09:10:00-05:00"),
    periodoFin: new Date("2026-10-08T09:11:00-05:00"),
    cantidadPeatones: 24,
    confianzaPromedio: 94.5
  },
  {
    id: 75,
    procesamientoId: 9,
    periodoInicio: new Date("2026-10-08T09:11:00-05:00"),
    periodoFin: new Date("2026-10-08T09:12:00-05:00"),
    cantidadPeatones: 26,
    confianzaPromedio: 95.2
  },
  {
    id: 76,
    procesamientoId: 9,
    periodoInicio: new Date("2026-10-08T09:12:00-05:00"),
    periodoFin: new Date("2026-10-08T09:13:00-05:00"),
    cantidadPeatones: 28,
    confianzaPromedio: 95.9
  },
  {
    id: 77,
    procesamientoId: 9,
    periodoInicio: new Date("2026-10-08T09:13:00-05:00"),
    periodoFin: new Date("2026-10-08T09:14:00-05:00"),
    cantidadPeatones: 30,
    confianzaPromedio: 96.6
  },
  {
    id: 78,
    procesamientoId: 9,
    periodoInicio: new Date("2026-10-08T12:10:00-05:00"),
    periodoFin: new Date("2026-10-08T12:11:00-05:00"),
    cantidadPeatones: 44,
    confianzaPromedio: 97.3
  },
  {
    id: 79,
    procesamientoId: 9,
    periodoInicio: new Date("2026-10-08T12:11:00-05:00"),
    periodoFin: new Date("2026-10-08T12:12:00-05:00"),
    cantidadPeatones: 46,
    confianzaPromedio: 98
  },
  {
    id: 80,
    procesamientoId: 9,
    periodoInicio: new Date("2026-10-08T12:12:00-05:00"),
    periodoFin: new Date("2026-10-08T12:13:00-05:00"),
    cantidadPeatones: 48,
    confianzaPromedio: 98.7
  },
  {
    id: 81,
    procesamientoId: 9,
    periodoInicio: new Date("2026-10-08T12:13:00-05:00"),
    periodoFin: new Date("2026-10-08T12:14:00-05:00"),
    cantidadPeatones: 50,
    confianzaPromedio: 80.4
  },
  {
    id: 82,
    procesamientoId: 9,
    periodoInicio: new Date("2026-10-08T17:10:00-05:00"),
    periodoFin: new Date("2026-10-08T17:11:00-05:00"),
    cantidadPeatones: 63,
    confianzaPromedio: 81.1
  },
  {
    id: 83,
    procesamientoId: 9,
    periodoInicio: new Date("2026-10-08T17:11:00-05:00"),
    periodoFin: new Date("2026-10-08T17:12:00-05:00"),
    cantidadPeatones: 65,
    confianzaPromedio: 81.8
  },
  {
    id: 84,
    procesamientoId: 9,
    periodoInicio: new Date("2026-10-08T17:12:00-05:00"),
    periodoFin: new Date("2026-10-08T17:13:00-05:00"),
    cantidadPeatones: 67,
    confianzaPromedio: 82.5
  },
  {
    id: 85,
    procesamientoId: 9,
    periodoInicio: new Date("2026-10-08T17:13:00-05:00"),
    periodoFin: new Date("2026-10-08T17:14:00-05:00"),
    cantidadPeatones: 69,
    confianzaPromedio: 83.2
  },
  {
    id: 86,
    procesamientoId: 10,
    periodoInicio: new Date("2026-10-08T08:10:00-05:00"),
    periodoFin: new Date("2026-10-08T08:11:00-05:00"),
    cantidadPeatones: 3,
    confianzaPromedio: 83.9
  },
  {
    id: 87,
    procesamientoId: 10,
    periodoInicio: new Date("2026-10-08T08:11:00-05:00"),
    periodoFin: new Date("2026-10-08T08:12:00-05:00"),
    cantidadPeatones: 5,
    confianzaPromedio: 84.6
  },
  {
    id: 88,
    procesamientoId: 10,
    periodoInicio: new Date("2026-10-08T08:12:00-05:00"),
    periodoFin: new Date("2026-10-08T08:13:00-05:00"),
    cantidadPeatones: 7,
    confianzaPromedio: 85.3
  },
  {
    id: 89,
    procesamientoId: 10,
    periodoInicio: new Date("2026-10-08T08:13:00-05:00"),
    periodoFin: new Date("2026-10-08T08:14:00-05:00"),
    cantidadPeatones: 9,
    confianzaPromedio: 86
  },
  {
    id: 90,
    procesamientoId: 10,
    periodoInicio: new Date("2026-10-08T09:10:00-05:00"),
    periodoFin: new Date("2026-10-08T09:11:00-05:00"),
    cantidadPeatones: 20,
    confianzaPromedio: 86.7
  },
  {
    id: 91,
    procesamientoId: 10,
    periodoInicio: new Date("2026-10-08T09:11:00-05:00"),
    periodoFin: new Date("2026-10-08T09:12:00-05:00"),
    cantidadPeatones: 22,
    confianzaPromedio: 87.4
  },
  {
    id: 92,
    procesamientoId: 10,
    periodoInicio: new Date("2026-10-08T09:12:00-05:00"),
    periodoFin: new Date("2026-10-08T09:13:00-05:00"),
    cantidadPeatones: 24,
    confianzaPromedio: 88.1
  },
  {
    id: 93,
    procesamientoId: 10,
    periodoInicio: new Date("2026-10-08T09:13:00-05:00"),
    periodoFin: new Date("2026-10-08T09:14:00-05:00"),
    cantidadPeatones: 26,
    confianzaPromedio: 88.8
  },
  {
    id: 94,
    procesamientoId: 10,
    periodoInicio: new Date("2026-10-08T12:10:00-05:00"),
    periodoFin: new Date("2026-10-08T12:11:00-05:00"),
    cantidadPeatones: 48,
    confianzaPromedio: 89.5
  },
  {
    id: 95,
    procesamientoId: 10,
    periodoInicio: new Date("2026-10-08T12:11:00-05:00"),
    periodoFin: new Date("2026-10-08T12:12:00-05:00"),
    cantidadPeatones: 50,
    confianzaPromedio: 90.2
  },
  {
    id: 96,
    procesamientoId: 10,
    periodoInicio: new Date("2026-10-08T12:12:00-05:00"),
    periodoFin: new Date("2026-10-08T12:13:00-05:00"),
    cantidadPeatones: 52,
    confianzaPromedio: 90.9
  },
  {
    id: 97,
    procesamientoId: 10,
    periodoInicio: new Date("2026-10-08T12:13:00-05:00"),
    periodoFin: new Date("2026-10-08T12:14:00-05:00"),
    cantidadPeatones: 54,
    confianzaPromedio: 91.6
  },
  {
    id: 98,
    procesamientoId: 10,
    periodoInicio: new Date("2026-10-08T17:10:00-05:00"),
    periodoFin: new Date("2026-10-08T17:11:00-05:00"),
    cantidadPeatones: 70,
    confianzaPromedio: 92.3
  },
  {
    id: 99,
    procesamientoId: 10,
    periodoInicio: new Date("2026-10-08T17:11:00-05:00"),
    periodoFin: new Date("2026-10-08T17:12:00-05:00"),
    cantidadPeatones: 72,
    confianzaPromedio: 93
  },
  {
    id: 100,
    procesamientoId: 10,
    periodoInicio: new Date("2026-10-08T17:12:00-05:00"),
    periodoFin: new Date("2026-10-08T17:13:00-05:00"),
    cantidadPeatones: 74,
    confianzaPromedio: 93.7
  },
  {
    id: 101,
    procesamientoId: 10,
    periodoInicio: new Date("2026-10-08T17:13:00-05:00"),
    periodoFin: new Date("2026-10-08T17:14:00-05:00"),
    cantidadPeatones: 76,
    confianzaPromedio: 94.4
  },
  {
    id: 102,
    procesamientoId: 11,
    periodoInicio: new Date("2026-10-09T08:10:00-05:00"),
    periodoFin: new Date("2026-10-09T08:11:00-05:00"),
    cantidadPeatones: 4,
    confianzaPromedio: 95.1
  },
  {
    id: 103,
    procesamientoId: 11,
    periodoInicio: new Date("2026-10-09T08:11:00-05:00"),
    periodoFin: new Date("2026-10-09T08:12:00-05:00"),
    cantidadPeatones: 6,
    confianzaPromedio: 95.8
  },
  {
    id: 104,
    procesamientoId: 11,
    periodoInicio: new Date("2026-10-09T08:12:00-05:00"),
    periodoFin: new Date("2026-10-09T08:13:00-05:00"),
    cantidadPeatones: 8,
    confianzaPromedio: 96.5
  },
  {
    id: 105,
    procesamientoId: 11,
    periodoInicio: new Date("2026-10-09T08:13:00-05:00"),
    periodoFin: new Date("2026-10-09T08:14:00-05:00"),
    cantidadPeatones: 10,
    confianzaPromedio: 97.2
  },
  {
    id: 106,
    procesamientoId: 11,
    periodoInicio: new Date("2026-10-09T09:10:00-05:00"),
    periodoFin: new Date("2026-10-09T09:11:00-05:00"),
    cantidadPeatones: 16,
    confianzaPromedio: 97.9
  },
  {
    id: 107,
    procesamientoId: 11,
    periodoInicio: new Date("2026-10-09T09:11:00-05:00"),
    periodoFin: new Date("2026-10-09T09:12:00-05:00"),
    cantidadPeatones: 18,
    confianzaPromedio: 98.6
  },
  {
    id: 108,
    procesamientoId: 11,
    periodoInicio: new Date("2026-10-09T09:12:00-05:00"),
    periodoFin: new Date("2026-10-09T09:13:00-05:00"),
    cantidadPeatones: 20,
    confianzaPromedio: 80.3
  },
  {
    id: 109,
    procesamientoId: 11,
    periodoInicio: new Date("2026-10-09T09:13:00-05:00"),
    periodoFin: new Date("2026-10-09T09:14:00-05:00"),
    cantidadPeatones: 22,
    confianzaPromedio: 81
  },
  {
    id: 110,
    procesamientoId: 11,
    periodoInicio: new Date("2026-10-09T12:10:00-05:00"),
    periodoFin: new Date("2026-10-09T12:11:00-05:00"),
    cantidadPeatones: 39,
    confianzaPromedio: 81.7
  },
  {
    id: 111,
    procesamientoId: 11,
    periodoInicio: new Date("2026-10-09T12:11:00-05:00"),
    periodoFin: new Date("2026-10-09T12:12:00-05:00"),
    cantidadPeatones: 41,
    confianzaPromedio: 82.4
  },
  {
    id: 112,
    procesamientoId: 11,
    periodoInicio: new Date("2026-10-09T12:12:00-05:00"),
    periodoFin: new Date("2026-10-09T12:13:00-05:00"),
    cantidadPeatones: 43,
    confianzaPromedio: 83.1
  },
  {
    id: 113,
    procesamientoId: 11,
    periodoInicio: new Date("2026-10-09T12:13:00-05:00"),
    periodoFin: new Date("2026-10-09T12:14:00-05:00"),
    cantidadPeatones: 45,
    confianzaPromedio: 83.8
  },
  {
    id: 114,
    procesamientoId: 11,
    periodoInicio: new Date("2026-10-09T17:10:00-05:00"),
    periodoFin: new Date("2026-10-09T17:11:00-05:00"),
    cantidadPeatones: 56,
    confianzaPromedio: 84.5
  },
  {
    id: 115,
    procesamientoId: 11,
    periodoInicio: new Date("2026-10-09T17:11:00-05:00"),
    periodoFin: new Date("2026-10-09T17:12:00-05:00"),
    cantidadPeatones: 58,
    confianzaPromedio: 85.2
  },
  {
    id: 116,
    procesamientoId: 11,
    periodoInicio: new Date("2026-10-09T17:12:00-05:00"),
    periodoFin: new Date("2026-10-09T17:13:00-05:00"),
    cantidadPeatones: 60,
    confianzaPromedio: 85.9
  },
  {
    id: 117,
    procesamientoId: 11,
    periodoInicio: new Date("2026-10-09T17:13:00-05:00"),
    periodoFin: new Date("2026-10-09T17:14:00-05:00"),
    cantidadPeatones: 62,
    confianzaPromedio: 86.6
  },
  {
    id: 118,
    procesamientoId: 12,
    periodoInicio: new Date("2026-10-09T08:10:00-05:00"),
    periodoFin: new Date("2026-10-09T08:11:00-05:00"),
    cantidadPeatones: 8,
    confianzaPromedio: 87.3
  },
  {
    id: 119,
    procesamientoId: 12,
    periodoInicio: new Date("2026-10-09T08:11:00-05:00"),
    periodoFin: new Date("2026-10-09T08:12:00-05:00"),
    cantidadPeatones: 10,
    confianzaPromedio: 88
  },
  {
    id: 120,
    procesamientoId: 12,
    periodoInicio: new Date("2026-10-09T08:12:00-05:00"),
    periodoFin: new Date("2026-10-09T08:13:00-05:00"),
    cantidadPeatones: 12,
    confianzaPromedio: 88.7
  },
  {
    id: 121,
    procesamientoId: 12,
    periodoInicio: new Date("2026-10-09T08:13:00-05:00"),
    periodoFin: new Date("2026-10-09T08:14:00-05:00"),
    cantidadPeatones: 14,
    confianzaPromedio: 89.4
  },
  {
    id: 122,
    procesamientoId: 12,
    periodoInicio: new Date("2026-10-09T09:10:00-05:00"),
    periodoFin: new Date("2026-10-09T09:11:00-05:00"),
    cantidadPeatones: 27,
    confianzaPromedio: 90.1
  },
  {
    id: 123,
    procesamientoId: 12,
    periodoInicio: new Date("2026-10-09T09:11:00-05:00"),
    periodoFin: new Date("2026-10-09T09:12:00-05:00"),
    cantidadPeatones: 29,
    confianzaPromedio: 90.8
  },
  {
    id: 124,
    procesamientoId: 12,
    periodoInicio: new Date("2026-10-09T09:12:00-05:00"),
    periodoFin: new Date("2026-10-09T09:13:00-05:00"),
    cantidadPeatones: 31,
    confianzaPromedio: 91.5
  },
  {
    id: 125,
    procesamientoId: 12,
    periodoInicio: new Date("2026-10-09T09:13:00-05:00"),
    periodoFin: new Date("2026-10-09T09:14:00-05:00"),
    cantidadPeatones: 33,
    confianzaPromedio: 92.2
  },
  {
    id: 126,
    procesamientoId: 12,
    periodoInicio: new Date("2026-10-09T12:10:00-05:00"),
    periodoFin: new Date("2026-10-09T12:11:00-05:00"),
    cantidadPeatones: 47,
    confianzaPromedio: 92.9
  },
  {
    id: 127,
    procesamientoId: 12,
    periodoInicio: new Date("2026-10-09T12:11:00-05:00"),
    periodoFin: new Date("2026-10-09T12:12:00-05:00"),
    cantidadPeatones: 49,
    confianzaPromedio: 93.6
  },
  {
    id: 128,
    procesamientoId: 12,
    periodoInicio: new Date("2026-10-09T12:12:00-05:00"),
    periodoFin: new Date("2026-10-09T12:13:00-05:00"),
    cantidadPeatones: 51,
    confianzaPromedio: 94.3
  },
  {
    id: 129,
    procesamientoId: 12,
    periodoInicio: new Date("2026-10-09T12:13:00-05:00"),
    periodoFin: new Date("2026-10-09T12:14:00-05:00"),
    cantidadPeatones: 53,
    confianzaPromedio: 95
  },
  {
    id: 130,
    procesamientoId: 12,
    periodoInicio: new Date("2026-10-09T17:10:00-05:00"),
    periodoFin: new Date("2026-10-09T17:11:00-05:00"),
    cantidadPeatones: 66,
    confianzaPromedio: 95.7
  },
  {
    id: 131,
    procesamientoId: 12,
    periodoInicio: new Date("2026-10-09T17:11:00-05:00"),
    periodoFin: new Date("2026-10-09T17:12:00-05:00"),
    cantidadPeatones: 68,
    confianzaPromedio: 96.4
  },
  {
    id: 132,
    procesamientoId: 12,
    periodoInicio: new Date("2026-10-09T17:12:00-05:00"),
    periodoFin: new Date("2026-10-09T17:13:00-05:00"),
    cantidadPeatones: 70,
    confianzaPromedio: 97.1
  },
  {
    id: 133,
    procesamientoId: 12,
    periodoInicio: new Date("2026-10-09T17:13:00-05:00"),
    periodoFin: new Date("2026-10-09T17:14:00-05:00"),
    cantidadPeatones: 72,
    confianzaPromedio: 97.8
  },
  {
    id: 134,
    procesamientoId: 13,
    periodoInicio: new Date("2026-10-09T08:10:00-05:00"),
    periodoFin: new Date("2026-10-09T08:11:00-05:00"),
    cantidadPeatones: 6,
    confianzaPromedio: 98.5
  },
  {
    id: 135,
    procesamientoId: 13,
    periodoInicio: new Date("2026-10-09T08:11:00-05:00"),
    periodoFin: new Date("2026-10-09T08:12:00-05:00"),
    cantidadPeatones: 8,
    confianzaPromedio: 80.2
  },
  {
    id: 136,
    procesamientoId: 13,
    periodoInicio: new Date("2026-10-09T08:12:00-05:00"),
    periodoFin: new Date("2026-10-09T08:13:00-05:00"),
    cantidadPeatones: 10,
    confianzaPromedio: 80.9
  },
  {
    id: 137,
    procesamientoId: 13,
    periodoInicio: new Date("2026-10-09T08:13:00-05:00"),
    periodoFin: new Date("2026-10-09T08:14:00-05:00"),
    cantidadPeatones: 12,
    confianzaPromedio: 81.6
  },
  {
    id: 138,
    procesamientoId: 13,
    periodoInicio: new Date("2026-10-09T09:10:00-05:00"),
    periodoFin: new Date("2026-10-09T09:11:00-05:00"),
    cantidadPeatones: 23,
    confianzaPromedio: 82.3
  },
  {
    id: 139,
    procesamientoId: 13,
    periodoInicio: new Date("2026-10-09T09:11:00-05:00"),
    periodoFin: new Date("2026-10-09T09:12:00-05:00"),
    cantidadPeatones: 25,
    confianzaPromedio: 83
  },
  {
    id: 140,
    procesamientoId: 13,
    periodoInicio: new Date("2026-10-09T09:12:00-05:00"),
    periodoFin: new Date("2026-10-09T09:13:00-05:00"),
    cantidadPeatones: 27,
    confianzaPromedio: 83.7
  },
  {
    id: 141,
    procesamientoId: 13,
    periodoInicio: new Date("2026-10-09T09:13:00-05:00"),
    periodoFin: new Date("2026-10-09T09:14:00-05:00"),
    cantidadPeatones: 29,
    confianzaPromedio: 84.4
  },
  {
    id: 142,
    procesamientoId: 13,
    periodoInicio: new Date("2026-10-09T12:10:00-05:00"),
    periodoFin: new Date("2026-10-09T12:11:00-05:00"),
    cantidadPeatones: 51,
    confianzaPromedio: 85.1
  },
  {
    id: 143,
    procesamientoId: 13,
    periodoInicio: new Date("2026-10-09T12:11:00-05:00"),
    periodoFin: new Date("2026-10-09T12:12:00-05:00"),
    cantidadPeatones: 53,
    confianzaPromedio: 85.8
  },
  {
    id: 144,
    procesamientoId: 13,
    periodoInicio: new Date("2026-10-09T12:12:00-05:00"),
    periodoFin: new Date("2026-10-09T12:13:00-05:00"),
    cantidadPeatones: 55,
    confianzaPromedio: 86.5
  },
  {
    id: 145,
    procesamientoId: 13,
    periodoInicio: new Date("2026-10-09T12:13:00-05:00"),
    periodoFin: new Date("2026-10-09T12:14:00-05:00"),
    cantidadPeatones: 57,
    confianzaPromedio: 87.2
  },
  {
    id: 146,
    procesamientoId: 13,
    periodoInicio: new Date("2026-10-09T17:10:00-05:00"),
    periodoFin: new Date("2026-10-09T17:11:00-05:00"),
    cantidadPeatones: 73,
    confianzaPromedio: 87.9
  },
  {
    id: 147,
    procesamientoId: 13,
    periodoInicio: new Date("2026-10-09T17:11:00-05:00"),
    periodoFin: new Date("2026-10-09T17:12:00-05:00"),
    cantidadPeatones: 75,
    confianzaPromedio: 88.6
  },
  {
    id: 148,
    procesamientoId: 13,
    periodoInicio: new Date("2026-10-09T17:12:00-05:00"),
    periodoFin: new Date("2026-10-09T17:13:00-05:00"),
    cantidadPeatones: 77,
    confianzaPromedio: 89.3
  },
  {
    id: 149,
    procesamientoId: 13,
    periodoInicio: new Date("2026-10-09T17:13:00-05:00"),
    periodoFin: new Date("2026-10-09T17:14:00-05:00"),
    cantidadPeatones: 79,
    confianzaPromedio: 90
  },
  {
    id: 150,
    procesamientoId: 14,
    periodoInicio: new Date("2026-10-09T12:00:00-05:00"),
    periodoFin: new Date("2026-10-09T12:01:00-05:00"),
    cantidadPeatones: 9,
    confianzaPromedio: 90
  },
  {
    id: 151,
    procesamientoId: 14,
    periodoInicio: new Date("2026-10-09T12:01:00-05:00"),
    periodoFin: new Date("2026-10-09T12:02:00-05:00"),
    cantidadPeatones: 16,
    confianzaPromedio: 90
  },
  {
    id: 152,
    procesamientoId: 14,
    periodoInicio: new Date("2026-10-09T12:02:00-05:00"),
    periodoFin: new Date("2026-10-09T12:03:00-05:00"),
    cantidadPeatones: 23,
    confianzaPromedio: 90
  }
];

export const indicadoresDemo: Indicador[] = [
  {
    id: 1,
    zonaId: 1,
    periodoTipo: "hora",
    periodoInicio: new Date("2026-10-09T08:00:00-05:00"),
    periodoFin: new Date("2026-10-09T14:00:00.000Z"),
    totalPeatones: 81,
    promedioPeatones: 11.57,
    maxPeatones: 35,
    nivelConcentracion: "medio",
    fechaCalculo: new Date("2026-10-09T18:10:00-05:00")
  },
  {
    id: 2,
    zonaId: 1,
    periodoTipo: "dia",
    periodoInicio: new Date("2026-10-09T00:00:00-05:00"),
    periodoFin: new Date("2026-10-10T05:00:00.000Z"),
    totalPeatones: 561,
    promedioPeatones: 29.53,
    maxPeatones: 62,
    nivelConcentracion: "medio",
    fechaCalculo: new Date("2026-10-09T18:10:00-05:00")
  },
  {
    id: 3,
    zonaId: 2,
    periodoTipo: "hora",
    periodoInicio: new Date("2026-10-09T09:00:00-05:00"),
    periodoFin: new Date("2026-10-09T15:00:00.000Z"),
    totalPeatones: 176,
    promedioPeatones: 29.33,
    maxPeatones: 44,
    nivelConcentracion: "medio",
    fechaCalculo: new Date("2026-10-09T18:10:00-05:00")
  },
  {
    id: 4,
    zonaId: 2,
    periodoTipo: "dia",
    periodoInicio: new Date("2026-10-09T00:00:00-05:00"),
    periodoFin: new Date("2026-10-10T05:00:00.000Z"),
    totalPeatones: 696,
    promedioPeatones: 38.67,
    maxPeatones: 72,
    nivelConcentracion: "medio",
    fechaCalculo: new Date("2026-10-09T18:10:00-05:00")
  },
  {
    id: 5,
    zonaId: 1,
    periodoTipo: "hora",
    periodoInicio: new Date("2026-10-07T08:00:00-05:00"),
    periodoFin: new Date("2026-10-07T14:00:00.000Z"),
    totalPeatones: 0,
    promedioPeatones: 0,
    maxPeatones: 0,
    nivelConcentracion: "bajo",
    fechaCalculo: new Date("2026-10-09T18:10:00-05:00")
  },
  {
    id: 6,
    zonaId: 1,
    periodoTipo: "dia",
    periodoInicio: new Date("2026-10-07T00:00:00-05:00"),
    periodoFin: new Date("2026-10-08T05:00:00.000Z"),
    totalPeatones: 408,
    promedioPeatones: 25.5,
    maxPeatones: 56,
    nivelConcentracion: "medio",
    fechaCalculo: new Date("2026-10-09T18:10:00-05:00")
  },
  {
    id: 7,
    zonaId: 1,
    periodoTipo: "hora",
    periodoInicio: new Date("2026-10-07T09:00:00-05:00"),
    periodoFin: new Date("2026-10-07T15:00:00.000Z"),
    totalPeatones: 52,
    promedioPeatones: 13,
    maxPeatones: 16,
    nivelConcentracion: "medio",
    fechaCalculo: new Date("2026-10-09T18:10:00-05:00")
  },
  {
    id: 8,
    zonaId: 1,
    periodoTipo: "hora",
    periodoInicio: new Date("2026-10-07T12:00:00-05:00"),
    periodoFin: new Date("2026-10-07T18:00:00.000Z"),
    totalPeatones: 144,
    promedioPeatones: 36,
    maxPeatones: 39,
    nivelConcentracion: "alto",
    fechaCalculo: new Date("2026-10-09T18:10:00-05:00")
  },
  {
    id: 9,
    zonaId: 1,
    periodoTipo: "hora",
    periodoInicio: new Date("2026-10-07T17:00:00-05:00"),
    periodoFin: new Date("2026-10-07T23:00:00.000Z"),
    totalPeatones: 212,
    promedioPeatones: 53,
    maxPeatones: 56,
    nivelConcentracion: "alto",
    fechaCalculo: new Date("2026-10-09T18:10:00-05:00")
  },
  {
    id: 10,
    zonaId: 2,
    periodoTipo: "hora",
    periodoInicio: new Date("2026-10-07T08:00:00-05:00"),
    periodoFin: new Date("2026-10-07T14:00:00.000Z"),
    totalPeatones: 0,
    promedioPeatones: 0,
    maxPeatones: 0,
    nivelConcentracion: "bajo",
    fechaCalculo: new Date("2026-10-09T18:10:00-05:00")
  },
  {
    id: 11,
    zonaId: 2,
    periodoTipo: "dia",
    periodoInicio: new Date("2026-10-07T00:00:00-05:00"),
    periodoFin: new Date("2026-10-08T05:00:00.000Z"),
    totalPeatones: 524,
    promedioPeatones: 32.75,
    maxPeatones: 66,
    nivelConcentracion: "medio",
    fechaCalculo: new Date("2026-10-09T18:10:00-05:00")
  },
  {
    id: 12,
    zonaId: 2,
    periodoTipo: "hora",
    periodoInicio: new Date("2026-10-07T09:00:00-05:00"),
    periodoFin: new Date("2026-10-07T15:00:00.000Z"),
    totalPeatones: 96,
    promedioPeatones: 24,
    maxPeatones: 27,
    nivelConcentracion: "medio",
    fechaCalculo: new Date("2026-10-09T18:10:00-05:00")
  },
  {
    id: 13,
    zonaId: 2,
    periodoTipo: "hora",
    periodoInicio: new Date("2026-10-07T12:00:00-05:00"),
    periodoFin: new Date("2026-10-07T18:00:00.000Z"),
    totalPeatones: 176,
    promedioPeatones: 44,
    maxPeatones: 47,
    nivelConcentracion: "alto",
    fechaCalculo: new Date("2026-10-09T18:10:00-05:00")
  },
  {
    id: 14,
    zonaId: 2,
    periodoTipo: "hora",
    periodoInicio: new Date("2026-10-07T17:00:00-05:00"),
    periodoFin: new Date("2026-10-07T23:00:00.000Z"),
    totalPeatones: 252,
    promedioPeatones: 63,
    maxPeatones: 66,
    nivelConcentracion: "alto",
    fechaCalculo: new Date("2026-10-09T18:10:00-05:00")
  },
  {
    id: 15,
    zonaId: 4,
    periodoTipo: "hora",
    periodoInicio: new Date("2026-10-07T08:00:00-05:00"),
    periodoFin: new Date("2026-10-07T14:00:00.000Z"),
    totalPeatones: 0,
    promedioPeatones: 0,
    maxPeatones: 0,
    nivelConcentracion: "bajo",
    fechaCalculo: new Date("2026-10-09T18:10:00-05:00")
  },
  {
    id: 16,
    zonaId: 4,
    periodoTipo: "dia",
    periodoInicio: new Date("2026-10-07T00:00:00-05:00"),
    periodoFin: new Date("2026-10-08T05:00:00.000Z"),
    totalPeatones: 552,
    promedioPeatones: 34.5,
    maxPeatones: 73,
    nivelConcentracion: "medio",
    fechaCalculo: new Date("2026-10-09T18:10:00-05:00")
  },
  {
    id: 17,
    zonaId: 4,
    periodoTipo: "hora",
    periodoInicio: new Date("2026-10-07T09:00:00-05:00"),
    periodoFin: new Date("2026-10-07T15:00:00.000Z"),
    totalPeatones: 80,
    promedioPeatones: 20,
    maxPeatones: 23,
    nivelConcentracion: "medio",
    fechaCalculo: new Date("2026-10-09T18:10:00-05:00")
  },
  {
    id: 18,
    zonaId: 4,
    periodoTipo: "hora",
    periodoInicio: new Date("2026-10-07T12:00:00-05:00"),
    periodoFin: new Date("2026-10-07T18:00:00.000Z"),
    totalPeatones: 192,
    promedioPeatones: 48,
    maxPeatones: 51,
    nivelConcentracion: "alto",
    fechaCalculo: new Date("2026-10-09T18:10:00-05:00")
  },
  {
    id: 19,
    zonaId: 4,
    periodoTipo: "hora",
    periodoInicio: new Date("2026-10-07T17:00:00-05:00"),
    periodoFin: new Date("2026-10-07T23:00:00.000Z"),
    totalPeatones: 280,
    promedioPeatones: 70,
    maxPeatones: 73,
    nivelConcentracion: "alto",
    fechaCalculo: new Date("2026-10-09T18:10:00-05:00")
  },
  {
    id: 20,
    zonaId: 1,
    periodoTipo: "hora",
    periodoInicio: new Date("2026-10-08T08:00:00-05:00"),
    periodoFin: new Date("2026-10-08T14:00:00.000Z"),
    totalPeatones: 16,
    promedioPeatones: 4,
    maxPeatones: 7,
    nivelConcentracion: "bajo",
    fechaCalculo: new Date("2026-10-09T18:10:00-05:00")
  },
  {
    id: 21,
    zonaId: 1,
    periodoTipo: "dia",
    periodoInicio: new Date("2026-10-08T00:00:00-05:00"),
    periodoFin: new Date("2026-10-09T05:00:00.000Z"),
    totalPeatones: 460,
    promedioPeatones: 28.75,
    maxPeatones: 59,
    nivelConcentracion: "medio",
    fechaCalculo: new Date("2026-10-09T18:10:00-05:00")
  },
  {
    id: 22,
    zonaId: 1,
    periodoTipo: "hora",
    periodoInicio: new Date("2026-10-08T09:00:00-05:00"),
    periodoFin: new Date("2026-10-08T15:00:00.000Z"),
    totalPeatones: 64,
    promedioPeatones: 16,
    maxPeatones: 19,
    nivelConcentracion: "medio",
    fechaCalculo: new Date("2026-10-09T18:10:00-05:00")
  },
  {
    id: 23,
    zonaId: 1,
    periodoTipo: "hora",
    periodoInicio: new Date("2026-10-08T12:00:00-05:00"),
    periodoFin: new Date("2026-10-08T18:00:00.000Z"),
    totalPeatones: 156,
    promedioPeatones: 39,
    maxPeatones: 42,
    nivelConcentracion: "alto",
    fechaCalculo: new Date("2026-10-09T18:10:00-05:00")
  },
  {
    id: 24,
    zonaId: 1,
    periodoTipo: "hora",
    periodoInicio: new Date("2026-10-08T17:00:00-05:00"),
    periodoFin: new Date("2026-10-08T23:00:00.000Z"),
    totalPeatones: 224,
    promedioPeatones: 56,
    maxPeatones: 59,
    nivelConcentracion: "alto",
    fechaCalculo: new Date("2026-10-09T18:10:00-05:00")
  },
  {
    id: 25,
    zonaId: 2,
    periodoTipo: "hora",
    periodoInicio: new Date("2026-10-08T08:00:00-05:00"),
    periodoFin: new Date("2026-10-08T14:00:00.000Z"),
    totalPeatones: 32,
    promedioPeatones: 8,
    maxPeatones: 11,
    nivelConcentracion: "bajo",
    fechaCalculo: new Date("2026-10-09T18:10:00-05:00")
  },
  {
    id: 26,
    zonaId: 2,
    periodoTipo: "dia",
    periodoInicio: new Date("2026-10-08T00:00:00-05:00"),
    periodoFin: new Date("2026-10-09T05:00:00.000Z"),
    totalPeatones: 592,
    promedioPeatones: 37,
    maxPeatones: 69,
    nivelConcentracion: "medio",
    fechaCalculo: new Date("2026-10-09T18:10:00-05:00")
  },
  {
    id: 27,
    zonaId: 2,
    periodoTipo: "hora",
    periodoInicio: new Date("2026-10-08T09:00:00-05:00"),
    periodoFin: new Date("2026-10-08T15:00:00.000Z"),
    totalPeatones: 108,
    promedioPeatones: 27,
    maxPeatones: 30,
    nivelConcentracion: "medio",
    fechaCalculo: new Date("2026-10-09T18:10:00-05:00")
  },
  {
    id: 28,
    zonaId: 2,
    periodoTipo: "hora",
    periodoInicio: new Date("2026-10-08T12:00:00-05:00"),
    periodoFin: new Date("2026-10-08T18:00:00.000Z"),
    totalPeatones: 188,
    promedioPeatones: 47,
    maxPeatones: 50,
    nivelConcentracion: "alto",
    fechaCalculo: new Date("2026-10-09T18:10:00-05:00")
  },
  {
    id: 29,
    zonaId: 2,
    periodoTipo: "hora",
    periodoInicio: new Date("2026-10-08T17:00:00-05:00"),
    periodoFin: new Date("2026-10-08T23:00:00.000Z"),
    totalPeatones: 264,
    promedioPeatones: 66,
    maxPeatones: 69,
    nivelConcentracion: "alto",
    fechaCalculo: new Date("2026-10-09T18:10:00-05:00")
  },
  {
    id: 30,
    zonaId: 4,
    periodoTipo: "hora",
    periodoInicio: new Date("2026-10-08T08:00:00-05:00"),
    periodoFin: new Date("2026-10-08T14:00:00.000Z"),
    totalPeatones: 24,
    promedioPeatones: 6,
    maxPeatones: 9,
    nivelConcentracion: "bajo",
    fechaCalculo: new Date("2026-10-09T18:10:00-05:00")
  },
  {
    id: 31,
    zonaId: 4,
    periodoTipo: "dia",
    periodoInicio: new Date("2026-10-08T00:00:00-05:00"),
    periodoFin: new Date("2026-10-09T05:00:00.000Z"),
    totalPeatones: 612,
    promedioPeatones: 38.25,
    maxPeatones: 76,
    nivelConcentracion: "medio",
    fechaCalculo: new Date("2026-10-09T18:10:00-05:00")
  },
  {
    id: 32,
    zonaId: 4,
    periodoTipo: "hora",
    periodoInicio: new Date("2026-10-08T09:00:00-05:00"),
    periodoFin: new Date("2026-10-08T15:00:00.000Z"),
    totalPeatones: 92,
    promedioPeatones: 23,
    maxPeatones: 26,
    nivelConcentracion: "medio",
    fechaCalculo: new Date("2026-10-09T18:10:00-05:00")
  },
  {
    id: 33,
    zonaId: 4,
    periodoTipo: "hora",
    periodoInicio: new Date("2026-10-08T12:00:00-05:00"),
    periodoFin: new Date("2026-10-08T18:00:00.000Z"),
    totalPeatones: 204,
    promedioPeatones: 51,
    maxPeatones: 54,
    nivelConcentracion: "alto",
    fechaCalculo: new Date("2026-10-09T18:10:00-05:00")
  },
  {
    id: 34,
    zonaId: 4,
    periodoTipo: "hora",
    periodoInicio: new Date("2026-10-08T17:00:00-05:00"),
    periodoFin: new Date("2026-10-08T23:00:00.000Z"),
    totalPeatones: 292,
    promedioPeatones: 73,
    maxPeatones: 76,
    nivelConcentracion: "alto",
    fechaCalculo: new Date("2026-10-09T18:10:00-05:00")
  },
  {
    id: 35,
    zonaId: 1,
    periodoTipo: "hora",
    periodoInicio: new Date("2026-10-09T09:00:00-05:00"),
    periodoFin: new Date("2026-10-09T15:00:00.000Z"),
    totalPeatones: 76,
    promedioPeatones: 19,
    maxPeatones: 22,
    nivelConcentracion: "medio",
    fechaCalculo: new Date("2026-10-09T18:10:00-05:00")
  },
  {
    id: 36,
    zonaId: 1,
    periodoTipo: "hora",
    periodoInicio: new Date("2026-10-09T12:00:00-05:00"),
    periodoFin: new Date("2026-10-09T18:00:00.000Z"),
    totalPeatones: 168,
    promedioPeatones: 42,
    maxPeatones: 45,
    nivelConcentracion: "alto",
    fechaCalculo: new Date("2026-10-09T18:10:00-05:00")
  },
  {
    id: 37,
    zonaId: 1,
    periodoTipo: "hora",
    periodoInicio: new Date("2026-10-09T17:00:00-05:00"),
    periodoFin: new Date("2026-10-09T23:00:00.000Z"),
    totalPeatones: 236,
    promedioPeatones: 59,
    maxPeatones: 62,
    nivelConcentracion: "alto",
    fechaCalculo: new Date("2026-10-09T18:10:00-05:00")
  },
  {
    id: 38,
    zonaId: 2,
    periodoTipo: "hora",
    periodoInicio: new Date("2026-10-09T08:00:00-05:00"),
    periodoFin: new Date("2026-10-09T14:00:00.000Z"),
    totalPeatones: 44,
    promedioPeatones: 11,
    maxPeatones: 14,
    nivelConcentracion: "bajo",
    fechaCalculo: new Date("2026-10-09T18:10:00-05:00")
  },
  {
    id: 39,
    zonaId: 2,
    periodoTipo: "hora",
    periodoInicio: new Date("2026-10-09T12:00:00-05:00"),
    periodoFin: new Date("2026-10-09T18:00:00.000Z"),
    totalPeatones: 200,
    promedioPeatones: 50,
    maxPeatones: 53,
    nivelConcentracion: "alto",
    fechaCalculo: new Date("2026-10-09T18:10:00-05:00")
  },
  {
    id: 40,
    zonaId: 2,
    periodoTipo: "hora",
    periodoInicio: new Date("2026-10-09T17:00:00-05:00"),
    periodoFin: new Date("2026-10-09T23:00:00.000Z"),
    totalPeatones: 276,
    promedioPeatones: 69,
    maxPeatones: 72,
    nivelConcentracion: "alto",
    fechaCalculo: new Date("2026-10-09T18:10:00-05:00")
  },
  {
    id: 41,
    zonaId: 4,
    periodoTipo: "hora",
    periodoInicio: new Date("2026-10-09T08:00:00-05:00"),
    periodoFin: new Date("2026-10-09T14:00:00.000Z"),
    totalPeatones: 36,
    promedioPeatones: 9,
    maxPeatones: 12,
    nivelConcentracion: "bajo",
    fechaCalculo: new Date("2026-10-09T18:10:00-05:00")
  },
  {
    id: 42,
    zonaId: 4,
    periodoTipo: "dia",
    periodoInicio: new Date("2026-10-09T00:00:00-05:00"),
    periodoFin: new Date("2026-10-10T05:00:00.000Z"),
    totalPeatones: 660,
    promedioPeatones: 41.25,
    maxPeatones: 79,
    nivelConcentracion: "medio",
    fechaCalculo: new Date("2026-10-09T18:10:00-05:00")
  },
  {
    id: 43,
    zonaId: 4,
    periodoTipo: "hora",
    periodoInicio: new Date("2026-10-09T09:00:00-05:00"),
    periodoFin: new Date("2026-10-09T15:00:00.000Z"),
    totalPeatones: 104,
    promedioPeatones: 26,
    maxPeatones: 29,
    nivelConcentracion: "medio",
    fechaCalculo: new Date("2026-10-09T18:10:00-05:00")
  },
  {
    id: 44,
    zonaId: 4,
    periodoTipo: "hora",
    periodoInicio: new Date("2026-10-09T12:00:00-05:00"),
    periodoFin: new Date("2026-10-09T18:00:00.000Z"),
    totalPeatones: 216,
    promedioPeatones: 54,
    maxPeatones: 57,
    nivelConcentracion: "alto",
    fechaCalculo: new Date("2026-10-09T18:10:00-05:00")
  },
  {
    id: 45,
    zonaId: 4,
    periodoTipo: "hora",
    periodoInicio: new Date("2026-10-09T17:00:00-05:00"),
    periodoFin: new Date("2026-10-09T23:00:00.000Z"),
    totalPeatones: 304,
    promedioPeatones: 76,
    maxPeatones: 79,
    nivelConcentracion: "alto",
    fechaCalculo: new Date("2026-10-09T18:10:00-05:00")
  }
];
