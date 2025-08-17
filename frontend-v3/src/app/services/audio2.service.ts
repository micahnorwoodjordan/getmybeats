import { Injectable, signal } from '@angular/core';

import { HttpEventType } from '@angular/common/http';

import { ApiService } from './api.service';
import { CryptoService } from './crypto.service';
import { ArtworkService } from './artwork.service';

import { MediaContextElement } from '../interfaces/MediaContextElement';

import { generateAudioRequestGUID } from '../utilities';


@Injectable({ providedIn: 'root' })
export class Audio2Service {
constructor(
    private readonly apiService: ApiService,
    private readonly artworkService: ArtworkService,
    private readonly cryptoService: CryptoService
) {}

  private audioContext!: AudioContext;
  private sourceNode?: AudioBufferSourceNode;
  private buffer!: AudioBuffer;
  private startTime = 0;
  private pausedAt = 0;

  public mediaContext: MediaContextElement[] | undefined = [];  // placeholder for `context` attribute to avoid compilation errors during refactor

  isPlaying = signal(false);
  currentTime = signal(0);
  duration = 0;

  private rafId?: number;

  private ensureContext() {
    if (!this.audioContext) {
      this.audioContext = new AudioContext();
    }
  }

  async loadFromArrayBuffer(arrBuf: ArrayBuffer) {
    this.ensureContext();
    await this.decodeBuffer(arrBuf);
  }

  private async decodeBuffer(arrBuf: ArrayBuffer) {
    this.buffer = await this.audioContext.decodeAudioData(arrBuf);
    this.duration = this.buffer.duration;
  }

  play(offset = this.pausedAt) {
    if (!this.buffer) return;

    this.stop();

    this.sourceNode = this.audioContext.createBufferSource();
    this.sourceNode.buffer = this.buffer;
    this.sourceNode.connect(this.audioContext.destination);
    this.sourceNode.start(0, offset);

    this.startTime = this.audioContext.currentTime - offset;
    this.isPlaying.set(true);

    this.trackProgress();
  }

  pause() {
    if (!this.isPlaying()) return;
    this.pausedAt = this.audioContext.currentTime - this.startTime;
    this.stop();
  }

  seek(time: number) {
    this.pausedAt = time;
    this.currentTime.set(time);
    if (this.isPlaying()) {
      this.play(time);
    }
  }

  stop() {
    this.isPlaying.set(false);
    if (this.sourceNode) {
      this.sourceNode.stop();
      this.sourceNode.disconnect();
      this.sourceNode = undefined;
    }
    if (this.rafId) cancelAnimationFrame(this.rafId);
  }

  private trackProgress() {
    const update = () => {
      if (this.isPlaying()) {
        const elapsed = this.audioContext.currentTime - this.startTime;
        this.currentTime.set(Math.min(elapsed, this.duration));
        this.rafId = requestAnimationFrame(update);
      }
    };
    update();
  }

  async destroy() {
    this.stop();
    if (this.audioContext) {
      await this.audioContext.close();
    }
  }

 async getDecryptedAudio() {
    // const resp = await fetch('assets/test.mp3');
    let audioFilenameHash;
    let mediaContext = await this.getContextSynchronously();
    if (mediaContext) {
        // this.setAudioContext(mediaContext);
        // this.setNumberOfTracks(mediaContext.length);
        // this.setLoading(true);
        // this.setDownloadProgress(0);
        audioFilenameHash = mediaContext[0].audio_filename_hash;
        // this.setAudioTitle(audioContext[newSelectedAudioIndex].title);
        // this.setSelectedAudioIndex(newSelectedAudioIndex);
        this.apiService.downloadAudioTrack(audioFilenameHash, generateAudioRequestGUID()).subscribe(
            async event => {
                switch (event.type) {
                case HttpEventType.DownloadProgress:
                    // if (event.total !== undefined) {
                    //     this.setDownloadProgress(Math.round((event.loaded / event.total) * 100));
                    //     console.log(`getandloadaudiotrack: ${this.downloadProgress}% of data fetched`);
                    // }
                    break;
                case HttpEventType.Response:
                    console.log(`getandloadaudiotrack: received server response ${event.status}`);
                    if (event.status == 200) {
                    if (event.body !== undefined && event.body !== null) {
                        let encrypted = await event.body.arrayBuffer();
                        let decrypted = await this.cryptoService.decryptAudioData(encrypted, new Uint8Array([
                        197, 161, 34, 196, 208, 241, 221, 120,
                        26, 52, 83, 178, 189, 208, 70, 253,
                        80, 178, 134, 158, 29, 129, 199, 202,
                        188, 187, 60, 249, 22, 254, 247, 149
                        ]));
                        // this.setLoading(false);
                        // this.updateAudioOndurationchange();
                        // if (this.autoplayOnIndexChange) {
                        this.loadFromArrayBuffer(decrypted);
                        // }
                    }
                    } else {
                    console.log('getandloadaudiotrack: ERROR fetching audio');
                    }
                    break;
                default:
                    console.log('getandloadaudiotrack: no response from server yet');
                }
            },
            error => {
                console.log(`getAndLoadAudioTrack ERROR: ${error.toString()}`);
            }
        )
    }
    // await this.loadAudioArtworkImage();
    // return resp.arrayBuffer();
  }

  public async getContextSynchronously() { return await this.apiService.getMediaContextAsPromise(); }
}
