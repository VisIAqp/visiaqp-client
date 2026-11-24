import { ChangeDetectorRef, Component, computed, HostListener, inject, OnInit } from '@angular/core';
import { rangoValido } from '../../core/api/metricas-presentacion';
import { FiltrosMetricas } from '../../core/models/metricas.model';
import { GraficosReportes } from './graficos-reportes/graficos-reportes';
import { IndicatorQuery } from '../../core/api/indicator-query';
import { ApiState } from '../../shared/api-state/api-state';
import { AccionesExportacion } from '../../shared/acciones-exportacion/acciones-exportacion';
import { FiltrosIndicadores } from '../../shared/filtros-indicadores/filtros-indicadores';
import { IndicatorView } from '../../shared/indicator-view/indicator-view';
import { OcupacionHistorica } from '../../shared/ocupacion-historica/ocupacion-historica';
import { createCsv } from '../../core/api/csv';
@Component({
  selector: 'app-reportes',
  imports: [ApiState, AccionesExportacion, FiltrosIndicadores, IndicatorView, OcupacionHistorica, GraficosReportes],
  providers: [IndicatorQuery],
  templateUrl: './reportes.html',
})
export class Reportes implements OnInit {
  readonly history = inject(IndicatorQuery);
  readonly filtrosGraficos = computed<FiltrosMetricas | null>(() => {
    const f = this.history.aplicado();
    return f && rangoValido(f.desde, f.hasta) ? f.consulta : null;
  });
  private cdr = inject(ChangeDetectorRef);
  printing = false;
  @HostListener('window:beforeprint') beforePrint() {
    this.printing = true;
    this.cdr.detectChanges();
  }
  @HostListener('window:afterprint') afterPrint() {
    this.printing = false;
    this.cdr.detectChanges();
  }
  ngOnInit() {
    this.history.inicializar();
  }
  get exportable() {
    return this.history.rows.length > 0 && !this.history.request.loading();
  }
  fechaDia(fecha: string) {
    return fecha.split('-').reverse().join('/');
  }
  exportarCsv() {
    if (!this.exportable) return;
    const format = (d: Date) => d.toLocaleString('es-PE', { timeZone: 'America/Lima' });
    const rows: (string | number)[][] = [
      [
        'Zona',
        'Periodo',
        'Inicio (Lima)',
        'Fin (Lima)',
        'Suma de conteos por ventana',
        'Promedio por ventana',
        'Máximo por ventana',
        'Ocupación promedio por cámara',
        'Ocupación máxima en una cámara',
        'Nivel de ocupación',
        'Estado de ocupación',
        'Fuente',
      ],
      ...this.history.rows.map((i) => [
        this.history.nombreZona(i.zonaId),
        i.periodoTipo,
        format(i.periodoInicio),
        format(i.periodoFin),
        i.totalPeatones,
        i.promedioPeatones,
        i.maxPeatones,
        i.promedioPresentes ?? '',
        i.maxPresentes ?? '',
        i.nivelOcupacion ?? '',
        i.estadoOcupacion ?? 'sin_datos',
        'Transmisiones en vivo',
      ]),
    ];
    const url = URL.createObjectURL(
      new Blob([createCsv(rows)], { type: 'text/csv;charset=utf-8;' }),
    );
    const link = document.createElement('a');
    link.href = url;
    link.download = 'visiaqp-indicadores.csv';
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  imprimir() {
    if (this.exportable) window.print();
  }
}
