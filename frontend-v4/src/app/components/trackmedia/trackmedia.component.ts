import { Component, Input } from '@angular/core';

import { environment } from '../../../environments/environment.dev';


@Component({
  selector: 'app-trackmedia',
  imports: [],
  templateUrl: './trackmedia.component.html',
  styleUrl: './trackmedia.component.css',
})
export class TrackMediaComponent {
  @Input() artworkURL: string = environment.defaultArtworkImageURL;
}
