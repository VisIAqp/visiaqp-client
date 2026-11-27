import { Component, computed, inject, input, linkedSignal } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-video-en-vivo',
  host: { class: 'block min-w-0' },
  template: `
    <section class="ui-card p-4 desktop:p-5" aria-labelledby="titulo-video-en-vivo">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <h3 id="titulo-video-en-vivo" class="m-0">Transmisión de la cámara</h3>
        <button type="button" class="ui-focus cursor-pointer rounded-lg border border-solid border-field px-4 py-2"
          [disabled]="!reproductor()" [attr.aria-expanded]="abierto()" aria-controls="video-en-vivo"
          (click)="abierto.set(!abierto())">
          {{ abierto() ? 'Cerrar video' : 'Ver en vivo' }}
        </button>
      </div>
      <div id="video-en-vivo">
        @if (reproductor(); as video) {
          @if (abierto()) {
            <iframe class="mt-4 block aspect-video w-full rounded-lg border-0 bg-black"
              title="Video en vivo de la cámara" referrerpolicy="no-referrer"
              allow="autoplay; fullscreen; local-network; loopback-network" [src]="video.src"></iframe>
            <p class="mt-3 mb-0 text-label text-muted">
              Si el video no se muestra, verifica tu conexión a la red local o
              <a class="ui-focus text-brand" [href]="video.enlace" target="_blank" rel="noopener noreferrer">
                abre el reproductor en otra pestaña</a>.
            </p>
          }
        } @else {
          <p class="mt-3 mb-0 text-label text-muted">
            {{ url() ? 'La dirección del reproductor no es válida.' : 'Esta cámara aún no tiene una ruta de video en vivo configurada.' }}
          </p>
        }
      </div>
    </section>
  `,
})
export class VideoEnVivo {
  private readonly sanitizer = inject(DomSanitizer);
  readonly url = input.required<string | null>();
  readonly abierto = linkedSignal({ source: this.url, computation: () => false });
  readonly reproductor = computed(() => {
    const direccion = this.url();
    const url = direccion ? URL.parse(direccion) : null;
    if (!url || url.username || url.password || url.search || url.hash) return null;
    const esLocal = ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname);
    if (url.protocol !== 'https:' && !(esLocal && url.protocol === 'http:')) return null;
    // MediaMTX aloja el reproductor. Usamos la URL generada por la API, nunca la fuente RTSP.
    const enlace = url.href;
    return { enlace, src: this.sanitizer.bypassSecurityTrustResourceUrl(enlace) };
  });
}
