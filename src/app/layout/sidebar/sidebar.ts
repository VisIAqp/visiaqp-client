import { Component, ElementRef, HostListener, ViewChild, signal } from '@angular/core';
import { NgClass } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  imports: [NgClass, RouterLink, RouterLinkActive],
  templateUrl: './sidebar.html'
})
export class Sidebar {
  readonly menuAbierto = signal(false);
  @ViewChild('menuToggle') private menuToggle?: ElementRef<HTMLButtonElement>;

  @HostListener('keydown.escape')
  cerrarConEscape(): void {
    if (!this.menuAbierto()) return;
    this.menuAbierto.set(false);
    this.menuToggle?.nativeElement.focus();
  }
}
