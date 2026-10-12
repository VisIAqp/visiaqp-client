import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { MainLayout } from './main-layout';
describe('MainLayout', () => {
  it('renders the layout shell', () => {
    TestBed.configureTestingModule({
      imports: [MainLayout],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    });
    const fixture = TestBed.createComponent(MainLayout);
    fixture.detectChanges();
    expect(fixture.componentInstance).toBeTruthy();
    fixture.destroy();
  });
});
