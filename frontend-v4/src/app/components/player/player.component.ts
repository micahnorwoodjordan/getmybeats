import { Component, OnInit } from '@angular/core';
import { PrimaryComponent } from '../controls/primary/primary.component';
import { SecondaryComponent } from '../controls/secondary/secondary.component';
import { ProgressComponent } from '../controls/progress/progress.component';
import { DetailsComponent } from '../details/details.component';
import { TrackMediaComponent } from '../trackmedia/trackmedia.component';

import { MediaContextService } from '../../services/mediaContext.service';
import { PlaybackService } from '../../services/playback.service';
import { RetrievalService } from '../../services/retrieval.service';
import { ArtworkService } from '../../services/artwork.service';

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
export class PlayerComponent implements OnInit {
  constructor(
    public mediaContextService: MediaContextService,
    public playbackService: PlaybackService,
    public retrievalService: RetrievalService,
    public artworkService: ArtworkService
  ) { }

  async ngOnInit() {
    await this.mediaContextService.refreshMediaContext();
    await this.retrievalService.downloadServerMedia(this.mediaContextService.mediaContext()[0], false);
  }

  public onNext() { this.mediaContextService.next() }
  public onBack() { this.mediaContextService.back() }
  public onShuffle() { this.mediaContextService.shuffle(); }
  public onRepeat() { this.mediaContextService.repeat(); }
  public async onPlayPause() { await this.playbackService.togglePlayback(); }
  public async onSeek(seconds: number) { await this.playbackService.seek(seconds); }
}
