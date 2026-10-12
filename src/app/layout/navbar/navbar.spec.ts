import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { Navbar } from './navbar';
describe('Navbar', () => {
  it('renders the layout shell', () => {
    TestBed.configureTestingModule({
      imports: [Navbar],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    });
    const fixture = TestBed.createComponent(Navbar);
    fixture.detectChanges();
    expect(fixture.componentInstance).toBeTruthy();
    fixture.destroy();
  });
});
