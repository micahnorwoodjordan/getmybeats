// https://stackoverflow.com/questions/45928423/get-rid-of-white-space-around-angular-material-modal-dialog
// i attempted to remvoe whitespace around the bottom sheet (did not succeed) and stumbled upon the ViewEncapsulation meta property

import { Component, OnInit, ViewEncapsulation, Inject } from '@angular/core';
import { MatListModule } from '@angular/material/list';
import { MatSnackBar, MAT_SNACK_BAR_DATA, MatSnackBarRef} from '@angular/material/snack-bar';
import { MatBottomSheet, MatBottomSheetRef } from '@angular/material/bottom-sheet';
import { CommonModule } from '@angular/common';
import { HttpEventType } from '@angular/common/http';
import { MatSliderModule } from '@angular/material/slider';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';



import { AudioService } from '../../services/audio.service';
import { ApiService } from '../../services/api.service';

import { MediaContextElement } from 'src/app/interfaces/MediaContextElement';
import { environment } from 'src/environments/environment';


@Component({
  selector: 'app-player',
  templateUrl: './player.component.html',
  styleUrl: './player.component.css'
})

export class PlayerComponent implements OnInit {
  // ----------------------------------------------------------------------------------------------------------------
  artworkImage: HTMLImageElement = new Image();
  audioHasArtwork: boolean = false;
  sliderValueProxy: number = 0;
  // there's most likely a cleaner way to do this, but this variable avoids this scenario:
  // user drags the slider, updating the `sliderValue` attr and kicking off a rerender
  // `ontimeupdate` HTMLAudioElement event handler updates the sliderValue attr again to re-sync the slider position
  // `AfterViewInit` was not able to validate the 1st `sliderValue` change before the 2nd change took effect
  // because the event handler runs between 4 and 66hz
  // ----------------------------------------------------------------------------------------------------------------
  // attributes that need to be accessed via template
  shuffleEnabled: boolean = false;
  repeatEnabled: boolean = false;
  paused: boolean = true;
  hasPlaybackError: boolean = false;
  title: string = "null";
  loading: boolean = true;
  currentTime: string = '0:00';
  duration: number = 1;
  musicLength: string = '0:00';
  sliderValue: number = 0;
  downloadProgress: number = 0;
  snackbarRef: MatSnackBar | any;
  snackbarOpen: boolean = false;
  browserSupportsAudioVolumeManipulation: boolean = true;
  userExperienceReportUrl: string = `${environment.apiHost}/user/experience`
  // ----------------------------------------------------------------------------------------------------------------

  constructor(
    private audioService: AudioService,
    private bottomSheet: MatBottomSheet,
    private _snackBar: MatSnackBar
  ) { }

  // ----------------------------------------------------------------------------------------------------------------
  // interactive player methods
  async onNext() {
    await this.audioService.onNextWrapper();
    this.refreshAudioArtworkImageSrc();
  }
  async onPrevious() {
    await this.audioService.onPreviousWrapper();
    this.refreshAudioArtworkImageSrc();
  }
  onPlayPauseClick() {
    this.audioService.isAudioPaused() ? this.audioService.playAudioTrack() : this.audioService.pauseAudioTrack();
    this.paused = this.audioService.isAudioPaused();
  }
  // ----------------------------------------------------------------------------------------------------------------
  // getters
  getSnackbarOpen() { return this.snackbarOpen; }
  // ----------------------------------------------------------------------------------------------------------------
  // setters
  setLoading(value: boolean) { this.loading = value; }
  setAudioArtworkImageSrc(newSrc: string) { this.artworkImage.src = newSrc; }
  setAudioHasArtwork(newValue: boolean) { this.audioHasArtwork = newValue; }
  setSnackbarOpen(newValue: boolean) { this.snackbarOpen = newValue; }
  // ----------------------------------------------------------------------------------------------------------------
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

  refreshAudioArtworkImageSrc() {
    let imageSrc = this.audioService.getArtworkImageSrc();
    let audioHasArtwork = this.audioService.getAudioHasArtwork();
    this.setAudioArtworkImageSrc(imageSrc);
    this.setAudioHasArtwork(audioHasArtwork);
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
    this.paused = this.audioService.isAudioPaused();
}
// ----------------------------------------------------------------------------------------------------------------
// feature detection
doesBrowserSupportVolumeManipulation() {
  // https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement/volume
  // iOS browsers do NOT allow Javascript to manipulate audio volume
  // the value of `volume` is always 1
  // setting a value has no effect on the volume of the media object

  // UPDATE: https://developer.apple.com/documentation/webkitjs/htmlmediaelement/1631549-volume
  // the latest apple documentation mentions nothing about the below:
  // `volume` is NOT readonly, meaning that the value of `volume` is actually NOT always 1
  // this metric cannot be used to perform a better feature detection routine
  // unfortunately, we have to resort to user agent sniffing, which, though bad practice, will probably suffice in this case

  // how many non-iphone browsers are going to send a user agent header containing the substring "iphone"?
  if (navigator.userAgent.includes("iPhone")) {
    return false;
  }
  return true;
}

setBrowserSupportsAudioVolumeManipulation(newValue: boolean) { this.browserSupportsAudioVolumeManipulation = newValue; }

// ----------------------------------------------------------------------------------------------------------------

  async ngOnInit() {
    this.setBrowserSupportsAudioVolumeManipulation(this.doesBrowserSupportVolumeManipulation());

    await this.audioService.initialize();
    this.refreshAudioArtworkImageSrc();

    setInterval(() => {
        this.audioService.updateAudioMetadataState();
        this.getAudioTrackPresentationData();
      }, 500  // 2x per second
    );

    // user experience: disables next and previous buttons until requested audio is loaded
    setInterval(() => {
        this.setLoading(this.audioService.getLoading());
      }, 10  // 100x per second
    );

    setInterval(() => {
        this.refreshAudioArtworkImageSrc();
      }, 250  // 4x per second
    );

    setInterval(() => {
        if (this.loading) {
          this.downloadProgress = this.audioService.getDownloadProgress();
        }
      }, 500  // 2x per second
    );
  }


  openCustomSnackBar() {
    if (this.snackbarOpen) {
      if (this.snackbarRef) {
        this.snackbarRef.dismiss();
        this.setSnackbarOpen(false);
      }
    } else {
      const snackbarRef = this._snackBar.openFromComponent(VolumeSliderSnackbar, {
        data: {
          audioService: this.audioService,
          duration: 2500,
          message: 'adjust volume',
          action: () => {
            console.log('Action clicked')
          }
        }
      });
      this.snackbarRef = snackbarRef;
      this.setSnackbarOpen(true);
      snackbarRef.afterDismissed().subscribe(() => {
        this.setSnackbarOpen(false);
      });
    }
  }

  openBottomSheet() {
    // https://stackoverflow.com/questions/60359019/how-to-return-data-from-matbottomsheet-to-its-parent-component
    const bottomSheetRef = this.bottomSheet.open(TrackSelectorBottomSheet);
    bottomSheetRef.afterDismissed().subscribe(async (unvalidatedContextElement: MediaContextElement) => {
      let index: number = 0;
      let audioContext = await this.audioService.getContextSynchronously();

      if (audioContext) {
        audioContext.forEach((mediaContextElement: MediaContextElement, idk: number) => {
          if (mediaContextElement.id === unvalidatedContextElement.id) {
            index = mediaContextElement.id;
          }
        });
        await this.audioService.onIndexChangePublic(index);
        this.refreshAudioArtworkImageSrc();
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
          <mat-list-item *ngFor="let mediaContextElement of context" (click)="getSelectedSong(mediaContextElement, $event)">
              <span matListItemTitle>{{ mediaContextElement.title }}</span>
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
  context: Array<MediaContextElement> = [];
  mediaContextElement: MediaContextElement = {
    audio_filename_hash: '',
    artwork_filename_hash: '',
    artwork_width: '',
    artwork_height: '',
    title: '',
    id: 0
  };

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
    this.mediaContextElement = song;
    this.bottomSheetRef.dismiss(song);
    event.preventDefault();
  }
}
// ----------------------------------------------------------------------------------------------------------------
@Component({
  standalone: true,
  imports: [
    MatSliderModule,
    MatButtonModule,
    FormsModule
  ],
  styles: [
    `span { text-align: center; padding-right: 1vw; }`,
    `.volume-slider { width: 10vw; font-color: white; }`,
    `.text { text-align: center; }`,
    `.close-button { text-align: center; }`,
    `@media (max-width: 414px) { .volume-slider { width: 50vw; } }`
  ],
  template: `
  <div fxLayout="row" fxLayoutAlign="space-evenly center">
    <div fxLayout="column" class="text">
      <span>{{ message }}</span>
    <div>
    <div fxLayout="column">
      <mat-slider (input)="onSliderChange($event)" step="0.05" min="0" max="1" class="volume-slider">
        <input matSliderThumb [(ngModel)]="sliderValue"/>
      </mat-slider>
      <span>&nbsp;&nbsp;{{ uxVolumeValue }}%</span>
    <div>
    <div fxLayout="column" class="close-button">
        <button mat-raised-button (click)="close()">close</button>
    <div>
  <div>

  `
})
export class VolumeSliderSnackbar {
  sliderValue: number = 1;
  volumeValue: number = 1;
  uxVolumeValue: number = 100;
  message: string;
  action: () => void;

  constructor(
    @Inject(MAT_SNACK_BAR_DATA) public data: any,
    private snackBarRef: MatSnackBarRef<VolumeSliderSnackbar>,

  ) {
    this.message = data.message;
    this.action = data.action;

    // NOTE: this very hacky: each time the slider renders, it does so with a value of 1
    // meaning that even though a user may have already set the audio volume, the slider still renders with the incorrect value of 1
    //
    // using this timer gives the illusion that the above issue never takes place
    setInterval(
      () => {
        this.sliderValue = this.data.audioService.getVolume();
        this.volumeValue = this.sliderValue;
        this.uxVolumeValue = Math.floor(this.volumeValue * 100);
      }, 10  // 100x per second;
    );
  }

  close() { this.snackBarRef.dismiss(); }
  setVolumeValue(newVolumeValue: number) { this.volumeValue = newVolumeValue; }
  getVolumeValue() { return this.volumeValue; }

  onSliderChange(event: any) {
    setTimeout(() => {}, 200);
    this.volumeValue = this.sliderValue;
    this.uxVolumeValue = Math.floor(this.volumeValue * 100);
    this.data.audioService.setVolume(this.volumeValue);
  }
}
// ----------------------------------------------------------------------------------------------------------------
