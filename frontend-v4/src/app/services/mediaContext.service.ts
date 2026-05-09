import { v7 } from 'uuid';

import { Injectable } from '@angular/core';

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

  public mediaContext: MediaContextElement[] = [];
  private currentIndex: number = 0;
  private repeatEnabled: boolean = false;
  private shuffleEnabled: boolean = false;
  private isPlaying: boolean = false;
  private iSLoading: boolean = true;
  public audioTrack: ArrayBuffer | null = null;

  private setAudioTrack(newAudioTrack: ArrayBuffer) { this.audioTrack = newAudioTrack; }

  private getIsLoading(): boolean { return this.iSLoading; }
  private setLoading(newValue: boolean) { this.iSLoading = newValue; }
  
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
    this.refreshMediaContext();

    if (this.currentIndex < this.mediaContext.length - 1) {
      this.setCurrentIndex(this.currentIndex + 1);
    } else {
      this.setCurrentIndex(0);
    }

    this.downloadAudioTrack(this.currentIndex);
  }

  back() {
    this.refreshMediaContext();

    if (this.currentIndex > 0) {
      this.setCurrentIndex(this.currentIndex - 1);
    } else {
      this.setCurrentIndex(this.mediaContext.length - 1);
    }

    this.downloadAudioTrack(this.currentIndex);
  }

  shuffle() { this.setShuffleEnabled(!this.shuffleEnabled); }
  repeat() { this.setRepeatEnabled(!this.repeatEnabled); }

  async playOrPause() {
    if (this.isPlaying) {
      this.playbackService.pause();
    } else {
      await this.playbackService.play();
    }
    this.setIsPlaying(!this.isPlaying);
  }

  public async downloadAudioTrack(index: number, autoplay: boolean = true) {
    let element: MediaContextElement = this.mediaContext[index];
    let requestGUID = v7();
    let encyrptionKey = await this.cryptographyService.getNewEncryptionKey();
    let response = await this.apiService.postNewEncryptionKey(encyrptionKey, requestGUID);

    this.retrievalService.retrieveAudioFromServer$(element, requestGUID, encyrptionKey).subscribe({
        next: async (event: AudioDownloadEvent) => {
          this.setLoading(true);

          switch (event.type) {
            case 'loading':
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
              this.setLoading(false);
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
