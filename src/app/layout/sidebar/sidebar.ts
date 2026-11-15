import { Component, ElementRef, HostListener, input, output, ViewChild, signal } from '@angular/core';
import { navegacion } from '../navigation';
import { SidebarNavGroup } from './nav-group/nav-group';

@Component({
  selector: 'app-sidebar',
  imports: [SidebarNavGroup],
  templateUrl: './sidebar.html',
  host: { class: 'block' },
})
export class Sidebar {
  readonly usuario = input('');
  readonly rol = input('');
  readonly puedeConfigurar = input(false);
  readonly cerrarSesion = output<void>();
  readonly menuAbierto = signal(false);
  readonly operacion = [navegacion.resumen, navegacion.monitoreo];
  readonly analisis = [navegacion.analisis, navegacion.reportes];
  readonly catalogos = [navegacion.camaras, navegacion.zonas];
  @ViewChild('menuToggle') private menuToggle?: ElementRef<HTMLButtonElement>;

  @HostListener('keydown.escape')
  cerrarConEscape(): void {
    if (!this.menuAbierto()) return;
    this.menuAbierto.set(false);
    this.menuToggle?.nativeElement.focus();
  }

  cerrarTrasNavegar(evento: MouseEvent): void {
    if (evento.ctrlKey || evento.metaKey || evento.shiftKey || evento.altKey) return;
    this.cerrarConEscape();
  }
}
