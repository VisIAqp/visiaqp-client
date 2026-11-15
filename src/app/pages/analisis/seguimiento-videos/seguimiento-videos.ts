import { DatePipe } from '@angular/common';
import { Component, computed, ElementRef, inject, input, model, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RequestState } from '../../../core/api/request-state';
import { EstadoProcesamiento, Procesamiento } from '../../../core/models/analisis.model';
import { Camara } from '../../../core/models/camara.model';
import { ApiState } from '../../../shared/api-state/api-state';
import { EstadoEjecucionBadge, estadosEjecucion } from '../../../shared/estado-ejecucion-badge/estado-ejecucion-badge';
import { Pagination } from '../../../shared/pagination/pagination';

@Component({
  selector: 'app-seguimiento-videos',
  imports: [ApiState, DatePipe, EstadoEjecucionBadge, FormsModule, Pagination],
  templateUrl: './seguimiento-videos.html',
})
export class SeguimientoVideos {
  private readonly elemento: ElementRef<HTMLElement> = inject(ElementRef);
  readonly filas = input.required<Procesamiento[]>();
  readonly camaras = input.required<Camara[]>();
  readonly consulta = input.required<RequestState>();
  readonly cancelacion = input.required<RequestState>();
  readonly puedeCancelar = input.required<(fila: Procesamiento) => boolean>();
  readonly destacada = input<number | null>(null);
  readonly mensaje = input('');
  readonly pagina = input.required<number>();
  readonly paginas = input.required<number>();
  readonly total = input.required<number>();
  readonly filtroEstado = model<EstadoProcesamiento | ''>('');
  readonly filtroCamara = model(0);
  readonly reintentar = output<void>();
  readonly cambiarPagina = output<number>();
  readonly cancelar = output<Procesamiento>();
  readonly estados = Object.entries(estadosEjecucion);
  private readonly nombres = computed(() => new Map(this.camaras().map((camara) => [camara.id, camara.nombre])));

  nombreCamara(id: number | null) {
    return id === null ? 'Sin cámara' : (this.nombres().get(id) ?? 'Cámara ' + id);
  }

  enfocarEjecucion(id: number) {
    const fila = this.elemento.nativeElement.querySelector<HTMLElement>('#ejecucion-' + id);
    fila?.focus({ preventScroll: true });
    fila?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  }
}
