import { Injectable } from '@angular/core';
import { duration as momentDuration } from 'moment';

import { HttpEventType } from '@angular/common/http';

import { ApiService } from './api.service';
import { MediaContextElement } from '../interfaces/MediaContextElement';
import { generateAudioRequestGUID } from '../utilities';


@Injectable({
  providedIn: 'root'
})

export class AudioService {
  private audioTrack: HTMLAudioElement = new Audio();
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
  // ----------------------------------------------------------------------------------------------------------------

  constructor(private apiService: ApiService) { }

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

  public getAndLoadAudioTrack(filenameHash: string) {
    console.log('getandloadaudiotrack fired');
    let requestGUID = generateAudioRequestGUID();
    let audioSrc = '';

    this.apiService.getMaskedAudioTrack(filenameHash, requestGUID).subscribe(
      event => {
        this.setLoading(true);
        switch (event.type) {
          case HttpEventType.DownloadProgress:
            if (event.total !== undefined) {
              console.log(`getandloadaudiotrack: ${Math.round((event.loaded / event.total) * 100)}% of data fetched`);
            }
            break;
          case HttpEventType.Response:
            console.log(`getandloadaudiotrack: received server response ${event.status}`);

            this.context.forEach((mediaContextElement: MediaContextElement, idk: number) => {
              if(mediaContextElement.filename_hash === filenameHash) {
                this.setAudioIndex(mediaContextElement.id);
              }
            });

            if (event.status == 200) {
              if (event.body !== undefined && event.body !== null) {
                audioSrc = URL.createObjectURL(event.body);
                this.setAudioTitle(this.context[this.selectedAudioIndex].title);
                this.setAudioTrack(audioSrc);
                this.setLoading(false);
                this.audioTrack.load();
                if (this.autoplayOnIndexChange) {
                  this.playAudioTrack();
                }
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
  // ----------------------------------------------------------------------------------------------------------------
  // setters
  public setInitialAudioState() { this.setContextAndLoadAudioTrack(); }
  public setAutoplayOnIndexChange(value: boolean) { this.autoplayOnIndexChange = value; }
  private setLoading(value: boolean) { this.loading = value; }
  private setAudioTrack(src: string) { this.audioTrack.src = src; }

  private setContextAndLoadAudioTrack() {
    this.apiService.getMediaContext().subscribe(
      event => {
        switch (event.type) {
          case HttpEventType.Response:
            console.log(`setContextAndLoadAudioTrack: received server response ${event.status}`);
            if (event.status == 200) {
              if (event.body !== undefined && event.body !== null) {
                this.context = event.body;
                this.numberOfTracks = this.context.length;
                let audioFilenameHash = this.context[this.selectedAudioIndex].filename_hash;
                this.getAndLoadAudioTrack(audioFilenameHash);
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
              } else {
                console.log('setContextAndLoadAudioTrack: ERROR');
              }
            }
            break;
          default:
            console.log('setContextAndLoadAudioTrack: no response from server yet');
          }
      },
      error => {
        console.log(`setContextAndLoadAudioTrack ERROR: ${error.toString()}`);
      }
    );
  }

  private setContext() {
    this.apiService.getMediaContext().subscribe(
      event => {
        switch (event.type) {
          case HttpEventType.Response:
            console.log(`setContext: received server response ${event.status}`);
            if (event.status == 200) {
              if (event.body !== undefined && event.body !== null) {
                this.context = event.body;
                this.numberOfTracks = this.context.length;
              } else {
                console.log('setContext: ERROR');
              }
            }
            break;
          default:
            console.log('setContext: no response from server yet');
          }
      },
      error => {
        console.log(`setContext ERROR: ${error.toString()}`);
      }
    );
  }

  public setShuffleEnabled(value: boolean) { this.shuffleEnabled = value; this.shuffleEnabled ? this.repeatEnabled = false : null; }
  public setRepeatEnabled(value: boolean) { this.repeatEnabled = value; this.repeatEnabled ? this.shuffleEnabled = false : null; }
  public setCurrentTime(value: number) { this.audioTrack.currentTime = value; }
  public setAudioIndex(idx: number) { this.selectedAudioIndex = idx; }
  public setAudioTitle(newTitle: string) { this.title = newTitle; }
  public setContextExternal() { this.setContext(); }
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
  public playAudioTrack() { this.audioTrack.play(); }
  public pauseAudioTrack() { this.audioTrack.pause(); }

  public onNextWrapper() {  // wrap so that this can be called from player component without passing args
    this.setAutoplayOnIndexChange(true);
    if (this.shuffleEnabled) {
      this.onSongChangeShuffle(this.selectedAudioIndex);
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
  private onNext(newIndex: number) { this.onIndexChange(newIndex); }
  private onPrevious(newIndex: number) { this.onIndexChange(newIndex); }

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

  private onIndexChange(newIndex: number) {
    console.log('onindexchange fired');
    this.setAudioIndex(newIndex);
    let audioFilenameHash = this.context[newIndex].filename_hash;
    this.getAndLoadAudioTrack(audioFilenameHash);  // also sets the audioTrack attribute
  }

  private onSongChangeShuffle(badIndex: number): number {
    let lowerBound: number = 0;
    let upperBound: number = this.numberOfTracks;
    let randomTrackIndex: number = Math.floor(Math.random() * (upperBound - lowerBound) + lowerBound);

    if (randomTrackIndex === badIndex && this.numberOfTracks > 1) {  // this extra condition is only relevant to development
      console.log(`recursing: new index ${randomTrackIndex} === previous ${badIndex}`);
      return this.onSongChangeShuffle(badIndex);
    }
    this.onIndexChange(randomTrackIndex);
    return -1
  }
}
// ----------------------------------------------------------------------------------------------------------------
