import { Injectable, signal, WritableSignal, effect } from '@angular/core';
import { HttpEventType } from '@angular/common/http';

import { ApiService } from './api.service';
import { CryptoService } from './crypto.service';

import { MediaContextElement } from '../interfaces/MediaContextElement';

@Injectable({ providedIn: 'root' })
export class AudioService {
    //----------------------------------------------------------------------------------------------------
    constructor(private apiService: ApiService, private cryptoService: CryptoService) { }
    private audioContext: AudioContext | null = null;
    private gainNode: GainNode | null = null;
    private buffer: AudioBuffer | null = null;
    private source: AudioBufferSourceNode | null = null;
    private startTime = 0;   // when playback started
    private pauseTime = 0;   // accumulated paused offset
    private isPlaying = false;
    private isLoading: boolean = false;
    private title: string = 'loading title...';
    private author: string = 'loading author...';
    private volume: number = 1;
    private downloadProgress: number = 0;
    public audioFetchCycle: WritableSignal<number> = signal(0);
    //----------------------------------------------------------------------------------------------------
    public getDuration(): number { return this.buffer ? this.buffer.duration : 0; }
    public getTitle() { return this.title; }
    public getAuthor() { return this.author; }
    public getVolume() { return this.volume; }
    public getIsLoading() { return this.isLoading; }
    public getIsPlaying() { return this.isPlaying; }
    public getDownloadProgress() { return this.downloadProgress; }

    public getCurrentTime(): number {
        if (!this.buffer) return 0;

        if (this.audioContext === null) return 0;

        return this.source ? this.audioContext.currentTime - this.startTime : this.pauseTime;
    }
    //----------------------------------------------------------------------------------------------------
    private setTitle(newValue: string) { this.title = newValue; }
    private setAuthor(newValue: string) { this.author = newValue; }
    private setDownloadProgress(newValue: number) { this.downloadProgress = newValue; }
    private setIsLoading(newValue: boolean) { this.isLoading = newValue; }
    private setAudioFetchCycle(newValue: number) { this.audioFetchCycle.set(newValue); }
    public setVolume(value: number) { // not a normal setter; for slider to dynamically adjsut volume
        this.volume = value;
        if (this.gainNode && this.audioContext) {
            this.gainNode.gain.setValueAtTime(value, this.audioContext.currentTime);
        }
    }
    //----------------------------------------------------------------------------------------------------

    public initAudioContext(): void {
        if (!this.audioContext) {
            this.audioContext = new AudioContext();
        }
    }

    public async loadFromArrayBuffer(arrayBuffer: ArrayBuffer, autoplay: boolean = false): Promise<void> {

        if (this.audioContext === null) return;

        this.buffer = await this.audioContext.decodeAudioData(arrayBuffer);
        this.setDownloadProgress(0);
        this.setIsLoading(false);
        if (autoplay) {
            await this.play();
        }
    }

    public async onNext(
        mediaContext: MediaContextElement[],
        audioIndex: number,
        autoplay: boolean = false,
        key: Uint8Array,
        requestGUID: string
    ){
        this.loadMediaContextElement(mediaContext, audioIndex, autoplay, key, requestGUID);
    }

    public async onPrevious(
        mediaContext: MediaContextElement[],
        audioIndex: number,
        key: Uint8Array,
        requestGUID: string
    ){
        this.loadMediaContextElement(mediaContext, audioIndex, false, key, requestGUID);
    }

    public async loadMediaContextElement(
        mediaContext: MediaContextElement[],
        audioIndex: number,
        autoplay: boolean = false,
        key: Uint8Array,
        requestGUID: string
    ) {
        console.log('BEGIN getandloadaudiotrack');

        if (this.isLoading) {
            console.warn("AudioService.loadMediaContextElement returning early because this call was made in the middle of another load call (previous call has not finished)");
            return;  // prevent user from accidentally doubling up loads (causing multiple simultaneous playbacks)
        }

        let audioFilenameHash;
        this.initAudioContext();

        if (mediaContext.length > 0) {
            let currentMediaContextElement: MediaContextElement = mediaContext[audioIndex];
            this.setDownloadProgress(0);
            this.setIsLoading(true);
            audioFilenameHash = mediaContext[audioIndex].audio_filename_hash;
            this.setTitle(currentMediaContextElement.title);
            this.setAuthor(currentMediaContextElement.author);

            this.apiService.downloadAudioTrack(audioFilenameHash, requestGUID).subscribe(
                async event => {
                    switch (event.type) {
                        case HttpEventType.DownloadProgress:
                            if (event.total !== undefined) {
                                this.setDownloadProgress(Math.round((event.loaded / event.total) * 100));

                                if (this.downloadProgress % 20 == 0) {  // arbitrarily only report in increments of 20
                                    console.log(`REPORT getandloadaudiotrack: ${this.downloadProgress}% complete`);
                                }
                                
                            }
                            break;
                        case HttpEventType.Response:
                            if (event.status == 200) {
                                if (event.body !== undefined && event.body !== null) {
                                    let encrypted = await event.body.arrayBuffer();
                                    let decrypted = await this.cryptoService.decryptAudioData(encrypted, key);
                                    this.stop();
                                    this.loadFromArrayBuffer(decrypted, autoplay);
                                    this.setDownloadProgress(0);
                                    this.setIsLoading(false);
                                    console.log('END getandloadaudiotrack');
                                }
                            } else {
                                console.error('ERROR getandloadaudiotrack');
                            }
                            break;

                        default:
                            break;
                    }
                },
                error => {
                    console.error(`ERROR getandloadaudiotrack: ${error.toString()}`);

                }
            );
        }
    }
    //----------------------------------------------------------------------------------------------------

    async play() {
        if (!this.buffer) return;

        if (!this.audioContext) {
            this.audioContext = new AudioContext();
        }

        if (this.audioContext.state === 'suspended') {
            await this.audioContext.resume();
        }

        this.cleanUpSource();  // prevent playback stream overlap

        if (this.pauseTime >= this.buffer.duration) {
            this.pauseTime = 0;
        }

        const offset = this.pauseTime;

        this.source = this.audioContext.createBufferSource();
        this.source.buffer = this.buffer;

        this.gainNode = this.audioContext.createGain();
        this.source.connect(this.gainNode);
        this.gainNode.connect(this.audioContext.destination);

        this.startTime = this.audioContext.currentTime - offset;
        this.source.start(0, offset);

        this.isPlaying = true;

        this.source.onended = () => {
            if (!this.isPlaying) return;  // avoid race with pause/stop

            this.cleanUpSource();
            this.pauseTime = 0;
            this.isPlaying = false;

            console.log('AudioService buffer source ended. promoting new fetch cycle');
            this.setAudioFetchCycle(this.audioFetchCycle() + 1);
        };
    }

    pause() {
        if (!this.isPlaying || !this.source) return;

        if (this.audioContext === null) return;

        this.cleanUpSource();
        this.pauseTime = this.audioContext.currentTime - this.startTime;
        this.isPlaying = false;
    }

    stop() {
        this.cleanUpSource();
        this.pauseTime = 0;
        this.isPlaying = false;
    }

    async seek(seconds: number) {
        if (!this.buffer) return;

        // Clamp to valid range
        seconds = Math.max(0, Math.min(seconds, this.buffer.duration));
        this.pauseTime = seconds;

        if (this.isPlaying) {
            this.cleanUpSource();
            await this.play(); // restart from new offset
        }
    }
    //----------------------------------------------------------------------------------------------------
    private cleanUpSource() {
        if (this.source) {
            this.source.onended = null;
            try {
                this.source.stop();
            } catch (_) {
                // ignore if already stopped
            }
            this.source.disconnect();
            this.source = null;
        }
    }
}
