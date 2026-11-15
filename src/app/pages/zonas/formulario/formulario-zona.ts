import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { distinctUntilChanged, map } from 'rxjs';
import { RequestState } from '../../../core/api/request-state';
import { Auth } from '../../../core/auth/auth';
import { Zona } from '../../../core/models/zona.model';
import { ZonaService } from '../../../core/services/zona';
import { ApiState } from '../../../shared/api-state/api-state';
import { UmbralesZona } from '../componentes/umbrales-zona/umbrales-zona';

const formularioVacio = () => ({
  nombre: '', ubicacion: '', descripcion: '', pais: 'PE',
  latitud: null as number | null, longitud: null as number | null, estado: 'activa' as Zona['estado'],
});

@Component({
  selector: 'app-formulario-zona',
  imports: [ApiState, FormsModule, RouterLink, UmbralesZona],
  templateUrl: './formulario-zona.html',
})
export class FormularioZona implements OnInit {
  private readonly api = inject(ZonaService);
  private readonly auth = inject(Auth);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly ref = inject(DestroyRef);
  readonly soloUmbrales = this.route.snapshot.data['soloUmbrales'] === true;
  readonly consulta = new RequestState(this.ref);
  readonly guardado = new RequestState(this.ref);
  readonly zona = signal<Zona | null>(null);
  readonly id = signal<number | null>(null);
  readonly idInvalido = signal(false);
  formulario = formularioVacio();

  ngOnInit() {
    this.route.paramMap.pipe(
      map((params) => params.get('id')),
      distinctUntilChanged(),
      takeUntilDestroyed(this.ref),
    ).subscribe((parametro) => {
      const id = parametro === null ? null : Number(parametro);
      this.consulta.reiniciar();
      this.guardado.reiniciar();
      this.zona.set(null);
      this.formulario = formularioVacio();
      this.id.set(id);
      this.idInvalido.set(id !== null && (!Number.isSafeInteger(id) || id < 1));
      this.cargar();
    });
  }

  cargar() {
    const id = this.id();
    if (id === null || this.idInvalido() || this.consulta.loading()) return;
    this.consulta.run(this.api.obtener(id), (zona) => {
      this.zona.set(zona);
      this.formulario = { ...zona, descripcion: zona.descripcion ?? '', ubicacion: zona.ubicacion ?? '' };
    });
  }

  guardar() {
    if (this.soloUmbrales || !this.auth.isAdmin() || this.guardado.loading() || (this.id() !== null && !this.zona())) return;
    const { nombre, descripcion, ubicacion, latitud, longitud, estado } = this.formulario;
    const pais = this.formulario.pais.trim().toUpperCase();
    if (!nombre.trim() || !/^[A-Z]{2}$/.test(pais)) {
      this.guardado.error.set('Ingresa un nombre y un código de país de dos letras.');
      return;
    }
    if ((latitud !== null && (!Number.isFinite(latitud) || Math.abs(latitud) > 90)) ||
      (longitud !== null && (!Number.isFinite(longitud) || Math.abs(longitud) > 180))) {
      this.guardado.error.set('Revisa los rangos de latitud y longitud.');
      return;
    }
    const id = this.id();
    this.guardado.run(this.api.guardar({
      nombre: nombre.trim(), descripcion: descripcion.trim() || null, ubicacion: ubicacion.trim() || null,
      pais, latitud, longitud, ...(id === null ? {} : { estado }),
    }, id ?? undefined), (zona) => {
      void this.router.navigate(['/zonas'], { state: { zonaGuardada: zona.id } });
    });
  }
}
