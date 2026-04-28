import { Component } from '@angular/core';
import { PrimaryComponent } from '../controls/primary/primary.component';
import { SecondaryComponent } from '../controls/secondary/secondary.component';
import { ProgressComponent } from '../controls/progress/progress.component';
import { DetailsComponent } from '../details/details.component';
import { TrackMediaComponent } from '../trackmedia/trackmedia.component';

import { MediaContextService } from '../../services/mediaContext.service';


@Component({
  selector: 'app-player',
  imports: [
    PrimaryComponent,
    SecondaryComponent,
    ProgressComponent,
    DetailsComponent,
    TrackMediaComponent
  ],
  templateUrl: './player.component.html',
  styleUrl: './player.component.css',
})
export class PlayerComponent {
  public artworkURL: string = 'https://static.micahnorwoodjordan.com/me-sitting.png';  // TODO
  private selectedAudioIndex = 0;

  constructor(private mediaContextService: MediaContextService) { }

  public onNext() { this.mediaContextService.next(); }
  public onBack() { this.mediaContextService.back(); }
  public onShuffle() { this.mediaContextService.shuffle(); }
  public onRepeat() { this.mediaContextService.repeat(); }
  public onPlayPause() { this.mediaContextService.playOrPause(); }
}
