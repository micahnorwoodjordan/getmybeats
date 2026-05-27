import { Component, OnInit } from '@angular/core';


@Component({
  selector: 'app-header',
  imports: [],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
})
export class HeaderComponent {
  public warningString: string = "NOTE: If audio is muted on iOS Safari, disable Silent Mode using the side switch";
}
