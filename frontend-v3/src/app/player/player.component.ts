// https://stackoverflow.com/questions/45928423/get-rid-of-white-space-around-angular-material-modal-dialog
// i attempted to remvoe whitespace around the bottom sheet (did not succeed) and stumbled upon the ViewEncapsulation meta property

import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import {MatListModule} from '@angular/material/list';
import { MatBottomSheet, MatBottomSheetModule, MatBottomSheetRef } from '@angular/material/bottom-sheet';
import { CommonModule } from '@angular/common';

import { AudioService } from '../audio.service';
import { ApiService } from '../api-service';
import { PollService } from '../poll.service';
import { environment } from 'src/environments/environment';


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
  lowBandwidthMode: boolean = false;
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
    this.lowBandwidthMode = this.audioService.getLowBandwidthMode();
    this.title = this.audioService.getTitle();
    this.loading = this.audioService.getLoading();
    this.currentTime = this.audioService.getCurrentTime();
    this.duration = this.audioService.getDuration();
    this.musicLength = this.audioService.getMusicLength();
    this.sliderValue = this.audioService.getSliderValue();
    this.paused = this.audioService.audioTrack.paused;
}
// ----------------------------------------------------------------------------------------------------------------

  async ngOnInit(): Promise<void> {
    await this.audioService.setInitialAudioState();
    this.audioService.updateAudioMetadataState();

    setInterval(async () => {
      await this.pollService.evaluateCurrentContext();  // this logic fires every second to evaluate the current audio context
      let pollContext = this.pollService.getContext();
      if (JSON.stringify(this.audioService.context) !== JSON.stringify(pollContext)) {
        console.log('PlayerComponent context updated');
        this.audioService.setContextExternal(pollContext);
      }
      this.getAudioTrackPresentationData();
    }, environment.audioContextEvaluationIntervalSeconds * 1000);
  }

  async openBottomSheet(): Promise<void> {
    // https://stackoverflow.com/questions/60359019/how-to-return-data-from-matbottomsheet-to-its-parent-component
    const bottomSheetRef = this.bottomSheet.open(TrackSelectorBottomSheet);
    bottomSheetRef.afterDismissed().subscribe(async (songHashAndTitleDict) => {
      if (songHashAndTitleDict !== undefined ) {
        this.audioService.pauseOnCycleThrough();
        await this.audioService.getAndLoadAudioTrack(songHashAndTitleDict.filename_hash);
        this.audioService.setAudioIndex(this.audioService.filenameHashesByIndex[songHashAndTitleDict.filename_hash]);
        this.audioService.setAudioTitle(this.audioService.filenameTitlesByHash[songHashAndTitleDict.filename_hash]);
        this.audioService.playOnCycleThrough();
        this.audioService.updateAudioMetadataState();
        this.getAudioTrackPresentationData();
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
// ----------------------------------------------------------------------------------------------------------------
