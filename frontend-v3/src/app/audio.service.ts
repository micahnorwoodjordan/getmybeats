import { Injectable } from '@angular/core';
import { duration as momentDuration } from 'moment';

import { HttpEventType } from '@angular/common/http';
import { ApiService } from './api-service';
import { generateAudioRequestGUID } from './utilities';


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
  public hasPlaybackError: boolean = false;

  // ----------------------------------------------------------------------------------------------------------------
  // set by player component ------------
  public selectedAudioIndex = 0;
  public title: string = "null";
  public shuffleEnabled: boolean = false;
  public repeatEnabled: boolean = false;
  public context: any;
  // ----------------------------------------------------------------------------------------------------------------

  constructor(private apiService: ApiService) { }

  // ----------------------------------------------------------------------------------------------------------------
  // getters
  public getContext() { return this.context; }
  public getTitle() { return this.title; }
  public getLoading() { return this.loading; }
  public getHasPlaybackError() { return this.hasPlaybackError; }
  public getAudioTrack() { return this.audioTrack; }
  public getCurrentTime() { return this.currentTime; }
  public getDuration() { return this.duration; }
  public getMusicLength() { return this.musicLength; }
  public getSliderValue() { return this.sliderValue; }

  public getAndLoadAudioTrack(filenameHash: string) {
    console.log('getandloadaudiotrack fired');
    let requestGUID = generateAudioRequestGUID();
    let audioSrc = '';

    this.apiService.getMaskedAudioTrack(filenameHash, requestGUID).subscribe(
      event => {
        switch (event.type) {
          case HttpEventType.DownloadProgress:
            if (event.total !== undefined) {
              console.log(`getandloadaudiotrack: ${Math.round((event.loaded / event.total) * 100)}% of data fetched`);
            }
            break;
          case HttpEventType.Response:
            console.log(`getandloadaudiotrack: received server response ${event.status}`);
            if (event.status == 200) {
              if (event.body !== undefined && event.body !== null) {
                audioSrc = URL.createObjectURL(event.body);
                this.setAudioTitle(this.context[this.selectedAudioIndex].title);
                this.setAudioTrack(audioSrc);
                this.setLoading(false);
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
    this.audioTrack.load();
    return this.audioTrack;
  }
  // ----------------------------------------------------------------------------------------------------------------
  // setters
  private setLoading(value: boolean) { this.loading = value; }
  private async setAudioTrack(src: string) { this.audioTrack.src = src; }
  private setAudioFilenameHashes() {
    this.filenameTitlesByHash = {};
    this.filenameHashesByIndex = {};
    this.context.forEach((element: any, idx: number) => {
      this.filenameHashesByIndex[element.filename_hash] = idx;
      this.filenameTitlesByHash[element.filename_hash] = element.title;
    });
  }
  private setContext() {
    this.apiService.getMediaContext().subscribe(
      event => {
        switch (event.type) {
          case HttpEventType.Response:
            console.log(`getMediaContext: received server response ${event.status}`);
            if (event.status == 200) {
              if (event.body !== undefined && event.body !== null) {
                this.context = event.body;
                this.setAudioFilenameHashes();
                this.numberOfTracks = this.context.length;
                let audioFilenameHash = this.context[this.selectedAudioIndex].filename_hash;
                this.getAndLoadAudioTrack(audioFilenameHash);
              }
            } else {
              console.log('getMediaContext: ERROR');
            }
            
            break;
          default:
            console.log('getMediaContext: no response from server yet');
        }
      },
      error => {
        console.log(`getMediaContext ERROR: ${error.toString()}`);
      }
    );
  }

  public setShuffleEnabled(value: boolean) { this.shuffleEnabled = value; this.shuffleEnabled ? this.repeatEnabled = false : null; }
  public setRepeatEnabled(value: boolean) { this.repeatEnabled = value; this.repeatEnabled ? this.shuffleEnabled = false : null; }
  public setCurrentTime(value: number) { this.audioTrack.currentTime = value; }
  public setAudioIndex(idx: number) { this.selectedAudioIndex = idx; }
  public setAudioTitle(newTitle: string) { this.title = newTitle; }

  public setContextExternal(newContext: any) {
    let staleAudioRef = this.audioTrack;
    let staleAudioWasPlaying = staleAudioRef.paused ? false : true;
    this.context = newContext;
    this.setAudioFilenameHashes();
    this.pauseAudioTrack();
    let filenameHash: string = this.context[this.selectedAudioIndex].filename_hash;
    this.getAndLoadAudioTrack(filenameHash);
    this.setCurrentTime(staleAudioRef.currentTime);
    if (staleAudioWasPlaying) {  // don't automatically play on context update if user was not playing audio already
      this.playAudioTrack();
    }
    this.updateAudioMetadataState();
  }

  public setInitialAudioState() { this.setContext(); }
// ----------------------------------------------------------------------------------------------------------------
// dynamic methods
  public updateAudioMetadataState() {
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
    this.audioTrack.onstalled = () => { console.log('onstalled'); this.hasPlaybackError = true; }
    this.audioTrack.onerror = () => { console.log('onerror'); this.hasPlaybackError = true; }
    this.audioTrack.oncanplaythrough = () => { console.log('oncanplaythrough'); this.hasPlaybackError = false; this.loading = false; }
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
      let newIndex: number = this.repeatEnabled ? this.selectedAudioIndex : this.getNextAudioIndex();
      this.onNext(newIndex);
    }
  }

  public onPreviousWrapper() {
    let newIndex: number = this.repeatEnabled ? this.selectedAudioIndex : this.getPreviousAudioIndex();
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
    this.selectedAudioIndex + 1 < this.numberOfTracks ? newIndex += 1 : newIndex = 0;
    return newIndex;
  }

  private async onPrevious(newIndex: number) {
    this.pauseOnCycleThrough();
    await this.onIndexChange(newIndex);
    this.playOnCycleThrough();
  }

  private getPreviousAudioIndex() {
    let newIndex = this.selectedAudioIndex;
    newIndex - 1 >= 0 ? newIndex -= 1 : newIndex = this.numberOfTracks - 1;
    return newIndex;
  }

  private onIndexChange(newIndex: number) {
    console.log('onindexchange fired');
    if (!this.context) {  // TODO: not sure how this could occur, but should investigate. this is a glaring optimization hole
      console.log('onindexchange fetching context, since context was undefined')
      this.setContext();
    }
    this.setAudioIndex(newIndex);
    let audioFilenameHash = this.context[newIndex].filename_hash;
    this.getAndLoadAudioTrack(audioFilenameHash);  // also sets the audioTrack attribute
    this.setAudioTitle(this.context[this.selectedAudioIndex].title);
    this.updateAudioMetadataState();
  }

  private async onSongChangeShuffle(badIndex: number): Promise<number> {
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
