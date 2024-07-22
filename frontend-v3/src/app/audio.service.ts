import { Injectable } from '@angular/core';
import { duration as momentDuration } from 'moment';

import { ApiService } from './api-service';


@Injectable({
  providedIn: 'root'
})

export class AudioService {
  public audioTrack: HTMLAudioElement = new Audio();
  public numberOfTracks: number = 0;
  public musicLength: string = '0:00';
  public duration: number = 1;
  public currentTime: string = '0:00';
  public filenameHashesByIndex: any;
  public filenameTitlesByHash: any;
  public sliderValue: number = 0;
  public loading: boolean = false;
  public lowBandwidthMode: boolean = false;

  // ----------------------------------------------------------------------------------------------------------------
  // set by player component ------------
  public selectedAudioIndex = 0;
  public title: string = "null";
  public shuffleEnabled: boolean = false;
  public repeatEnabled: boolean = false;
  public context: any;
  // ----------------------------------------------------------------------------------------------------------------
  sliderValueProxy: number = 0;
  // there's most likely a cleaner way to do this, but this variable avoids this scenario:
  // user drags the slider, updating the `sliderValue` attr and kicking off a rerender
  // `ontimeupdate` HTMLAudioElement event handler updates the sliderValue attr again to re-sync the slider position
  // `AfterViewInit` was not able to validate the 1st `sliderValue` change before the 2nd change took effect
  // becuase the event handler runs between 4 and 66hz
  // ----------------------------------------------------------------------------------------------------------------

  constructor(private apiService: ApiService) { }

  // ----------------------------------------------------------------------------------------------------------------
  // getters
  public getContext() { return this.context; }
  public getTitle() { return this.title; }
  public getLoading() { return this.loading; }
  public getLowBandwidthMode() { return this.lowBandwidthMode; }
  public getAudioTrack() { return this.audioTrack; }
  public getCurrentTime() { return this.currentTime; }
  public getDuration() { return this.duration; }
  public getMusicLength() { return this.musicLength; }
  public getSliderValue() { return this.sliderValue; }

  public async getAndLoadAudioTrack(filenameHash: string) {
    this.audioTrack = await this.apiService.getMaskedAudioTrack(filenameHash);
    this.audioTrack.load();
    console.log('audio ready');
    return this.audioTrack;
  }
  // ----------------------------------------------------------------------------------------------------------------
  // setters
  public setShuffleEnabled(value: boolean) { this.shuffleEnabled = value; }
  public setRepeatEnabled(value: boolean) { this.repeatEnabled = value; }
  public setCurrentTime(value: number) { this.audioTrack.currentTime = value; }
  public setAudioIndex(idx: number) { this.selectedAudioIndex = idx; }
  public setAudioTitle(newTitle: string) { this.title = newTitle; }
  private async setContext() { this.context = await this.apiService.getMediaContext(); }

  public async setInitialAudioState() {
    // https://balramchavan.medium.com/using-async-await-feature-in-angular-587dd56fdc77
    await this.setContext();
    this.numberOfTracks = this.context.length;
    let audioFilenameHash = this.context[this.selectedAudioIndex].filename_hash;
    this.audioTrack = await this.getAndLoadAudioTrack(audioFilenameHash);
    this.title = this.context[this.selectedAudioIndex].title;
    this.filenameTitlesByHash = {};
    this.filenameHashesByIndex = {};
    this.context.forEach((element: any, idx: number) => {
      this.filenameHashesByIndex[element.filename_hash] = idx;
      this.filenameTitlesByHash[element.filename_hash] = element.title;
    })
  }
// ----------------------------------------------------------------------------------------------------------------
// dynamic methods
  updateAudioMetadataState() {
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

    this.audioTrack.onstalled = () => { console.log('onstalled'); this.lowBandwidthMode = true; }
    this.audioTrack.onerror = () => { console.log('onerror'); this.lowBandwidthMode = true; }
    this.audioTrack.oncanplaythrough = () => { console.log('oncanplaythrough'); this.lowBandwidthMode = false; }
  }
  // ----------------------------------------------------------------------------------------------------------------
  // public core utility methods
  public pauseOnCycleThrough() { this.audioTrack.pause(); }
  public playOnCycleThrough() { this.audioTrack.play(); }
  public playAudioTrack() { this.audioTrack.play(); }
  public pauseAudioTrack() { this.audioTrack.pause(); }

  public async onNextWrapper() {  // wrap so that this can be called from player component without passing args
    if (this.shuffleEnabled) {
      await this.onSongChangeShuffle(this.selectedAudioIndex);
    } else {
      let newIndex: number = this.selectedAudioIndex;
      if (!this.repeatEnabled) {
        newIndex = this.getNextAudioIndex();
      }
      this.onNext(newIndex);
    }
  }

  public onPreviousWrapper() {
    let newIndex: number;
    if (this.repeatEnabled) {
      newIndex = this.selectedAudioIndex;
    } else {
      newIndex = this.getPreviousAudioIndex();
    }
    this.onPrevious(newIndex);
  }
  // ----------------------------------------------------------------------------------------------------------------
  // private core utility methods
  private async onNext(newIndex: number) {
    this.pauseOnCycleThrough();
    await this.onIndexChange(newIndex);
    this.playOnCycleThrough();
  }

  private getNextAudioIndex() {
    let newIndex = this.selectedAudioIndex;
    if (this.selectedAudioIndex + 1 < this.numberOfTracks) {
      newIndex += 1
    } else {
      newIndex = 0;
    }
    return newIndex;
  }

  private async onPrevious(newIndex: number) {
    this.pauseOnCycleThrough();
    await this.onIndexChange(newIndex);
    this.playOnCycleThrough();
  }

  private getPreviousAudioIndex() {
    let newIndex = this.selectedAudioIndex;
    if (newIndex - 1 >= 0) {
      newIndex -= 1;
    } else {
      newIndex = this.numberOfTracks - 1;
    }
    return newIndex;
  }

  private async onIndexChange(newIndex: number) {
    if (!this.context) {  // TODO: not sure how this could occur, but should investigate
      console.log('onindexchange fetching context, since context was undefined')
      await this.setContext();
    }
    this.setAudioIndex(newIndex);
    let audioFilenameHash = this.context[newIndex].filename_hash;
    await this.getAndLoadAudioTrack(audioFilenameHash);
    this.title = this.context[this.selectedAudioIndex].title;
    this.updateAudioMetadataState();
  }

  private async onSongChangeShuffle(badIndex: number): Promise<number> {
    if (this.repeatEnabled) { this.repeatEnabled = !this.repeatEnabled; }
    let lowerBound: number = 0;
    let upperBound: number = this.numberOfTracks;
    let randomTrackIndex: number = Math.floor(Math.random() * (upperBound - lowerBound) + lowerBound);

    if (randomTrackIndex === badIndex && this.numberOfTracks > 1) {  // this extra condition is only relevant to development
      console.log(`recursing: new index ${randomTrackIndex} === previous ${badIndex}`);
      return this.onSongChangeShuffle(badIndex);
    }
    this.pauseOnCycleThrough();
    await this.onIndexChange(randomTrackIndex);
    this.playOnCycleThrough();
    return -1
  }
}
// ----------------------------------------------------------------------------------------------------------------
