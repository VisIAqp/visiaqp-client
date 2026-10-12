import { Auth } from '../../core/auth/auth';
import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter, Subscription } from 'rxjs';

@Component({
  selector: 'app-navbar',
  imports: [],
  templateUrl: './navbar.html',
})
export class Navbar implements OnInit, OnDestroy {
  readonly auth = inject(Auth);
  titulo = 'Dashboard';

  private subscription?: Subscription;

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.actualizarTitulo(this.router.url);

    this.subscription = this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event) => {
        const navigation = event as NavigationEnd;

        this.actualizarTitulo(navigation.urlAfterRedirects);
      });
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  private actualizarTitulo(url: string): void {
    if (url.includes('/zonas')) {
      this.titulo = 'Zonas';
      return;
    }

    if (url.includes('/camaras')) {
      this.titulo = 'Cámaras';
      return;
    }

    if (url.includes('/monitoreo')) {
      this.titulo = 'Monitoreo';
      return;
    }

    if (url.includes('/analisis')) {
      this.titulo = 'Análisis';
      return;
    }

    if (url.includes('/reportes')) {
      this.titulo = 'Reportes';
      return;
    }

    this.titulo = 'Dashboard';
  }
}
