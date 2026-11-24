import { TestBed } from '@angular/core/testing';
import { EstadoCamaraBadge } from './estado-camara-badge';

describe('Actividad de transmisiones', () => {
  it('distingue la configuración del área del estado operativo', () => {
    TestBed.configureTestingModule({ imports: [EstadoCamaraBadge] });
    const vista = TestBed.createComponent(EstadoCamaraBadge);
    const texto = () => vista.nativeElement.textContent;

    vista.componentRef.setInput('estado', 'sin_transmision');
    vista.detectChanges();
    expect(texto()).toContain('Sin transmisión');

    vista.componentRef.setInput('estado', 'conectando');
    vista.detectChanges();
    expect(texto()).toContain('Conectando');

    vista.componentRef.setInput('estado', 'reportando');
    vista.detectChanges();
    expect(texto()).toContain('Recibiendo imágenes');

    vista.componentRef.setInput('estado', 'sin_senal');
    vista.detectChanges();
    expect(texto()).toContain('Sin señal');

    vista.componentRef.setInput('estado', 'interrumpida');
    vista.detectChanges();
    expect(texto()).toContain('Interrumpida');

    vista.componentRef.setInput('faltaArea', true);
    vista.detectChanges();
    expect(texto()).toContain('Área sin configurar');
    vista.destroy();
  });
});
