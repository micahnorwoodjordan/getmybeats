import { Injectable, signal } from '@angular/core';

import { ApiService } from './api.service';
import { MediaContextElement } from '../interfaces/MediaContextElement';
import { PlaybackService } from './playback.service';
import { RetrievalService } from './retrieval.service';


@Injectable({
  providedIn: 'root',
})
export class MediaContextService {
  constructor(private apiService: ApiService, private playbackService: PlaybackService, private retrievalService: RetrievalService) { }

  currentIndex = signal(0);
  repeatEnabled = signal(false);
  shuffleEnabled = signal(false);
  isLoading = signal(true);
  mediaContext = signal<MediaContextElement[]>([]);

  public async refreshMediaContext() { this.mediaContext.set(await this.apiService.getMediaContext()); }
  async next() {
    if (this.repeatEnabled()) {
      this.playbackService.restartSong();
      return;
    }
 
    await this.refreshMediaContext();

    if (this.currentIndex() < this.mediaContext().length - 1) {
      this.currentIndex.update((value) => value + 1);
    } else {
      this.currentIndex.set(0);
    }

    this.retrievalService.downloadServerMedia(this.mediaContext()[this.currentIndex()], true);
  }

  async back() {
    if (this.repeatEnabled()) {
      this.playbackService.restartSong();
      return;
    }

    await this.refreshMediaContext();

    if (this.currentIndex() > 0) {
      this.currentIndex.update((value) => value - 1);
    } else {
      this.currentIndex.set(this.mediaContext().length - 1);
    }

    this.retrievalService.downloadServerMedia(this.mediaContext()[this.currentIndex()], true);
  }

  shuffle() {
    this.shuffleEnabled.set(!this.shuffleEnabled());

    if (this.shuffleEnabled()) {
      this.repeatEnabled.set(false);
    }
  }
  repeat() {
    this.repeatEnabled.set(!this.repeatEnabled());

    if (this.repeatEnabled()) {
      this.shuffleEnabled.set(false);
    }
  }
}
