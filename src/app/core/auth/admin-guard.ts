import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Auth } from './auth';

export const adminGuard: CanActivateFn = (route) =>
  inject(Auth).isAdmin() || inject(Router).createUrlTree([route.data['sinPermiso'] ?? '/']);
