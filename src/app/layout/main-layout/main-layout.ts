import { Component, computed, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Auth } from '../../core/auth/auth';
import { Sidebar } from '../sidebar/sidebar';
import { Navbar } from '../navbar/navbar';

@Component({
  selector: 'app-main-layout',
  imports: [RouterOutlet, Sidebar, Navbar],
  templateUrl: './main-layout.html'
})
export class MainLayout {
  readonly auth = inject(Auth);
  readonly nombreUsuario = computed(() => {
    const usuario = this.auth.user();
    if (!usuario) return '';
    return [usuario.nombres, usuario.apellidos].filter(Boolean).join(' ').trim() || usuario.username;
  });
}
