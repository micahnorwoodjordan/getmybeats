import { Component, OnInit } from '@angular/core';
import * as moment from 'moment';

import { ApiService } from '../api-service';


@Component({
  selector: 'app-player',
  templateUrl: './player.component.html',
  styleUrl: './player.component.css'
})

export class PlayerComponent implements OnInit {
  audioTrack: HTMLAudioElement = new Audio();
  audioFilenamesData: any;
  selectedAudioIndex = 0;
  numberOfTracks: number = 0;
  musicLength: string = '0:00';
  duration: number = 1;
  currentTime: string = '0:00';
  title: string = "null";
  sliderValue: number = 0;
  shuffleEnabled: boolean = false;
  repeatEnabled: boolean = false;
  loading: boolean = false;

  // there's most likely a cleaner way to do this, but this variable avoids this scenario:
  // user drags the slider, updating the `sliderValue` attr and kicking off a rerender
  // `ontimeupdate` HTMLAudioElement event handler updates the sliderValue attr again to re-sync the slider position
  // `AfterViewInit` was not able to validate the 1st `sliderValue` change before the 2nd change took effect
  // becuase the event handler runs between 4 and 66hz
  sliderValueProxy: number = 0;

  constructor(private apiService: ApiService) {}


  // small methods
  pauseOnCycleThrough() { this.audioTrack.pause(); }
  playOnCycleThrough() { this.audioTrack.play(); }
  sanitizeFilename(filename: string): string { return filename.split('.').slice(0, -1).join('.'); }
  onClickShuffle() { this.shuffleEnabled = !this.shuffleEnabled; }
  onClickRepeat() { this.repeatEnabled = !this.repeatEnabled; }


  // async methods
  async ngOnInit(): Promise<void> {
    await this.setInitialAudioState();
    this.updateAudioMetadataState();
  }

  getAndLoadAudioTrack(audioFilename: string) {
    this.loading = true;
    this.audioTrack = this.apiService.getAudioTrack(audioFilename);
    this.loading = false
    this.audioTrack.load();
    console.log('audio ready');
  }

  async setInitialAudioState() {
    // https://balramchavan.medium.com/using-async-await-feature-in-angular-587dd56fdc77
    this.audioFilenamesData = await this.apiService.getAudioFilenames();
    this.numberOfTracks = this.audioFilenamesData.filenames.length;
    let audioFilename = this.audioFilenamesData.filenames[this.selectedAudioIndex];
    this.getAndLoadAudioTrack(audioFilename);
    this.title = this.sanitizeFilename(audioFilename);
  }

  onSelectedAudioIndexChange(newIndex: number) {
    this.selectedAudioIndex = newIndex;
    let audioFilename = this.audioFilenamesData.filenames[this.selectedAudioIndex];
    this.getAndLoadAudioTrack(audioFilename);
    this.title = this.sanitizeFilename(audioFilename);
    this.updateAudioMetadataState();
  }

  onNext() {
    if (this.shuffleEnabled) {
      this.onSongChangeShuffle(this.selectedAudioIndex); 
    } else {
      if (this.repeatEnabled) {
        this.onSongChangeRepeatTrue();
      } else {
        this.onNextRepeatFalse();
      }
    }
  }

  onNextRepeatFalse() {
    this.pauseOnCycleThrough();

    if (this.selectedAudioIndex + 1 < this.numberOfTracks) {
      this.selectedAudioIndex += 1;
    } else {
      this.selectedAudioIndex = 0;
    }
    this.onSelectedAudioIndexChange(this.selectedAudioIndex);
    this.playOnCycleThrough();
  }

  onPreviousRepeatFalse() {
    this.pauseOnCycleThrough();
    if (this.selectedAudioIndex - 1 >= 0) {
      this.selectedAudioIndex -= 1;
    } else {
      this.selectedAudioIndex = this.numberOfTracks - 1;
    }
    this.onSelectedAudioIndexChange(this.selectedAudioIndex);
    this.playOnCycleThrough();
  }

  onPrevious() {
    if (this.repeatEnabled) {
      this.onSongChangeRepeatTrue();
    } else {
      this.onPreviousRepeatFalse();
    }
  }

  onSongChangeShuffle(badIndex: number):  number {
    if (this.repeatEnabled) { this.repeatEnabled = !this.repeatEnabled; }
    let lowerBound: number = 0;
    let upperBound: number = this.numberOfTracks;
    let randomTrackIndex: number = Math.floor(Math.random() * (upperBound - lowerBound) + lowerBound);

    if (randomTrackIndex === badIndex) {
      console.log(`recursing: new index ${randomTrackIndex} === previous ${badIndex}`);
      return this.onSongChangeShuffle(badIndex);
    }
    this.pauseOnCycleThrough()
    this.onSelectedAudioIndexChange(randomTrackIndex);
    this.playOnCycleThrough();
    return -1
  }


  // synchronous methods
  onSliderChange(event: any) {
    setTimeout(() => {}, 200);
    this.sliderValueProxy = this.sliderValue;
    this.audioTrack.currentTime = this.sliderValueProxy;
    this.audioTrack.play();
  }

  updateAudioMetadataState() {
    // https://github.com/locknloll/angular-music-player/blob/main/src/app/app.component.ts#L123
    // the below logic blocks are borrowed from the above github project
    // these blocks are instrumental in getting the audio seeking logic to work correctly
    this.audioTrack.ondurationchange = () => {
      const totalSeconds = Math.floor(this.audioTrack.duration);
      const duration = moment.duration(totalSeconds, 'seconds');
      this.musicLength = duration.seconds() < 10 ?
        `${Math.floor(duration.asMinutes())}:0${duration.seconds()}` :
          `${Math.floor(duration.asMinutes())}:${duration.seconds()}`;
      this.duration = totalSeconds;
    }

    this.audioTrack.ontimeupdate = () => {
      const duration = moment.duration(Math.floor(this.audioTrack.currentTime), 'seconds');
      this.currentTime = duration.seconds() < 10 ? 
      `${Math.floor(duration.asMinutes())}:0${duration.seconds()}`:
        `${Math.floor(duration.asMinutes())}:${duration.seconds()}`;
      this.sliderValue = this.audioTrack.currentTime;
    }
  }

  onPlayPauseClick() {
    if (this.audioTrack.paused) {
      this.audioTrack.play();
    } else {
      this.audioTrack.pause();
    }
  }

  onSongChangeRepeatTrue() {
    this.pauseOnCycleThrough();
    this.audioTrack.currentTime = 0;
    this.audioTrack.load();
    this.playOnCycleThrough();
  }
}
