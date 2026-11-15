import { Component, linkedSignal, model, OnDestroy, signal } from '@angular/core';

type Punto = [number, number];
const formatosImagen = ['image/jpeg', 'image/png', 'image/webp'];

@Component({
  selector: 'app-editor-poligono',
  templateUrl: './editor-poligono.html',
})
export class EditorPoligono implements OnDestroy {
  readonly cuadricula = Array.from({ length: 32 }, (_, indice) => indice);
  readonly puntos = model<Punto[]>([]);
  readonly imagen = signal<string | null>(null);
  readonly errorImagen = signal('');
  readonly errorCoordenadas = signal('');
  readonly coordenadas = linkedSignal(() => this.puntos().length ? JSON.stringify(this.puntos()) : '');

  dibujar(evento: MouseEvent, lienzo: HTMLElement) {
    const rect = lienzo.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    const normalizar = (valor: number) => Math.round(Math.max(0, Math.min(1, valor)) * 10000) / 10000;
    this.errorCoordenadas.set('');
    this.puntos.update((puntos) => [...puntos, [
      normalizar((evento.clientX - rect.left) / rect.width),
      normalizar((evento.clientY - rect.top) / rect.height),
    ]]);
  }

  trazo() {
    return this.puntos().map(([x, y]) => `${x * 100},${y * 100}`).join(' ');
  }

  quitarUltimo() {
    this.errorCoordenadas.set('');
    this.puntos.update((puntos) => puntos.slice(0, -1));
  }

  limpiar() {
    this.errorCoordenadas.set('');
    this.puntos.set([]);
  }

  aplicarCoordenadas(): Punto[] | undefined {
    try {
      const texto = this.coordenadas().trim();
      const valor: unknown = texto ? JSON.parse(texto) : [];
      if (!Array.isArray(valor) || (valor.length > 0 && valor.length < 3) ||
        valor.some((punto: unknown) => !Array.isArray(punto) || punto.length !== 2 ||
          punto.some((n: unknown) => typeof n !== 'number' || !Number.isFinite(n) || n < 0 || n > 1))) {
        throw new Error('Polígono inválido');
      }
      const puntos = valor as Punto[];
      this.puntos.set(puntos);
      this.errorCoordenadas.set('');
      return puntos;
    } catch {
      this.errorCoordenadas.set('El área necesita al menos tres puntos [x, y], con coordenadas entre 0 y 1.');
      return undefined;
    }
  }

  cargarImagen(evento: Event) {
    const input = evento.target as HTMLInputElement;
    const archivo = input.files?.[0];
    input.value = '';
    if (!archivo) return;
    if (!formatosImagen.includes(archivo.type)) {
      this.errorImagen.set('Selecciona una imagen JPG, PNG o WebP.');
      return;
    }
    this.quitarImagen();
    this.imagen.set(URL.createObjectURL(archivo));
  }

  mostrarErrorImagen() {
    this.quitarImagen();
    this.errorImagen.set('No se pudo abrir la imagen de referencia.');
  }

  quitarImagen() {
    const imagen = this.imagen();
    if (imagen) URL.revokeObjectURL(imagen);
    this.imagen.set(null);
    this.errorImagen.set('');
  }

  ngOnDestroy() {
    const imagen = this.imagen();
    if (imagen) URL.revokeObjectURL(imagen);
  }
}
