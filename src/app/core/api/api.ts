import { timeout } from 'rxjs';
import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { API_CONFIG } from './api-config';

@Injectable({ providedIn: 'root' })
export class Api {
  private readonly http = inject(HttpClient);
  readonly config = inject(API_CONFIG);
  private url(path: string) {
    return (
      (this.config.baseUrl.endsWith('/') ? this.config.baseUrl.slice(0, -1) : this.config.baseUrl) +
      path
    );
  }
  get<T>(path: string, query: Record<string, string | number | boolean | undefined> = {}) {
    let params = new HttpParams();
    for (const [key, value] of Object.entries(query))
      if (value !== undefined && value !== '') params = params.set(key, value);
    return this.http.get<T>(this.url(path), { params }).pipe(timeout(20000));
  }
  post<T>(path: string, body: unknown) {
    return this.http.post<T>(this.url(path), body).pipe(timeout(20000));
  }
  patch<T>(path: string, body: unknown) {
    return this.http.patch<T>(this.url(path), body).pipe(timeout(20000));
  }
  put<T>(path: string, body: unknown) {
    return this.http.put<T>(this.url(path), body).pipe(timeout(20000));
  }
}
