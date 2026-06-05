import { Component, OnInit } from '@angular/core';
import { NgIf } from '@angular/common';
import { PrimaryComponent } from '../controls/primary/primary.component';
import { SecondaryComponent } from '../controls/secondary/secondary.component';
import { ProgressComponent } from '../controls/progress/progress.component';
import { DetailsComponent } from '../details/details.component';
import { TrackMediaComponent } from '../trackmedia/trackmedia.component';

import { MediaContextService } from '../../services/mediaContext.service';
import { PlaybackService } from '../../services/playback.service';
import { RetrievalService } from '../../services/retrieval.service';
import { ArtworkService } from '../../services/artwork.service';
import { BackgroundImageComponent } from '../background/background-image-component/backgroundimage.component';
import { HeaderComponent } from '../header/header.component';

import { supportsProgrammaticVolume } from '../../utilities';

@Component({
  selector: 'app-player',
  imports: [
    PrimaryComponent,
    SecondaryComponent,
    ProgressComponent,
    DetailsComponent,
    TrackMediaComponent,
    BackgroundImageComponent,
    HeaderComponent,
    NgIf

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

  public probablyiOSDevice: boolean = !supportsProgrammaticVolume();

  async ngOnInit() {
    await this.mediaContextService.refreshMediaContext();
    let index = this.mediaContextService.currentIndex();
    await this.retrievalService.downloadServerMedia(this.mediaContextService.mediaContext()[index], false);
  }

  public onNext() { this.mediaContextService.next() }
  public onBack() { this.mediaContextService.back() }
  public onShuffle() { this.mediaContextService.shuffle(); }
  public onRepeat() { this.mediaContextService.repeat(); }
  public async onPlayPause() { await this.playbackService.togglePlayback(); }
  public async onSeek(seconds: number) { await this.playbackService.seek(seconds); }
}
