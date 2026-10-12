import { provideRouter } from '@angular/router';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Sidebar } from './sidebar';

describe('Sidebar', () => {
  let component: Sidebar;
  let fixture: ComponentFixture<Sidebar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Sidebar],
      providers: [provideRouter([])]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Sidebar);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
  it('opens and closes the mobile menu with its button', () => {
    const button = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
    const menu = fixture.nativeElement.querySelector('#menu-principal') as HTMLElement;
    expect(button.getAttribute('aria-expanded')).toBe('false');
    expect(menu.classList.contains('hidden')).toBeTrue();
    button.click();
    fixture.detectChanges();
    expect(button.getAttribute('aria-expanded')).toBe('true');
    expect(menu.classList.contains('hidden')).toBeFalse();
    button.click();
    fixture.detectChanges();
    expect(button.getAttribute('aria-expanded')).toBe('false');
  });

  it('closes the menu on Escape and restores focus to the button', () => {
    const button = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
    button.click();
    fixture.detectChanges();
    const link = fixture.nativeElement.querySelector('nav a') as HTMLAnchorElement;
    link.focus();
    link.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    fixture.detectChanges();
    expect(button.getAttribute('aria-expanded')).toBe('false');
    expect(document.activeElement).toBe(button);
  });
});
