import { v7 } from 'uuid';
import { Injectable, signal } from '@angular/core';

import { ApiService } from './api.service';
import { MediaContextElement } from '../interfaces/MediaContextElement';
import { PlaybackService } from './playback.service';
import { AudioRetrievalInstruction } from '../enums/AudioRetrievalInstruction';
import { RetrievalService } from './retrieval.service';
import { CryptographyService } from './cryptography.service';
import { AudioDownloadEvent } from '../types/AudioDownloadEvent';



@Injectable({
  providedIn: 'root',
})
export class MediaContextService {
  constructor(
    private apiService: ApiService,
    private playbackService: PlaybackService,
    private retrievalService: RetrievalService,
    private cryptographyService: CryptographyService
  ) { }

  currentIndex = signal(0);
  repeatEnabled = signal(false);
  shuffleEnabled = signal(false);
  isLoading = signal(true);
  mediaContext = signal<MediaContextElement[]>([]);

  public audioTrack: ArrayBuffer | null = null;
  private setAudioTrack(newAudioTrack: ArrayBuffer) { this.audioTrack = newAudioTrack; }
  public async refreshMediaContext() { this.mediaContext.set(await this.apiService.getMediaContext()); }
  async next() {
    await this.refreshMediaContext();

    if (this.currentIndex() < this.mediaContext().length - 1) {
      this.currentIndex.update((value) => value + 1);
    } else {
      this.currentIndex.set(0);
    }

    this.downloadAudioTrack(this.currentIndex());
  }

  async back() {
    await this.refreshMediaContext();

    if (this.currentIndex() > 0) {
      this.currentIndex.update((value) => value - 1);
    } else {
      this.currentIndex.set(this.mediaContext().length - 1);
    }

    this.downloadAudioTrack(this.currentIndex());
  }

  shuffle() { this.shuffleEnabled.set(!this.shuffleEnabled()); }
  repeat() { this.repeatEnabled.set(!this.repeatEnabled()); }

  async playOrPause() {
    if (this.playbackService.isPlaying()) {
      this.playbackService.pause();
    } else {
      await this.playbackService.play();
    }
  }

  public async downloadAudioTrack(index: number, autoplay: boolean = true) {
    let element: MediaContextElement = this.mediaContext()[index];
    let requestGUID = v7();
    let encyrptionKey = await this.cryptographyService.getNewEncryptionKey();
    let response = await this.apiService.postNewEncryptionKey(encyrptionKey, requestGUID);

    this.retrievalService.retrieveAudioFromServer$(element, requestGUID, encyrptionKey).subscribe({
        next: async (event: AudioDownloadEvent) => {

          switch (event.type) {
            case 'loading':
              this.isLoading.set(true);
              break;

            case 'progress':
              // this.downloadProgress = event.percent;
              break;

            case 'complete':
              this.setAudioTrack(event.data);

              if (this.audioTrack instanceof ArrayBuffer) {
                await this.playbackService.next(this.audioTrack, autoplay);
              }
              break;

            case 'done':
              this.isLoading.set(false);
            //   this.downloadProgress = 0;
              break;

            case 'error':
              console.error(event.error);
              break;
          }
        }
    });
  }
}
