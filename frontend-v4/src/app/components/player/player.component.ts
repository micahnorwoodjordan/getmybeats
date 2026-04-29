import { Component } from '@angular/core';
import { PrimaryComponent } from '../controls/primary/primary.component';
import { SecondaryComponent } from '../controls/secondary/secondary.component';
import { ProgressComponent } from '../controls/progress/progress.component';
import { DetailsComponent } from '../details/details.component';
import { TrackMediaComponent } from '../trackmedia/trackmedia.component';

import { AudioRetrievalInstruction } from '../../enums/AudioRetrievalInstruction';

import { MediaContextService } from '../../services/mediaContext.service';
import { PlaybackService } from '../../services/playback.service';


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

  constructor(private mediaContextService: MediaContextService, private playbackService: PlaybackService) { }

  public onNext() { this.playbackService.getAudioTrack(AudioRetrievalInstruction.GET_NEXT); }
  public onBack() { this.playbackService.getAudioTrack(AudioRetrievalInstruction.GET_PREVIOUS); }
  public onShuffle() { this.mediaContextService.shuffle(); }
  public onRepeat() { this.mediaContextService.repeat(); }
  public onPlayPause() { this.mediaContextService.playOrPause(); }
  public onSeek() {  }// TODO
}
