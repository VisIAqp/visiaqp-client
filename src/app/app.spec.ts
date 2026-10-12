import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter, Router } from '@angular/router';
import { App } from './app';
import { routes } from './app.routes';
describe('App authentication', () => {
  beforeEach(() => {
    sessionStorage.clear();
    TestBed.configureTestingModule({
      imports: [App],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter(routes)],
    });
  });
  it('redirects anonymous users to login without rendering protected data', async () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const router = TestBed.inject(Router);
    await router.navigateByUrl('/dashboard');
    await fixture.whenStable();
    fixture.detectChanges();
    expect(router.url).toContain('/login');
    expect(fixture.nativeElement.textContent).toContain('Iniciar sesión');
    expect(fixture.nativeElement.querySelector('app-sidebar')).toBeNull();
    fixture.destroy();
  });
});
