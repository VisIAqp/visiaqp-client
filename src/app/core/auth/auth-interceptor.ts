import { inject } from '@angular/core';
import { HttpInterceptorFn } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';
import { Auth } from './auth';
import { API_CONFIG } from '../api/api-config';

export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const auth = inject(Auth);
  const configured = inject(API_CONFIG).baseUrl;
  const base = configured.endsWith('/') ? configured.slice(0, -1) : configured;
  const isApi = request.url === base || request.url.startsWith(base + '/');
  const isLogin = request.url === base + '/auth/login';
  const authenticated = isApi && !isLogin && auth.validToken();
  const outgoing = authenticated
    ? request.clone({ setHeaders: { Authorization: 'Bearer ' + auth.token() } })
    : request;
  return next(outgoing).pipe(
    catchError((error) => {
      if (isApi && !isLogin && error.status === 401 && request.url !== base + '/auth/me')
        auth.logout();
      return throwError(() => error);
    }),
  );
};
