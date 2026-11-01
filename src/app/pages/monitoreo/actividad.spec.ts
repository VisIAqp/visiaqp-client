import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { Monitoreo } from './monitoreo';
import { Procesamiento } from '../../core/models/analisis.model';

describe('Actividad de transmisiones', () => {
  it('distingue una cámara habilitada de un motor reportando actividad', () => {
    TestBed.configureTestingModule({providers: [provideHttpClient(), provideRouter([])]});
    const fixture = TestBed.createComponent(Monitoreo);
    const pantalla = fixture.componentInstance;
    pantalla.camaraSeleccionadaId = 1;
    expect(pantalla.estadoTransmision).toBe('Sin transmisión registrada');
    const transmision: Procesamiento = {
      id: 1, zonaId: 1, camaraId: 1, usuarioId: null, tipoFuente: 'stream',
      rutaArchivo: null, fechaCapturaInicio: new Date(), fechaInicioProceso: new Date(),
      fechaFinProceso: null, estado: 'procesando', mensajeError: null,
    };
    pantalla.procesamientos = [transmision];
    expect(pantalla.estadoTransmision).toBe('Sin señal de actividad');
    transmision.ultimaActividad = new Date();
    expect(pantalla.estadoTransmision).toBe('Motor reportando actividad');
    transmision.ultimaActividad = new Date(Date.now() - 180000);
    expect(pantalla.estadoTransmision).toBe('Sin actividad reciente');
    transmision.estado = 'error';
    expect(pantalla.estadoTransmision).toBe('Transmisión interrumpida');
    fixture.destroy();
  });
});
