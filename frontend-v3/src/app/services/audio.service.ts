import { Injectable } from '@angular/core';
import { duration as momentDuration } from 'moment';

import { ApiService } from './api.service';
import { MediaContextElement } from '../interfaces/MediaContextElement';
import { generateAudioRequestGUID } from '../utilities';


@Injectable({
  providedIn: 'root'
})

export class AudioService {
  constructor(private apiService: ApiService) { }
  // ----------------------------------------------------------------------------------------------------------------
  private audioTrack: HTMLAudioElement = new Audio();
  public audioArtwork: HTMLImageElement | null = null;
  public numberOfTracks: number = 0;
  public musicLength: string = '0:00';
  public duration: number = 1;
  public currentTime: string = '0:00';
  public sliderValue: number = 0;
  public loading: boolean = false;
  public hasPlaybackError: boolean = false;
  public autoplayOnIndexChange: boolean = false;
  // ----------------------------------------------------------------------------------------------------------------
  // set by player component ------------
  public selectedAudioIndex = 0;
  public title: string = "null";
  public shuffleEnabled: boolean = false;
  public repeatEnabled: boolean = false;
  public context: Array<MediaContextElement> = [];
  public audioContext: MediaContextElement[] | undefined = [];  // placeholder for `context` attribute to avoid compilation errors during refactor
  // ----------------------------------------------------------------------------------------------------------------
  // getters
  public getContext() { return this.context; }
  public getTitle() { return this.title; }
  public getLoading() { return this.loading; }
  public getHasPlaybackError() { return this.hasPlaybackError; }
  public getCurrentTime() { return this.currentTime; }
  public getDuration() { return this.duration; }
  public getMusicLength() { return this.musicLength; }
  public getSliderValue() { return this.sliderValue; }
  public isAudioPaused() { return this.audioTrack.paused; }
  // ----------------------------------------------------------------------------------------------------------------
  // setters
  public setAutoplayOnIndexChange(value: boolean) { this.autoplayOnIndexChange = value; }
  private setLoading(value: boolean) { this.loading = value; }
  private setAudioSrc(src: string) { this.audioTrack.src = src; }
  private setAudioContext(newAudioContext: MediaContextElement[]) { this.audioContext = newAudioContext; }
  private setNumberOfTracks(newNumberOfTracks: number) { this.numberOfTracks = newNumberOfTracks; }
  public setShuffleEnabled(value: boolean) { this.shuffleEnabled = value; this.shuffleEnabled ? this.repeatEnabled = false : null; }
  public setRepeatEnabled(value: boolean) { this.repeatEnabled = value; this.repeatEnabled ? this.shuffleEnabled = false : null; }
  public setCurrentTime(value: number) { this.audioTrack.currentTime = value; }
  public setSelectedAudioIndex(idx: number) { this.selectedAudioIndex = idx; }
  public setAudioTitle(newTitle: string) { this.title = newTitle; }
  // ----------------------------------------------------------------------------------------------------------------
  public async initialize() {  await this.onSelectedAudioIndexChange(this.selectedAudioIndex); }
  public async getContextSynchronously() { return await this.apiService.getMediaContextAsPromise(); }

  private async getObjectURLFromDownload(filenameHash: string): Promise<string> {
    let fileBlob = await this.apiService.downloadAudioTrackAsPromise(filenameHash, generateAudioRequestGUID());
    if (fileBlob) {
      return URL.createObjectURL(fileBlob);
    }
    return '';
  }

  private updateAudioOndurationchange() {
    // https://github.com/locknloll/angular-music-player/blob/main/src/app/app.component.ts#L123
    // the below logic blocks are borrowed from the above github project
    // these blocks are instrumental in getting the audio seeking logic to work correctly
    this.audioTrack.ondurationchange = () => {
      const totalSeconds = Math.floor(this.audioTrack.duration);
      const duration = momentDuration(totalSeconds, 'seconds');
      this.musicLength = duration.seconds() < 10 ?
        `${Math.floor(duration.asMinutes())}:0${duration.seconds()}` :
          `${Math.floor(duration.asMinutes())}:${duration.seconds()}`;
      this.duration = totalSeconds;
    }
  }
// ----------------------------------------------------------------------------------------------------------------
// dynamic methods
  public updateAudioMetadataState() {
    this.audioTrack.ontimeupdate = () => {
      const duration = momentDuration(Math.floor(this.audioTrack.currentTime), 'seconds');
      this.currentTime = duration.seconds() < 10 ? 
      `${Math.floor(duration.asMinutes())}:0${duration.seconds()}`:
        `${Math.floor(duration.asMinutes())}:${duration.seconds()}`;
      this.sliderValue = this.audioTrack.currentTime;
    }

    this.audioTrack.onended = () => { this.loading = true; this.onNextWrapper(); }
    this.audioTrack.onwaiting = () => { console.log('waiting'); this.loading = true; }
    this.audioTrack.onseeking = () => { console.log('seeking'); this.loading = true; }
    this.audioTrack.onloadstart = () => { console.log('onloadstart'); this.loading = true; }
    this.audioTrack.onloadeddata = () => { console.log('onloadstart'); this.loading = false; }
    this.audioTrack.onplay = () => { console.log('onplay'); this.loading = false; }
    this.audioTrack.onseeked = () => { console.log('onseeked'); this.loading = false; }
    this.audioTrack.onplaying = () => { console.log('ready to resume'); this.loading = false; }
    this.audioTrack.onstalled = () => { console.log('onstalled'); this.hasPlaybackError = true; }
    this.audioTrack.onerror = () => { console.log('onerror'); this.hasPlaybackError = true; }
    this.audioTrack.oncanplaythrough = () => { console.log('oncanplaythrough'); this.hasPlaybackError = false; this.loading = false; }
  }
  // ----------------------------------------------------------------------------------------------------------------
  // public core utility methods
  public pauseOnCycleThrough() { this.audioTrack.pause(); }
  public playOnCycleThrough() { this.audioTrack.play(); }
  public playAudioTrack() { this.audioTrack.play(); this.setAutoplayOnIndexChange(true); }
  public pauseAudioTrack() { this.audioTrack.pause(); this.setAutoplayOnIndexChange(false); }
  public async onIndexChangePublic(newIndex: number) { await this.onSelectedAudioIndexChange(newIndex); }

  public async onNextWrapper() {  // wrap so that this can be called from player component without passing args
    if (this.shuffleEnabled) {
      await this.onSongChangeShuffle(this.selectedAudioIndex);
    } else {
      let newIndex: number = this.repeatEnabled ? this.selectedAudioIndex : this.getNextAudioIndex();
      await this.onNext(newIndex);
    }
  }

  public async onPreviousWrapper() {
    let newIndex: number = this.repeatEnabled ? this.selectedAudioIndex : this.getPreviousAudioIndex();
    await this.onPrevious(newIndex);
  }
  // ----------------------------------------------------------------------------------------------------------------
  // private core utility methods
  private async onNext(newIndex: number) { await this.onSelectedAudioIndexChange(newIndex); }
  private async onPrevious(newIndex: number) { await this.onSelectedAudioIndexChange(newIndex); }

  private getNextAudioIndex() {
    let newIndex = this.selectedAudioIndex;
    this.selectedAudioIndex + 1 < this.numberOfTracks ? newIndex += 1 : newIndex = 0;
    return newIndex;
  }

  private getPreviousAudioIndex() {
    let newIndex = this.selectedAudioIndex;
    newIndex - 1 >= 0 ? newIndex -= 1 : newIndex = this.numberOfTracks - 1;
    return newIndex;
  }

  private async onSelectedAudioIndexChange(newSelectedAudioIndex: number) {
    let audioFilenameHash;
    let audioContext = await this.getContextSynchronously();
    if (audioContext) {
      this.setAudioContext(audioContext);
      this.setNumberOfTracks(audioContext.length);
      this.setLoading(true);
      audioFilenameHash = audioContext[newSelectedAudioIndex].audio_filename_hash;
      let audioSrc = await this.getObjectURLFromDownload(audioFilenameHash);
      this.setAudioTitle(audioContext[newSelectedAudioIndex].title);
      this.setSelectedAudioIndex(newSelectedAudioIndex);
      this.setAudioSrc(audioSrc);
      this.setLoading(false);
      this.updateAudioOndurationchange();
      if (this.autoplayOnIndexChange) {
        this.playAudioTrack();
      }
    }
  }

  private async onSongChangeShuffle(badIndex: number): Promise<number> {
    let lowerBound: number = 0;
    let upperBound: number = this.numberOfTracks;
    let randomTrackIndex: number = Math.floor(Math.random() * (upperBound - lowerBound) + lowerBound);

    if (randomTrackIndex === badIndex && this.numberOfTracks > 1) {  // this extra condition is only relevant to development
      console.log(`recursing: new index ${randomTrackIndex} === previous ${badIndex}`);
      return await this.onSongChangeShuffle(badIndex);
    }
    await this.onSelectedAudioIndexChange(randomTrackIndex);
    return -1
  }
}
// ----------------------------------------------------------------------------------------------------------------
