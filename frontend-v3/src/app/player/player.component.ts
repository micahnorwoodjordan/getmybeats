// https://stackoverflow.com/questions/45928423/get-rid-of-white-space-around-angular-material-modal-dialog
// i attempted to remvoe whitespace around the bottom sheet (did not succeed) and stumbled upon the ViewEncapsulation meta property

import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { duration as momentDuration } from 'moment';
import {MatListModule} from '@angular/material/list';
import { MatBottomSheet, MatBottomSheetModule, MatBottomSheetRef } from '@angular/material/bottom-sheet';

import { ApiService } from '../api-service';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-player',
  templateUrl: './player.component.html',
  styleUrl: './player.component.css'
})

export class PlayerComponent implements OnInit {
  context: any;
  audioTrack: HTMLAudioElement = new Audio();
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
  lowBandwidthMode: boolean = false;
  filenameHashesByIndex: any;

  // there's most likely a cleaner way to do this, but this variable avoids this scenario:
  // user drags the slider, updating the `sliderValue` attr and kicking off a rerender
  // `ontimeupdate` HTMLAudioElement event handler updates the sliderValue attr again to re-sync the slider position
  // `AfterViewInit` was not able to validate the 1st `sliderValue` change before the 2nd change took effect
  // becuase the event handler runs between 4 and 66hz
  sliderValueProxy: number = 0;

  constructor(private apiService: ApiService, private bottomSheet: MatBottomSheet) {}


  // small methods
  pauseOnCycleThrough() { this.audioTrack.pause(); }
  playOnCycleThrough() { this.audioTrack.play(); }
  onClickShuffle() { this.shuffleEnabled = !this.shuffleEnabled; this.repeatEnabled = false; }
  onClickRepeat() { this.repeatEnabled = !this.repeatEnabled; this.shuffleEnabled = false; }


  // async methods
  async ngOnInit(): Promise<void> {
    await this.setInitialAudioState();
    this.filenameHashesByIndex = {};
    this.context.forEach((element: any, idx: number) => {
      this.filenameHashesByIndex[element.filename_hash] = idx;
    })
    this.updateAudioMetadataState();
  }

  async getAndLoadAudioTrack(filenameHash: string) {
    this.audioTrack = await this.apiService.getMaskedAudioTrack(filenameHash);
    this.audioTrack.load();
    console.log('audio ready');
  }

  async setInitialAudioState() {
    // https://balramchavan.medium.com/using-async-await-feature-in-angular-587dd56fdc77
    this.context = await this.apiService.getMediaContext();
    this.numberOfTracks = this.context.length;
    let audioFilenameHash = this.context[this.selectedAudioIndex].filename_hash;
    await this.getAndLoadAudioTrack(audioFilenameHash);
    this.title = this.context[this.selectedAudioIndex].title;
  }

  async onSelectedAudioIndexChange(newIndex: number) {
    this.selectedAudioIndex = newIndex;
    let audioFilenameHash = this.context[this.selectedAudioIndex].filename_hash;
    await this.getAndLoadAudioTrack(audioFilenameHash);
    this.title = this.context[this.selectedAudioIndex].title;
    this.updateAudioMetadataState();
  }

  async onNext() {
    if (this.shuffleEnabled) {
      await this.onSongChangeShuffle(this.selectedAudioIndex); 
    } else {
      if (this.repeatEnabled) {
        this.onSongChangeRepeatTrue();
      } else {
        this.onNextRepeatFalse();
      }
    }
  }

  async onNextRepeatFalse() {
    this.pauseOnCycleThrough();

    if (this.selectedAudioIndex + 1 < this.numberOfTracks) {
      this.selectedAudioIndex += 1;
    } else {
      this.selectedAudioIndex = 0;
    }
    await this.onSelectedAudioIndexChange(this.selectedAudioIndex);
    this.playOnCycleThrough();
  }

  async onPreviousRepeatFalse() {
    this.pauseOnCycleThrough();
    if (this.selectedAudioIndex - 1 >= 0) {
      this.selectedAudioIndex -= 1;
    } else {
      this.selectedAudioIndex = this.numberOfTracks - 1;
    }
    await this.onSelectedAudioIndexChange(this.selectedAudioIndex);
    this.playOnCycleThrough();
  }

  async onPrevious() {
    if (this.repeatEnabled) {
      this.onSongChangeRepeatTrue();
    } else {
      this.onPreviousRepeatFalse();
    }
  }

  async onSongChangeShuffle(badIndex: number): Promise<number> {
    if (this.repeatEnabled) { this.repeatEnabled = !this.repeatEnabled; }
    let lowerBound: number = 0;
    let upperBound: number = this.numberOfTracks;
    let randomTrackIndex: number = Math.floor(Math.random() * (upperBound - lowerBound) + lowerBound);

    if (randomTrackIndex === badIndex) {
      console.log(`recursing: new index ${randomTrackIndex} === previous ${badIndex}`);
      return this.onSongChangeShuffle(badIndex);
    }
    this.pauseOnCycleThrough()
    await this.onSelectedAudioIndexChange(randomTrackIndex);
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

    this.audioTrack.onended = () => { this.loading = true; this.onNext(); }
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

  async openBottomSheet(): Promise<void> {
    // https://stackoverflow.com/questions/60359019/how-to-return-data-from-matbottomsheet-to-its-parent-component
    const bottomSheetRef = this.bottomSheet.open(TrackSelectorBottomSheet);
    bottomSheetRef.afterDismissed().subscribe(async (songHashAndTitleDict) => {
      if (songHashAndTitleDict !== undefined ) {
        this.pauseOnCycleThrough();
        await this.getAndLoadAudioTrack(songHashAndTitleDict.filename_hash);
        this.selectedAudioIndex = this.filenameHashesByIndex[songHashAndTitleDict.filename_hash];
        this.title = this.context[this.selectedAudioIndex].title;
        this.playOnCycleThrough();
        this.updateAudioMetadataState();
      } else {
        console.log('no data was returned from TrackSelectorBottomSheet');
      }
    });
  }
}
 
@Component({
  standalone: true,
  imports: [MatListModule, CommonModule],
  encapsulation: ViewEncapsulation.None,
  template: `
      <h1>tracks</h1>
      <mat-nav-list>
          <mat-list-item *ngFor="let songDict of context" (click)="getSelectedSong(songDict, $event)">
              <span matListItemTitle>{{ songDict.title }}</span>
          </mat-list-item>
      </mat-nav-list>
  `,
  styles: [
      `html { font-family: Inconsolata, Roboto, "Helvetica Neue", sans-serif;  }`,
      `mat-list-item:hover { background-color: rgb(158, 94, 242); }`,
      `span { text-align: center; color: rgb(0, 0, 0); }`,
      `h1 { text-align: center; color: rgb(0, 0, 0); }`,
  ]
})

export class TrackSelectorBottomSheet {
  context: any;
  songDict: any;

  constructor(private apiService: ApiService, private bottomSheetRef: MatBottomSheetRef<TrackSelectorBottomSheet>) {}

  async ngOnInit(): Promise<void> {
      this.context = await this.apiService.getMediaContext();
  }

  getSelectedSong(song: any, event: MouseEvent) {
    this.songDict = song;
    this.bottomSheetRef.dismiss(this.songDict);
    event.preventDefault();
  }
}
