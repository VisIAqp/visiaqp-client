import { Component, input, output } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { NavigationLink } from '../../navigation';

@Component({
  selector: 'app-sidebar-nav-group',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './nav-group.html',
  host: { class: 'block' },
})
export class SidebarNavGroup {
  readonly titulo = input.required<string>();
  readonly enlaces = input.required<readonly NavigationLink[]>();
  readonly navegar = output<MouseEvent>();
}
