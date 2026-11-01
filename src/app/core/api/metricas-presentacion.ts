import { PuntoSerie } from '../models/metricas.model';

export function fechaMetrica(valor: string): Date {
  return new Date(/(?:Z|[+-]\d{2}:\d{2})$/i.test(valor) ? valor : valor + '-05:00');
}
export function mostrarFecha(valor: string | null | undefined): string {
  return valor ? fechaMetrica(valor).toLocaleString('es-PE', {
    timeZone: 'America/Lima', day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  }) : 'Sin registro';
}
export function estadoMedicion(estado: string | null | undefined): string {
  const textos: Record<string, string> = {
    disponible: 'Ocupación medida', sin_datos: 'Solo conteos históricos',
    datos_incompletos: 'Medición incompleta', fuentes_sin_consolidar: 'Vistas sin consolidar',
    ejecuciones_sin_consolidar: 'Ejecuciones sin consolidar',
  };
  return estado ? textos[estado] || 'Sin medición consolidada' : 'Sin medición';
}
export function estadoOperativo(estado: string): string {
  const textos: Record<string, string> = {
    reportando: 'Motor reportando actividad', sin_actividad: 'Sin señal de actividad',
    sin_transmision: 'Sin transmisión registrada', interrumpida: 'Transmisión interrumpida',
    finalizada: 'Transmisión finalizada', deshabilitada: 'Cámara deshabilitada',
  };
  return textos[estado] || 'Estado no disponible';
}
export function rangoValido(desde: string, hasta: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(desde) || !/^\d{4}-\d{2}-\d{2}$/.test(hasta)) return false;
  const inicio = Date.parse(desde + 'T00:00:00Z');
  const fin = Date.parse(hasta + 'T00:00:00Z');
  return Number.isFinite(inicio) && Number.isFinite(fin) && new Date(inicio).toISOString().slice(0, 10) === desde && new Date(fin).toISOString().slice(0, 10) === hasta && fin >= inicio && fin - inicio < 31 * 86400000;
}

export function prepararSeries(filas: PuntoSerie[], periodo: 'hora' | 'dia') {
  const paso = periodo === 'hora' ? 3600000 : 86400000;
  const tiempos = filas.map((fila) => fechaMetrica(fila.periodo_inicio).getTime());
  const ejes: number[] = [];
  if (tiempos.length) {
    const fin = Math.max(...tiempos);
    for (let t = Math.min(...tiempos); t <= fin && ejes.length < 745; t += paso) ejes.push(t);
  }
  const grupos = new Map<number, PuntoSerie[]>();
  for (const fila of filas) {
    const grupo = grupos.get(fila.id_procesamiento) || [];
    grupo.push(fila);
    grupos.set(fila.id_procesamiento, grupo);
  }
  return {
    labels: ejes.map((t) => new Date(t).toLocaleString('es-PE', { timeZone: 'America/Lima',
      day: '2-digit', month: '2-digit', ...(periodo === 'hora' ? { hour: '2-digit', minute: '2-digit' } as const : {}) })),
    series: [...grupos.entries()].map(([id, grupo]) => {
      const valores = new Map(grupo.map((f) => [fechaMetrica(f.periodo_inicio).getTime(), f.promedio_presentes]));
      return { id, nombre: `${grupo[0].nombre_zona} · ${grupo[0].tipo_fuente} #${id}`,
        datos: ejes.map((t) => valores.get(t) ?? null) };
    }),
  };
}
