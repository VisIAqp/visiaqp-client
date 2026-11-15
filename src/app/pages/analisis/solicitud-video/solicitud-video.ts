import { DecimalPipe, formatDate } from '@angular/common';
import { Component, computed, inject, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DtoMapper, VideoDto } from '../../../core/api/dto';
import { RequestState } from '../../../core/api/request-state';
import { Camara } from '../../../core/models/camara.model';
import { ApiState } from '../../../shared/api-state/api-state';

export interface SolicitudAnalisisVideo {
  videoId: number;
  camaraId: number;
  fechaCaptura: string;
}

@Component({
  selector: 'app-solicitud-video',
  imports: [ApiState, DecimalPipe, FormsModule],
  templateUrl: './solicitud-video.html',
})
export class SolicitudVideo {
  private readonly mapper = inject(DtoMapper);
  readonly videos = input.required<VideoDto[]>();
  readonly camaras = input.required<Camara[]>();
  readonly catalogo = input.required<RequestState>();
  readonly envio = input.required<RequestState>();
  readonly solicitar = output<SolicitudAnalisisVideo>();
  readonly recargarCatalogo = output<void>();

  readonly videoId = signal(0);
  readonly camaraId = signal(0);
  readonly fechaCaptura = signal('');
  readonly errorValidacion = signal('');
  readonly disponibles = computed(() => this.videos().filter((video) => video.disponible));
  readonly activas = computed(() => this.camaras().filter((camara) => camara.estado === 'activa'));
  readonly camara = computed(() => this.activas().find((camara) => camara.id === this.camaraId()));

  seleccionarVideo(id: number) {
    this.videoId.set(id);
    this.errorValidacion.set('');
    const video = this.disponibles().find((video) => video.id_video === id);
    const fecha = video ? this.mapper.date(video.fecha_modificacion) : null;
    this.fechaCaptura.set(fecha && Number.isFinite(fecha.getTime())
      ? formatDate(fecha, "yyyy-MM-dd'T'HH:mm", 'en-US', '-0500')
      : '');
  }

  enviar() {
    if (this.envio().loading() || this.catalogo().loading()) return;
    const camara = this.camara();
    const fecha = this.fechaCaptura();
    const videoId = this.videoId();
    if (!camara?.zonePolygon || !this.disponibles().some((video) => video.id_video === videoId) || !fecha) return;
    const instante = this.mapper.date(fecha).getTime();
    if (!Number.isFinite(instante) || instante > Date.now() + 300000) {
      this.errorValidacion.set('Ingresa una fecha de grabación válida que no sea futura.');
      return;
    }
    this.errorValidacion.set('');
    this.solicitar.emit({ videoId, camaraId: camara.id, fechaCaptura: fecha.length === 16 ? fecha + ':00' : fecha });
  }
}
