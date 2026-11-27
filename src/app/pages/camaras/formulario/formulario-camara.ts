import { Component, DestroyRef, inject, OnInit, signal, viewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { distinctUntilChanged, forkJoin, map, of } from 'rxjs';
import { RequestState } from '../../../core/api/request-state';
import { Auth } from '../../../core/auth/auth';
import { Camara, ConfiguracionCamara } from '../../../core/models/camara.model';
import { Zona } from '../../../core/models/zona.model';
import { CamaraService } from '../../../core/services/camara';
import { ZonaService } from '../../../core/services/zona';
import { ApiState } from '../../../shared/api-state/api-state';
import { EditorPoligono } from '../../../shared/editor-poligono/editor-poligono';

const formularioVacio = (): ConfiguracionCamara => ({
  nombre: '', zonaId: 0, tipo: 'fija', estado: 'activa', intervaloMuestreoSeg: 60,
  urlStream: '', rutaVideoEnVivo: '', zonePolygon: null,
});

@Component({
  selector: 'app-formulario-camara',
  imports: [ApiState, EditorPoligono, FormsModule, RouterLink],
  templateUrl: './formulario-camara.html',
})
export class FormularioCamara implements OnInit {
  private readonly api = inject(CamaraService);
  private readonly zonasApi = inject(ZonaService);
  private readonly auth = inject(Auth);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly ref = inject(DestroyRef);
  private readonly editor = viewChild(EditorPoligono);
  readonly request = new RequestState(this.ref);
  readonly saving = new RequestState(this.ref);
  readonly idCamara = signal<number | null>(null);
  readonly idInvalido = signal(false);
  readonly zonas = signal<Zona[]>([]);
  readonly camara = signal<Camara | null>(null);
  readonly puntos = signal<[number, number][]>([]);
  nuevaCamara = formularioVacio();

  ngOnInit() {
    this.route.paramMap.pipe(
      map((params) => params.get('id')),
      distinctUntilChanged(),
      takeUntilDestroyed(this.ref),
    ).subscribe((parametro) => {
      this.request.reiniciar();
      this.saving.reiniciar();
      const id = parametro === null ? null : Number(parametro);
      const invalido = id !== null && (!Number.isSafeInteger(id) || id < 1);
      this.idCamara.set(id);
      this.idInvalido.set(invalido);
      this.camara.set(null);
      this.nuevaCamara = formularioVacio();
      this.puntos.set([]);
      if (!invalido) this.cargar();
    });
  }

  cargar() {
    if (this.idInvalido() || this.request.loading()) return;
    const id = this.idCamara();
    this.request.run(forkJoin({
      zonas: this.zonasApi.listar(),
      camara: id === null ? of(null) : this.api.obtener(id),
    }), ({ zonas, camara }) => {
      this.zonas.set(zonas);
      this.camara.set(camara);
      if (camara) {
        this.nuevaCamara = {
          nombre: camara.nombre, zonaId: camara.zonaId, tipo: camara.tipo,
          estado: camara.estado, intervaloMuestreoSeg: camara.intervaloMuestreoSeg,
          urlStream: '', rutaVideoEnVivo: camara.rutaVideoEnVivo ?? '', zonePolygon: camara.zonePolygon,
        };
        this.puntos.set(camara.zonePolygon ?? []);
      }
    });
  }

  guardarCamara() {
    if (!this.auth.isAdmin() || this.saving.loading() || !this.request.actualizado()) return;
    this.saving.error.set('');
    const datos = this.nuevaCamara;
    if (!datos.nombre.trim() || !datos.zonaId || !Number.isInteger(datos.intervaloMuestreoSeg) ||
      datos.intervaloMuestreoSeg < 1) {
      this.saving.error.set('Revisa el nombre, la zona y la ventana de reporte.');
      return;
    }
    if (!this.camara()?.tieneUrlStream && !datos.urlStream.trim()) {
      this.saving.error.set('Indica la fuente de video de la cámara.');
      return;
    }
    const puntos = this.editor()?.aplicarCoordenadas();
    if (!puntos) return;
    this.saving.run(this.api.guardar({
      ...datos, zonePolygon: puntos.length ? puntos : null,
    }, this.idCamara() ?? undefined), (camara) => {
      void this.router.navigate(['/camaras'], { state: { camaraGuardada: camara.id } });
    });
  }
}
