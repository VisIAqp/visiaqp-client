import { inject, Injectable, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, map, of, switchMap, tap, throwError } from 'rxjs';
import { Api } from '../api/api';

export interface CurrentUser {
  id_usuario: number;
  nombres: string;
  apellidos: string;
  username: string;
  email: string;
  estado: string;
}
interface Claims {
  sub: string;
  rol: string;
  exp: number;
}
const STORAGE_KEY = 'visiaqp.access_token';
export function readClaims(token: string): Claims | null {
  try {
    const part = token.split('.')[1];
    const normalized = part.replace(/-/g, '+').replace(/_/g, '/');
    const json = decodeURIComponent(
      Array.from(atob(normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=')))
        .map((c) => '%' + c.charCodeAt(0).toString(16).padStart(2, '0'))
        .join(''),
    );
    const c = JSON.parse(json);
    return typeof c.exp === 'number' && typeof c.sub === 'string' && typeof c.rol === 'string'
      ? c
      : null;
  } catch {
    return null;
  }
}
@Injectable({ providedIn: 'root' })
export class Auth {
  private api = inject(Api);
  private router = inject(Router);
  readonly token = signal(sessionStorage.getItem(STORAGE_KEY) || '');
  readonly user = signal<CurrentUser | null>(null);
  readonly role = computed(() => readClaims(this.token())?.rol || '');
  readonly isAdmin = computed(() => this.role() === 'Administrador');
  private expiryTimer?: ReturnType<typeof setTimeout>;
  validToken(): boolean {
    const claims = readClaims(this.token());
    return !!claims && claims.exp * 1000 > Date.now();
  }
  private save(token: string) {
    this.token.set(token);
    sessionStorage.setItem(STORAGE_KEY, token);
    this.scheduleExpiry();
  }
  private scheduleExpiry() {
    clearTimeout(this.expiryTimer);
    const exp = readClaims(this.token())?.exp;
    if (exp)
      this.expiryTimer = setTimeout(
        () => this.logout(),
        Math.min(Math.max(0, exp * 1000 - Date.now()), 2147483647),
      );
  }
  login(username: string, password: string) {
    return this.api
      .post<{ access_token: string; token_type: string }>('/auth/login', { username, password })
      .pipe(
        switchMap((response) => {
          if (
            !readClaims(response.access_token) ||
            readClaims(response.access_token)!.exp * 1000 <= Date.now()
          )
            return throwError(() => new Error('Invalid session token'));
          this.save(response.access_token);
          return this.api.get<CurrentUser>('/auth/me');
        }),
        tap((user) => this.user.set(user)),
        catchError((e) => {
          this.clear();
          return throwError(() => e);
        }),
      );
  }
  restore() {
    if (!this.validToken()) {
      this.clear();
      return of(null);
    }
    this.scheduleExpiry();
    return this.api.get<CurrentUser>('/auth/me').pipe(
      tap((user) => this.user.set(user)),
      catchError(() => {
        this.clear();
        return of(null);
      }),
    );
  }
  clear() {
    clearTimeout(this.expiryTimer);
    this.token.set('');
    this.user.set(null);
    sessionStorage.removeItem(STORAGE_KEY);
  }
  logout() {
    this.clear();
    void this.router.navigateByUrl('/login');
  }
}
