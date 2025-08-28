import { Injectable } from '@angular/core';
import { duration as momentDuration } from 'moment';
import { HttpEventType } from '@angular/common/http';

import { ApiService } from './api.service';
import { CryptoService } from './crypto.service';
import { ArtworkService } from './artwork.service';

import { MediaContextElement } from '../interfaces/MediaContextElement';

import { generateAudioRequestGUID } from '../utilities';


@Injectable({ providedIn: 'root' })
export class Audio2Service {
    constructor(private apiService: ApiService, private cryptoService: CryptoService) {}
    private audioCtx = new AudioContext();
    private buffer: AudioBuffer | null = null;
    private source: AudioBufferSourceNode | null = null;

    private startTime = 0;   // when playback started
    private pauseTime = 0;   // accumulated paused offset
    private isPlaying = false;

    async loadFromArrayBuffer(arrayBuffer: ArrayBuffer): Promise<void> {
        this.buffer = await this.audioCtx.decodeAudioData(arrayBuffer);
    }

    play() {
        if (!this.buffer) return;

        this.source = this.audioCtx.createBufferSource();
        this.source.buffer = this.buffer;
        this.source.connect(this.audioCtx.destination);

        const offset = this.pauseTime;
        this.startTime = this.audioCtx.currentTime - offset;

        this.source.start(0, offset);
        this.isPlaying = true;

        this.source.onended = () => {
            this.source = null;
            this.pauseTime = 0;
        };
    }

    pause() {
        if (!this.isPlaying || !this.source) return;

        this.source.onended = null;
        this.source.stop();
        this.pauseTime = this.audioCtx.currentTime - this.startTime;
        this.isPlaying = false;
        this.source = null;
    }

    seek(seconds: number) {
        if (!this.buffer) return;
        if (seconds < 0) seconds = 0;
        if (seconds > this.buffer.duration) seconds = this.buffer.duration;

        this.pauseTime = Math.max(0, Math.min(seconds, this.buffer.duration));

        if (this.isPlaying) {
            if (this.source) {
                this.source.onended = null; // prevent reset
                this.source.stop();
                this.source = null;
            }
            this.play(); // start from new offset
        }
    }

    getDuration(): number { return this.buffer ? this.buffer.duration : 0; }

    getCurrentTime(): number {
        if (!this.buffer) return 0;
        return this.source ? this.audioCtx.currentTime - this.startTime : this.pauseTime;
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
            audioFilenameHash = mediaContext[1].audio_filename_hash;
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
    }

    public async getContextSynchronously() { return await this.apiService.getMediaContextAsPromise(); }
}
