import { Chart, LegendOptions, TooltipItem } from 'chart.js';
import { Camara } from '../../core/models/camara.model';

interface SerieCamara {
  id_camara: number | null;
  id_zona: number;
  nombre_zona: string;
  id_procesamiento: number;
  tipo_fuente: string;
}

const tokens = ['brand', 'success', 'warning', 'danger', 'muted', 'maintenance', 'heading', 'subtle'];

export function colorOcupacion(estilos: CSSStyleDeclaration, id: number): string {
  if (id >= 1 && id <= tokens.length) {
    return estilos.getPropertyValue('--color-' + tokens[id - 1]).trim() || estilos.color;
  }
  return `hsl(${(id * 137.508) % 360} 63% 42%)`;
}

export function estiloCamara(fila: SerieCamara, camaras: readonly Camara[], estilos: CSSStyleDeclaration) {
  const nombre = camaras.find((camara) => camara.id === fila.id_camara)?.nombre ?? 'Sin cámara';
  const origen: Record<string, string> = { stream: 'Transmisión', video: 'Video', imagen: 'Imagen' };
  const color = fila.id_camara === null ? estilos.color : colorOcupacion(estilos, fila.id_camara);
  return {
    label: `${fila.nombre_zona} · ${nombre}`,
    claveCamara: fila.id_camara === null ? `zona:${fila.id_zona}` : `camara:${fila.id_camara}`,
    detalle: `${origen[fila.tipo_fuente] ?? fila.tipo_fuente} · Ejecución #${fila.id_procesamiento}`,
    borderColor: color, backgroundColor: color,
  };
}

export function etiquetasCamaras(chart: Chart) {
  const claves = new Set<string>();
  return Chart.defaults.plugins.legend.labels.generateLabels(chart).filter((item) => {
    const clave = claveCamara(chart, item.datasetIndex);
    if (!clave || claves.has(clave)) return false;
    claves.add(clave);
    return true;
  });
}

function claveCamara(chart: Chart, indice: number | undefined): string | undefined {
  return indice === undefined ? undefined : (chart.data.datasets[indice] as { claveCamara?: string })?.claveCamara;
}

export function camarasOcultas(chart: Chart): Set<string> {
  const claves = new Set<string>();
  chart.data.datasets.forEach((_dataset, indice) => {
    const clave = claveCamara(chart, indice);
    if (clave && !chart.isDatasetVisible(indice)) claves.add(clave);
  });
  return claves;
}

export const alternarCamara: LegendOptions<'line'>['onClick'] = (_evento, item, leyenda) => {
  const chart = leyenda.chart;
  const clave = claveCamara(chart, item.datasetIndex);
  if (!clave || item.datasetIndex === undefined) return;
  const visible = !chart.isDatasetVisible(item.datasetIndex);
  chart.data.datasets.forEach((_dataset, indice) => {
    if (claveCamara(chart, indice) === clave) chart.setDatasetVisibility(indice, visible);
  });
  chart.update();
};

export function detalleEjecucion(punto: TooltipItem<'line'>): string {
  return (punto.dataset as { detalle?: string }).detalle ?? '';
}
