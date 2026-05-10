import { v7 } from 'uuid';

import { Injectable, signal } from '@angular/core';
import { HttpEventType } from '@angular/common/http';

import { ApiService } from './api.service';

import { MediaContextElement } from '../interfaces/MediaContextElement';
import { CryptographyService } from './cryptography.service';
import { PlaybackService } from './playback.service';
import { ArtworkService } from './artwork.service';

@Injectable({ providedIn: 'root' })
export class RetrievalService {
  constructor(
    private apiService: ApiService,
    private cryptographyService: CryptographyService,
    private playbackService: PlaybackService,
    private artworkService: ArtworkService
  ) { }

  isLoading = signal(false);
  downloadProgress = signal(0);
  title = signal('loading...');
  author = signal('loading...');

  public async downloadServerMedia(element: MediaContextElement, autoplay: boolean = true): Promise<void> {
    console.log('BEGIN downloadServerMedia');
    let requestGUID = v7();
    let encyrptionKey = await this.cryptographyService.getNewEncryptionKey();
    let response = await this.apiService.postNewEncryptionKey(encyrptionKey, requestGUID);

    this.title.set(element.title);
    this.author.set(element.author);
    this.isLoading.set(true);
    this.downloadProgress.set(0);

    this.apiService.downloadAudioTrack(element.audio_filename_hash, requestGUID).subscribe({
      next: async (event) => {
        switch (event.type) {
          case HttpEventType.DownloadProgress:
            if (event.total !== undefined) {
              let percent = Math.round((event.loaded / event.total) * 100);
              this.downloadProgress.set(percent);
            }
            break;

          case HttpEventType.Response:
            if (event.status === 200 && event.body) {
              let encrypted = await event.body.arrayBuffer();
              let decrypted = await this.cryptographyService.decryptAudioData(encrypted, encyrptionKey);
              await this.playbackService.loadTrack(decrypted, autoplay);
            }
            break;
        }
      },
      error: (error) => {
        console.error(`ERROR downloadServerMedia: ${error.toString()}`);
        this.isLoading.set(false);
      },

      complete: () => {
        this.isLoading.set(false);
        console.log('END downloadServerMedia');
      },
    });

    this.artworkService.loadArtwork(element);
  }
}
