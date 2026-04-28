import { Component, Input } from '@angular/core';


@Component({
  selector: 'app-trackmedia',
  imports: [
  ],
  templateUrl: './trackmedia.component.html',
  styleUrl: './trackmedia.component.css',
})
export class TrackMediaComponent {
  @Input() public artworkURL!: string;
}
