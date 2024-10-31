// https://stackoverflow.com/questions/45928423/get-rid-of-white-space-around-angular-material-modal-dialog
// i attempted to remvoe whitespace around the bottom sheet (did not succeed) and stumbled upon the ViewEncapsulation meta property

import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import {MatListModule} from '@angular/material/list';
import { MatBottomSheet, MatBottomSheetModule, MatBottomSheetRef } from '@angular/material/bottom-sheet';
import { CommonModule } from '@angular/common';
import { HttpEventType } from '@angular/common/http';

import { AudioService } from '../../services/audio.service';
import { ApiService } from '../../services/api.service';
import { PollService } from '../../services/poll.service';

import { MediaContextElement } from 'src/app/interfaces/MediaContextElement';


@Component({
  selector: 'app-player',
  templateUrl: './player.component.html',
  styleUrl: './player.component.css'
})

export class PlayerComponent implements OnInit {
  shuffleEnabled: boolean = false;
  repeatEnabled: boolean = false;
  paused: boolean = true;
  // ----------------------------------------------------------------------------------------------------------------
  sliderValueProxy: number = 0;
  // there's most likely a cleaner way to do this, but this variable avoids this scenario:
  // user drags the slider, updating the `sliderValue` attr and kicking off a rerender
  // `ontimeupdate` HTMLAudioElement event handler updates the sliderValue attr again to re-sync the slider position
  // `AfterViewInit` was not able to validate the 1st `sliderValue` change before the 2nd change took effect
  // because the event handler runs between 4 and 66hz
  // ----------------------------------------------------------------------------------------------------------------
  // attributes that need to be accessed via template
  hasPlaybackError: boolean = false;
  title: string = "null";
  loading: boolean = false;
  currentTime: string = '0:00';
  duration: number = 1;
  musicLength: string = '0:00';
  sliderValue: number = 0;
  // ----------------------------------------------------------------------------------------------------------------

  constructor(
    private audioService: AudioService,
    private pollService: PollService,
    private bottomSheet: MatBottomSheet
  ) {}

  // ----------------------------------------------------------------------------------------------------------------
  // interactive player methods
  onNext() { this.audioService.onNextWrapper(); }
  onPrevious() { this.audioService.onPreviousWrapper(); }

  onPlayPauseClick() {
    this.audioService.audioTrack.paused ? this.audioService.playAudioTrack() : this.audioService.pauseAudioTrack();
    this.paused = this.audioService.audioTrack.paused;
  }
  // ----------------------------------------------------------------------------------------------------------------
  // setters
  onClickShuffle() {
    this.shuffleEnabled = !this.shuffleEnabled;
    this.repeatEnabled = false;
    this.audioService.setShuffleEnabled(this.shuffleEnabled);
  }

  onClickRepeat() {
    this.repeatEnabled = !this.repeatEnabled;
    this.shuffleEnabled = false;
    this.audioService.setRepeatEnabled(this.repeatEnabled);
  }

  onSliderChange(event: any) {
    setTimeout(() => {}, 200);
    this.sliderValueProxy = this.sliderValue;
    this.audioService.setCurrentTime(this.sliderValueProxy);
    this.audioService.playAudioTrack();
  }
  // ----------------------------------------------------------------------------------------------------------------
  // AudioService getters
  getAudioTrackPresentationData() {
    this.hasPlaybackError = this.audioService.getHasPlaybackError();
    this.title = this.audioService.getTitle();
    this.loading = this.audioService.getLoading();
    this.currentTime = this.audioService.getCurrentTime();
    this.duration = this.audioService.getDuration();
    this.musicLength = this.audioService.getMusicLength();
    this.sliderValue = this.audioService.getSliderValue();
    this.paused = this.audioService.audioTrack.paused;
}
// ----------------------------------------------------------------------------------------------------------------

  ngOnInit() {
    this.audioService.setInitialAudioState();
    setInterval(() => {
        this.audioService.updateAudioMetadataState();
        this.getAudioTrackPresentationData();
      }, 500  // every 1/2 second
    );

    // user experience: disables next and previous buttons until requested audio is loaded
    setInterval(() => {
        this.loading = this.audioService.getLoading();
      }, 10
    );

    // for constant audio contextualization 
    // fires between the 200th and 400th millisecond of the 15th second of every 2nd minute of every hour
    setInterval(() => {
      this.pollService.evaluateCurrentTimeForMediaContextUpdate();
      }, 200
    );
  }

  openBottomSheet() {
    // https://stackoverflow.com/questions/60359019/how-to-return-data-from-matbottomsheet-to-its-parent-component
    const bottomSheetRef = this.bottomSheet.open(TrackSelectorBottomSheet);
    bottomSheetRef.afterDismissed().subscribe((contextElement: MediaContextElement) => {
      if (contextElement !== undefined ) {
        // ------------------------------------------------------------------------------------------------------------------------------
        // this safeguards against when the context changes AFTER the bottomsheet renders but BEFORE it releases on track selection
        // in this instance, the filename hash has changed, so we need the audio service's updated filename hash
        let audioServiceContext = this.audioService.getContext();
        let trueFileNameHash: string = '';
        let bottomsheetTitle = contextElement.title;

        audioServiceContext.forEach((ctxElement: MediaContextElement, idx: number) => {
          if (ctxElement.title === bottomsheetTitle) {
            trueFileNameHash = ctxElement.filename_hash;
          }
        })
        // ------------------------------------------------------------------------------------------------------------------------------

        this.audioService.setAutoplayOnIndexChange(true);
        this.audioService.getAndLoadAudioTrack(trueFileNameHash);
        this.audioService.updateAudioMetadataState();
      } else {
        console.log('no data was returned from TrackSelectorBottomSheet');
      }
    });
  }
}
// ----------------------------------------------------------------------------------------------------------------
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

  constructor(
    private apiService: ApiService,
    private bottomSheetRef: MatBottomSheetRef<TrackSelectorBottomSheet>
  ) {}

  ngOnInit() {
    this.apiService.getMediaContext().subscribe(
      event => {
        switch (event.type) {
          case HttpEventType.Response:
            console.log(`matbottomsheet ngOnInit: received server response ${event.status}`);
            if (event.status == 200) {
              if (event.body !== undefined && event.body !== null) {
                this.context = event.body;
              } else {
                console.log('matbottomsheet ngOnInit: ERROR');
              }
            }
            break;
          default:
            console.log('matbottomsheet ngOnInit: no response from server yet');
          }
      },
      error => {
        console.log(`matbottomsheet ngOnInit ERROR: ${error.toString()}`);
      }
    );
  }

  getSelectedSong(song: MediaContextElement, event: MouseEvent) {
    this.songDict = song;
    this.bottomSheetRef.dismiss(song);
    event.preventDefault();
  }
}
// ----------------------------------------------------------------------------------------------------------------
