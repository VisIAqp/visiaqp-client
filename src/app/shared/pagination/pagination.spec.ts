import { TestBed } from '@angular/core/testing';
import { Pagination } from './pagination';

describe('Pagination', () => {
  function setup(page: number, pages: number, total: number) {
    const fixture = TestBed.createComponent(Pagination);
    fixture.componentRef.setInput('page', page);
    fixture.componentRef.setInput('pages', pages);
    fixture.componentRef.setInput('total', total);
    fixture.detectChanges();
    return fixture;
  }

  it('disables both directions for an empty result', () => {
    const fixture = setup(1, 1, 0);
    const buttons = fixture.nativeElement.querySelectorAll('button');
    expect(buttons[0].disabled).toBeTrue();
    expect(buttons[1].disabled).toBeTrue();
    expect(fixture.nativeElement.textContent).toContain('Página 1 de 1 · 0 ventanas');
  });

  it('emits direction and prevents navigation beyond either boundary', () => {
    const fixture = setup(1, 3, 40);
    const directions: number[] = [];
    fixture.componentInstance.pageChange.subscribe((delta) => directions.push(delta));
    const buttons = fixture.nativeElement.querySelectorAll('button');
    buttons[0].click();
    buttons[1].click();
    expect(directions).toEqual([1]);
    fixture.componentRef.setInput('page', 3);
    fixture.detectChanges();
    buttons[1].click();
    buttons[0].click();
    expect(directions).toEqual([1, -1]);
  });
});
