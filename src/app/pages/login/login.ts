import { Component, DestroyRef, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Auth } from '../../core/auth/auth';
import { RequestState } from '../../core/api/request-state';
import { ApiState } from '../../shared/api-state/api-state';
@Component({ selector: 'app-login', imports: [FormsModule, ApiState], templateUrl: './login.html' })
export class Login {
  readonly auth = inject(Auth);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  readonly request = new RequestState(inject(DestroyRef));
  username = '';
  password = '';
  entrar() {
    if (!this.username.trim() || !this.password || this.request.loading()) return;
    this.request.run(this.auth.login(this.username.trim(), this.password), () => {
      this.password = '';
      const next = this.route.snapshot.queryParamMap.get('returnUrl') || '/dashboard';
      void this.router.navigateByUrl(
        next.startsWith('/') && !next.startsWith('//') ? next : '/dashboard',
      );
    });
  }
}
