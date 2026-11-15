import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router } from '@angular/router';
import { filter, map } from 'rxjs';
import { navegacion } from '../navigation';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.html',
})
export class Navbar {
  private readonly router = inject(Router);
  readonly titulo = toSignal(
    this.router.events.pipe(
      filter((evento) => evento instanceof NavigationEnd),
      map((evento) => this.tituloDe(evento.urlAfterRedirects)),
    ),
    { initialValue: this.tituloDe(this.router.url) },
  );

  private tituloDe(url: string): string {
    const ruta = this.router.parseUrl(url).root.children['primary']?.segments[0]?.path;
    return (
      Object.values(navegacion).find((enlace) => enlace.ruta === '/' + ruta)?.etiqueta ??
      navegacion.resumen.etiqueta
    );
  }
}
