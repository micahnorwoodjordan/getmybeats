import { Injectable, signal } from '@angular/core';

import { ApiService } from './api.service';
import { MediaContextElement } from '../interfaces/MediaContextElement';
import { PlaybackService } from './playback.service';
import { RetrievalService } from './retrieval.service';

import { getRandomInteger } from '../utilities';


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

  public async next() {
    if (this.repeatEnabled()) {
      this.playbackService.restartSong();
      return;
    }

    // explicitly fetch context here to avoid unnecessary api call if repeatEnabled
    // while also fetching an accurate context before context traversal for shuffle operation
    await this.refreshMediaContext();

    if (this.shuffleEnabled()) {
      let proposedRandomIndex: number = getRandomInteger(0, this.mediaContext().length);  // result COULD be the same; do not exit until it is different

      while (this.currentIndex() === proposedRandomIndex) {
        console.log(`current index ${this.currentIndex()} clashed with proposed index ${proposedRandomIndex} -- looping`);
        proposedRandomIndex = getRandomInteger(0, this.mediaContext().length);
      }

      this.currentIndex.set(proposedRandomIndex);
    } else {
        if (this.currentIndex() < this.mediaContext().length - 1) {
          this.currentIndex.update((value) => value + 1);
        } else {
          this.currentIndex.set(0);
        }
    }

    this.retrievalService.downloadServerMedia(this.mediaContext()[this.currentIndex()], true);
  }

  public async back() {
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

  // NOTE: `next()` is more thank likely goign to fire sometime after this shuffle operation
  // `next()` increments the currentIndex by 1
  // this means that TECHNICALLY SPEAKING 🤓👆 the true shuffled value will never be meaningfully seen by the user
  // since the mediacontext index which informs the next audio download cycle will actually be <random index> + 1
 
  // this same logic applies for the `back()` operation
  public shuffle() {
    this.shuffleEnabled.set(!this.shuffleEnabled());

    if (this.shuffleEnabled()) {
      this.repeatEnabled.set(false);
    }
  }

  public repeat() {
    this.repeatEnabled.set(!this.repeatEnabled());

    if (this.repeatEnabled()) {
      this.shuffleEnabled.set(false);
    }
  }
}
