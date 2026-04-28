import { Injectable } from '@angular/core';

import { ApiService } from './api.service';
import { MediaContextElement } from '../interfaces/MediaContextElement';

@Injectable({
  providedIn: 'root',
})
export class MediaContextService {
  constructor(private apiService: ApiService) {}

  public mediaContext: MediaContextElement[] = [];
  private currentIndex: number = 0;
  private repeatEnabled: boolean = false;
  private shuffleEnabled: boolean = false;
  private isPlaying: boolean = false;
  
  private setIsPlaying(newValue: boolean) { this.isPlaying = newValue; }
  private getIsPlaying(): boolean { return this.isPlaying; }

  private setRepeatEnabled(newValue: boolean) { this.repeatEnabled = newValue; }
  private getRepeatEnabled(): boolean { return this.repeatEnabled; }

  private setShuffleEnabled(newValue: boolean) { this.shuffleEnabled = newValue; }
  private getShuffleEnabled(): boolean { return this.shuffleEnabled; }

  private setCurrentIndex(newIndex: number) { this.currentIndex = newIndex; }
  public getCurrentIndex(): number { return this.currentIndex; }

  public setMediaContext(newContext: MediaContextElement[]) { this.mediaContext = newContext; }
  public getMediaContext(): MediaContextElement[] { return this.mediaContext; }

  public async refreshMediaContext() { this.setMediaContext(await this.apiService.getMediaContext()); }

  next() {
    if (this.currentIndex < this.mediaContext.length - 1) {
      this.setCurrentIndex(this.currentIndex + 1);
    } else {
      this.setCurrentIndex(0);
    }
  }

  back() {
    if (this.currentIndex > 0) {
      this.setCurrentIndex(this.currentIndex - 1);
    } else {
      this.setCurrentIndex(this.mediaContext.length - 1);
    }
  }

  shuffle() { this.setShuffleEnabled(!this.shuffleEnabled); }
  repeat() { this.setRepeatEnabled(!this.repeatEnabled); }
  playOrPause() { this.setIsPlaying(!this.isPlaying); }
}
