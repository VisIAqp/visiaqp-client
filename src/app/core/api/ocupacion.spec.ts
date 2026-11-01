import { TestBed } from '@angular/core/testing';
import { DtoMapper, IndicadorDto } from './dto';

describe('Mediciones de ocupación', () => {
  const historico: IndicadorDto = {
    id_indicador: 1, id_zona: 1, periodo_tipo: 'hora',
    periodo_inicio: '2026-10-31T10:00:00', periodo_fin: '2026-10-31T11:00:00',
    total_peatones: 200, promedio_peatones: 50, max_peatones: 90,
    nivel_concentracion: 'alto',
  };
  it('conserva conteos históricos sin convertirlos en ocupación', () => {
    const fila = TestBed.inject(DtoMapper).indicador(historico);
    expect(fila.totalPeatones).toBe(200);
    expect(fila.promedioPresentes).toBeNull();
    expect(fila.nivelOcupacion).toBeNull();
    expect(fila.estadoOcupacion).toBe('sin_datos');
  });
  it('conserva una ocupación de cero y su duración', () => {
    const fila = TestBed.inject(DtoMapper).indicador({
      ...historico, promedio_presentes: 0, max_presentes: 0,
      segundos_observados: 60, nivel_ocupacion: 'bajo', estado_ocupacion: 'disponible',
    });
    expect(fila.promedioPresentes).toBe(0);
    expect(fila.maxPresentes).toBe(0);
    expect(fila.segundosObservados).toBe(60);
    expect(fila.nivelOcupacion).toBe('bajo');
  });
});
