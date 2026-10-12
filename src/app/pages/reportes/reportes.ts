import { ChangeDetectorRef, Component, HostListener, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IndicatorQuery } from '../../core/api/indicator-query';
import { IndicatorView } from '../../shared/indicator-view/indicator-view';
import { createCsv } from '../../core/api/csv';
@Component({
  selector: 'app-reportes',
  imports: [CommonModule, IndicatorView],
  providers: [IndicatorQuery],
  templateUrl: './reportes.html',
})
export class Reportes implements OnInit {
  readonly history = inject(IndicatorQuery);
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
    return (
      !!this.history.rows.length && !this.history.request.loading() && !this.history.request.error()
    );
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
        'Suma de conteos',
        'Promedio por ventana',
        'Máximo por ventana',
        'Nivel',
      ],
      ...this.history.rows.map((i) => [
        this.history.nombreZona(i.zonaId),
        i.periodoTipo,
        format(i.periodoInicio),
        format(i.periodoFin),
        i.totalPeatones,
        i.promedioPeatones,
        i.maxPeatones,
        i.nivelConcentracion,
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
