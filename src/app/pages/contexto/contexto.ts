import { Component, DestroyRef, inject, Input, OnChanges, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { tap } from 'rxjs';
import { Auth } from '../../core/auth/auth';
import { RequestState } from '../../core/api/request-state';
import { PanelMetricas } from '../../core/api/panel-metricas';
import { estadoMedicion, fechaMetrica, mostrarFecha, rangoValido } from '../../core/api/metricas-presentacion';
import { addDays, exclusiveEnd, limaToday } from '../../core/api/dates';
import { ZonaService } from '../../core/services/zona';
import { ContextoService } from '../../core/services/contexto';
import { Zona } from '../../core/models/zona.model';
import { ClimaHora, EventoCalendario, EventoEntrada, ResultadoSincronizacion, SerieContexto, EstadoSincronizacion } from '../../core/models/contexto.model';
import { FiltrosMetricas } from '../../core/models/metricas.model';
import { ApiState } from '../../shared/api-state/api-state';
import { Pagination } from '../../shared/pagination/pagination';

@Component({ selector: 'app-contexto', imports: [CommonModule, FormsModule, RouterLink, ApiState, Pagination],
  templateUrl: './contexto.html', styleUrl: './contexto.css' })
export class Contexto implements OnInit, OnChanges {
  @Input() filtros: FiltrosMetricas | null = null;
  private iniciado = false;
  ngOnChanges() { if (this.iniciado) this.aplicarFiltros(); }
  private aplicarFiltros() {
    if (!this.filtros) return;
    this.zonaId = this.filtros.id_zona ?? 0;
    this.desde = this.filtros.desde.slice(0, 10);
    this.hasta = addDays(this.filtros.hasta.slice(0, 10), -1);
    this.anio = Number(this.desde.slice(0, 4));
    this.consultar();
  }
  readonly auth = inject(Auth);
  private api = inject(ContextoService);
  private zonasApi = inject(ZonaService);
  private ref = inject(DestroyRef);
  readonly request = new RequestState(this.ref);
  readonly syncClima = new RequestState(this.ref);
  readonly syncCalendario = new RequestState(this.ref);
  readonly guardar = new RequestState(this.ref);
  readonly calendario = new PanelMetricas<EventoCalendario>(this.ref);
  readonly clima = new PanelMetricas<ClimaHora>(this.ref);
  readonly series = new PanelMetricas<SerieContexto>(this.ref);
  readonly fecha = mostrarFecha;
  readonly hoy = limaToday();
  get ocupado() { return this.syncClima.loading() || this.syncCalendario.loading() || this.guardar.loading(); }
  readonly estadoMedicion = estadoMedicion;
  zonas: Zona[] = [];
  zonaId = 0;
  desde = addDays(limaToday(), -6);
  hasta = limaToday();
  anio = Number(limaToday().slice(0, 4));
  aplicado: { zonaId: number; desde: string; hasta: string; anio: number } | null = null;
  errorFiltros = '';
  mensajeClima = '';
  mensajeCalendario = '';
  mensajeEvento = '';
  ultimoCalendario: EstadoSincronizacion | null = null;
  ultimoClima: EstadoSincronizacion | null = null;
  eventoId?: number;
  formulario: EventoEntrada = this.nuevoEvento();
  get zonaAplicada() { return this.zonas.find((z) => z.id === this.aplicado?.zonaId); }
  get tieneCoordenadas() { const z = this.zonaAplicada; return !!z && z.latitud !== null && z.longitud !== null; }
  ngOnInit() { this.iniciado = true; this.cargar(); }
  cargar() {
    this.request.run(this.zonasApi.listar(), (zonas) => {
      this.zonas = zonas;
      if (!zonas.some((z) => z.id === this.zonaId)) this.zonaId = zonas[0]?.id ?? 0;
      if (this.filtros) this.aplicarFiltros(); else this.consultar();
    });
  }
  consultar() {
    if (this.ocupado) return;
    for (const p of [this.calendario, this.clima, this.series]) p.limpiar();
    this.aplicado = null;
    this.errorFiltros = '';
    this.mensajeClima = this.mensajeCalendario = '';
    this.ultimoClima = this.ultimoCalendario = null;
    if (!rangoValido(this.desde, this.hasta) || this.hasta > limaToday() || !Number.isInteger(this.anio) || this.anio < 1940 || this.anio > 2100) {
      this.errorFiltros = 'Consulta entre 1 y 31 días sin fechas futuras, y un año de calendario entre 1940 y 2100.';
      return;
    }
    this.aplicado = { zonaId: this.zonaId, desde: this.desde, hasta: this.hasta,
      anio: this.anio };
    if (!this.eventoId && !this.formulario.nombre) this.formulario.id_zona = this.zonaId || null;
    this.cargarCalendario(); this.cargarClima(); this.cargarSeries();
  }
  cargarCalendario(desplazamiento = 0) {
    const a = this.aplicado;
    if (!a) return;
    this.calendario.cargar(this.api.calendario(a.anio, a.zonaId || undefined, desplazamiento)
      .pipe(tap((p) => this.ultimoCalendario = p.sincronizacion)));
  }
  cargarClima(desplazamiento = 0) {
    const a = this.aplicado;
    if (!a?.zonaId) return;
    this.clima.cargar(this.api.clima(a.zonaId, a.desde, a.hasta, desplazamiento)
      .pipe(tap((p) => this.ultimoClima = p.sincronizacion)));
  }
  cargarSeries(desplazamiento = 0) {
    const a = this.aplicado;
    if (!a?.zonaId) return;
    this.series.cargar(this.api.series({ ...this.filtros, id_zona: a.zonaId, desde: a.desde + 'T00:00:00',
      hasta: exclusiveEnd(a.hasta)!, periodo: 'hora' }, desplazamiento));
  }
  private resultado(r: ResultadoSincronizacion) { return r.estado === 'cache' ? 'Los datos guardados siguen vigentes; no se repitió la consulta externa.' : r.registros + ' registros actualizados.'; }
  sincronizarClima() {
    const a = this.aplicado;
    if (!a?.zonaId || !this.auth.isAdmin() || !this.tieneCoordenadas || this.syncClima.loading()) return;
    this.mensajeClima = '';
    this.syncClima.run(this.api.sincronizarClima(a.zonaId, a.desde, a.hasta), (r) => {
      if (this.aplicado !== a) return;
      this.mensajeClima = this.resultado(r); this.cargarClima(); this.cargarSeries();
    });
  }
  sincronizarCalendario() {
    const a = this.aplicado;
    if (!a || !this.auth.isAdmin() || this.syncCalendario.loading()) return;
    this.mensajeCalendario = '';
    this.syncCalendario.run(this.api.sincronizarCalendario(a.anio), (r) => {
      if (this.aplicado !== a) return;
      this.mensajeCalendario = this.resultado(r); this.cargarCalendario(); this.cargarSeries();
    });
  }
  nuevoEvento(): EventoEntrada { return { fecha: limaToday(), nombre: '', tipo: 'evento', alcance: 'local', id_zona: null, referencia: '', activo: true }; }
  limpiarEvento() { this.eventoId = undefined; this.formulario = { ...this.nuevoEvento(), id_zona: this.aplicado?.zonaId || null }; this.mensajeEvento = ''; this.guardar.error.set(''); }
  editar(evento: EventoCalendario) {
    if (!this.auth.isAdmin() || !evento.editable) return;
    this.eventoId = evento.id_evento;
    const { fecha, nombre, tipo, alcance, id_zona, referencia, activo } = evento;
    this.formulario = { fecha, nombre, tipo, alcance, id_zona, referencia, activo };
  }
  guardarEvento() {
    if (!this.auth.isAdmin() || this.guardar.loading()) return;
    const datos = { ...this.formulario, nombre: this.formulario.nombre.trim(),
      id_zona: this.formulario.alcance === 'local' ? this.formulario.id_zona : null };
    if (!datos.nombre || !datos.referencia || !rangoValido(datos.fecha, datos.fecha) || datos.fecha < '1940-01-01' || datos.fecha > '2100-12-31' || (datos.alcance === 'local' && !datos.id_zona)) {
      this.guardar.error.set('Completa una fecha válida, nombre, fuente y zona si el alcance es local.'); return;
    }
    try {
      const url = new URL(datos.referencia);
      if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password) throw new Error();
    } catch {
      this.guardar.error.set('La fuente debe ser una dirección pública http o https, sin credenciales.'); return;
    }
    this.guardar.run(this.api.guardarEvento(datos, this.eventoId), () => {
      this.limpiarEvento(); this.mensajeEvento = 'Evento guardado con su referencia.';
      this.cargarCalendario(); this.cargarSeries();
    });
  }
  dia(valor: string) { return fechaMetrica(valor + 'T12:00:00').toLocaleDateString('es-PE', { timeZone: 'America/Lima' }); }
  tipoEvento(tipo: string) { return ({ feriado: 'Feriado', no_laborable: 'Día no laborable', evento: 'Evento' } as Record<string, string>)[tipo] || tipo; }
  tipoClima(tipo: string | null) { return tipo === 'historico_modelado' ? 'Histórico modelado · ERA5' : tipo === 'estimacion_reciente' ? 'Estimación reciente' : 'Sin clima guardado'; }
  condicion(codigo: number | null) {
    if (codigo === null) return 'Sin dato';
    if (codigo === 0) return 'Despejado'; if (codigo <= 3) return 'Nubosidad';
    if ([45, 48].includes(codigo)) return 'Niebla'; if ([51, 53, 55, 56, 57].includes(codigo)) return 'Llovizna';
    if ([61, 63, 65, 66, 67, 80, 81, 82].includes(codigo)) return 'Lluvia';
    if ([71, 73, 75, 77, 85, 86].includes(codigo)) return 'Nieve';
    return [95, 96, 99].includes(codigo) ? 'Tormenta' : 'Condición sin descripción';
  }
}
