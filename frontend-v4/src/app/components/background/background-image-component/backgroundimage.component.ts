import { Component, Input } from '@angular/core';

import { environment } from '../../../../environments/environment.dev';

@Component({
  selector: 'app-backgroundimage',
  imports: [],
  templateUrl: './backgroundimage.component.html',
  styleUrl: './backgroundimage.component.css',
})
export class BackgroundImageComponent {
  @Input() artworkURL: string = environment.defaultArtworkImageURL;
}
