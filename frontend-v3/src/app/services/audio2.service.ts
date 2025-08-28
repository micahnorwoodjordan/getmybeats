import { Injectable, signal, WritableSignal, effect } from '@angular/core';
import { duration as momentDuration } from 'moment';
import { HttpEventType } from '@angular/common/http';

import { ApiService } from './api.service';
import { CryptoService } from './crypto.service';

import { MediaContextElement } from '../interfaces/MediaContextElement';

import { generateAudioRequestGUID } from '../utilities';


@Injectable({ providedIn: 'root' })
export class Audio2Service {
    //----------------------------------------------------------------------------------------------------
    constructor(private apiService: ApiService, private cryptoService: CryptoService) { }
    private audioContext = new AudioContext();
    private gainNode: GainNode | null = null;
    private buffer: AudioBuffer | null = null;
    private source: AudioBufferSourceNode | null = null;
    private startTime = 0;   // when playback started
    private pauseTime = 0;   // accumulated paused offset
    private isPlaying = false;
    private isLoading: boolean = false;
    private title: string = 'loading title...';
    private volume: number = 1;
    private downloadProgress: number = 0;
    public audioFetchCycle: WritableSignal<number> = signal(0);
    public playbackComplete: WritableSignal<boolean> = signal(false);
    //----------------------------------------------------------------------------------------------------
    public getDuration(): number { return this.buffer ? this.buffer.duration : 0; }
    public getTitle() { return this.title; }
    public getVolume() { return this.volume; }
    public getIsLoading() { return this.isLoading; }
    public getDownloadProgress() { return this.downloadProgress; }

    public getCurrentTime(): number {
        if (!this.buffer) return 0;
        return this.source ? this.audioContext.currentTime - this.startTime : this.pauseTime;
    }
    //----------------------------------------------------------------------------------------------------
    private setTitle(newValue: string) { this.title = newValue; }
    private setDownloadProgress(newValue: number) { this.downloadProgress = newValue; }
    private setIsLoading(newValue: boolean) { this.isLoading = newValue; }
    private setAudioFetchCycle(newValue: number) { this.audioFetchCycle.set(newValue); }
    private setPlaybackComplete(newValue: boolean) { this.playbackComplete.set(newValue); }
    public setVolume(value: number) { // not a normal setter; for slider to dynamically adjsut volume
        this.volume = value;
        if (this.gainNode) {
            this.gainNode.gain.setValueAtTime(value, this.audioContext.currentTime);
        }
    }
    //----------------------------------------------------------------------------------------------------
    public async loadFromArrayBuffer(arrayBuffer: ArrayBuffer): Promise<void> {
        this.buffer = await this.audioContext.decodeAudioData(arrayBuffer);
        this.setIsLoading(false);
        this.setPlaybackComplete(true);
    }

    public async onNext(mediaContext: MediaContextElement[], audioIndex: number){
        this.loadMediaContextElement(mediaContext, audioIndex);
    }

    public async onPrevious(mediaContext: MediaContextElement[], audioIndex: number){
        this.loadMediaContextElement(mediaContext, audioIndex);
    }

    public async loadMediaContextElement(mediaContext: MediaContextElement[], audioIndex: number) {
        this.setPlaybackComplete(false);
        let audioFilenameHash;
        if (mediaContext.length > 0) {
            let currentMediaContextElement: MediaContextElement = mediaContext[audioIndex];
            this.setIsLoading(true);
            this.setDownloadProgress(0);
            audioFilenameHash = mediaContext[audioIndex].audio_filename_hash;
            this.setTitle(currentMediaContextElement.title);
            this.apiService.downloadAudioTrack(audioFilenameHash, generateAudioRequestGUID()).subscribe(
                async event => {
                    switch (event.type) {
                        case HttpEventType.DownloadProgress:
                            if (event.total !== undefined) {
                                this.setDownloadProgress(Math.round((event.loaded / event.total) * 100));
                                console.log(`getandloadaudiotrack: ${this.downloadProgress}% of data fetched`);
                            }
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
                                this.stop();
                                this.loadFromArrayBuffer(decrypted);
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
            );
        }
    }
    //----------------------------------------------------------------------------------------------------

    play() {
        if (!this.buffer) return;
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
            this.source = null;
            this.pauseTime = 0;
            this.setAudioFetchCycle(this.audioFetchCycle() + 1);
        };
    }

    pause() {
        if (!this.isPlaying || !this.source) return;

        this.source.onended = null;
        this.source.stop();
        this.pauseTime = this.audioContext.currentTime - this.startTime;
        this.isPlaying = false;
        this.source = null;
    }

    stop() {
        this.source?.disconnect();
        this.source = null;
        this.pauseTime = 0;
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
    //----------------------------------------------------------------------------------------------------
}
