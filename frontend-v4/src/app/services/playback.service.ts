import { v7 } from 'uuid';
import { Injectable } from '@angular/core';
import { ApiService } from './api.service';

import { AudioRetrievalInstruction } from '../enums/AudioRetrievalInstruction';

import { AudioDownloadEvent } from '../types/AudioDownloadEvent';
import { MediaContextElement } from '../interfaces/MediaContextElement';
import { CryptographyService } from './cryptography.service';
import { RetrievalService } from './retrieval.service';
import { MediaContextService } from './mediaContext.service';

@Injectable({ providedIn: 'root' })
export class PlaybackService {
  constructor(
    private mediaContextService: MediaContextService,
    private retrievalService: RetrievalService,
    private cryptographyService: CryptographyService,
    private apiService: ApiService
) {}

  public audioTrack: ArrayBuffer | null = null;

  private setAudioTrack(newAudioTrack: ArrayBuffer) { this.audioTrack = newAudioTrack; }
//   public getAudioTrack(): ArrayBuffer | null { return this.audioTrack; }  // TODO: also symbol clash

  // TODO: also needs to initiate playback
  public async getAudioTrack(instruction: AudioRetrievalInstruction) {
    await this.mediaContextService.refreshMediaContext();

    if (instruction === AudioRetrievalInstruction.GET_NEXT) {
        this.mediaContextService.next();
    } else if (instruction === AudioRetrievalInstruction.GET_PREVIOUS) {
        this.mediaContextService.back();
    }

    let mediaContext: MediaContextElement[] = this.mediaContextService.getMediaContext();
    let currentIndex = this.mediaContextService.getCurrentIndex();
    let element: MediaContextElement = mediaContext[currentIndex];
    let requestGUID = v7();
    let encyrptionKey = await this.cryptographyService.getNewEncryptionKey();
    let response = await this.apiService.postNewEncryptionKey(encyrptionKey, requestGUID);

    this.retrievalService.retrieveAudioFromServer$(element, requestGUID, encyrptionKey).subscribe({
        next: (event: AudioDownloadEvent) => {
            switch (event.type) {
            case 'loading':
                // this.isLoading = true;
                break;

            case 'progress':
                // this.downloadProgress = event.percent;
                break;

            case 'complete':
                this.setAudioTrack(event.data);
                // this.loadFromArrayBuffer(event.data, autoplay);
                break;

            case 'done':
                // this.isLoading = false;
                // this.downloadProgress = 0;
                break;

            case 'error':
                console.error(event.error);
                break;
            }
        }
    });
  }
}
