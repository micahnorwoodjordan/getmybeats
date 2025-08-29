import { Inject, Component, OnInit, OnDestroy, effect, ViewEncapsulation } from '@angular/core';
import { MatSnackBar, MAT_SNACK_BAR_DATA, MatSnackBarRef} from '@angular/material/snack-bar';
import { MatSliderModule } from '@angular/material/slider';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { MatListModule } from '@angular/material/list';
import { HttpEventType } from '@angular/common/http';
import { MatBottomSheet, MatBottomSheetRef } from '@angular/material/bottom-sheet';
import { CommonModule } from '@angular/common';

import { environment } from 'src/environments/environment';
import { AudioService } from '../../services/audio.service';
import { ArtworkService } from 'src/app/services/artwork.service';
import { MediaContextElement } from 'src/app/interfaces/MediaContextElement';
import { ApiService } from 'src/app/services/api.service';

@Component({
  selector: 'app-player',
  templateUrl: './player.component.html',
  styleUrl: './player.component.css'
})
export class PlayerComponent implements OnInit, OnDestroy {
  constructor(
    private audioService: AudioService,
    private artworkService: ArtworkService,
    private apiService: ApiService,
    private _snackBar: MatSnackBar,
    private bottomSheet: MatBottomSheet
  ) {
      let lastAudioFetchCycle = 0;

      effect(async () => {
        const currentAudioFetchCycle = this.audioService.audioFetchCycle();

        if (currentAudioFetchCycle > lastAudioFetchCycle) {
          console.log(`PlayerComponent picked up audioFetchCycle signal update: ${lastAudioFetchCycle} -> ${currentAudioFetchCycle}`);
          await this.onNext(this.userHasInteractedWithUI ? true : false);
          lastAudioFetchCycle = currentAudioFetchCycle;
        }
      });
  }
  //----------------------------------------------------------------------------------------------------
  public title: string = 'null';
  public shuffleEnabled: boolean = false;
  public repeatEnabled: boolean = false;
  public hasPlaybackError: boolean = false;  // TODO
  public artworkImage: HTMLImageElement = new Image();
  public browserSupportsAudioVolumeManipulation: boolean = true;
  public userExperienceReportUrl: string = `${environment.apiHost}/user/experience`;
  public currentTime: number = 0;
  public currentTimeHumanReadable: string = '';
  public duration: number = 0;
  public durationHumanReadable: string = '';
  public isPlaying = false;
  public userHasInteractedWithUI: boolean = false;  // control to keep player from auto playing on load
  private mediaContext: MediaContextElement[] = [];
  private selectedAudioIndex = 0;
  private intervalId: any;
//----------------------------------------------------------------------------------------------------
// TODO: refactor snackbar out of this component entirely
  snackbarOpen: boolean = false;
  snackbarRef: MatSnackBar | any;
  getSnackbarOpen() { return this.snackbarOpen; }
  setSnackbarOpen(newValue: boolean) { this.snackbarOpen = newValue; }
//----------------------------------------------------------------------------------------------------
  private setSelectedAudioIndex(newIndex: number) { this.selectedAudioIndex = newIndex; }
  private setIsPlaying(newValue: boolean) { this.isPlaying = newValue; }
  private setAudioArtworkImageSrc(newSrc: string) { this.artworkImage.src = newSrc; }
  private setMediaContext(newcontext: MediaContextElement[]) { this.mediaContext = newcontext; }
  private setShuffleEnabled(newValue: boolean) { this.shuffleEnabled = newValue; }
  private setRepeatEnabled(newValue: boolean) { this.repeatEnabled = newValue; }
  private setCurrentTime(newValue: number) { this.currentTime = newValue; }
  private setUserHasInteractedWithUI(newValue: boolean) { this.userHasInteractedWithUI = newValue; }
  private setCurrentTimeHumanReadable(newValue: string) { this.currentTimeHumanReadable = newValue; }
  private setDurationHumanReadable(newValue: string) { this.durationHumanReadable = newValue; }

  public getTitle() { return this.audioService.getTitle(); }
  public getIsLoading() { return this.audioService.getIsLoading(); }
  public getDownloadProgress() { return this,this.audioService.getDownloadProgress(); }
  public getArtworkIsValid() { return this.artworkService.getArtworkIsValid(); }
  public getArtworkImageSrc() { return this.artworkService.getArtworkImageSrc(); }
  //----------------------------------------------------------------------------------------------------
  private setNextAudioIndex() {
    let currentIndex = this.selectedAudioIndex;

    if (currentIndex + 1 < this.mediaContext.length) {
      this.setSelectedAudioIndex(currentIndex + 1);
    } else {
      this.setSelectedAudioIndex(0);
    }
  }

  private setPreviousAudioIndex() {
    let currentIndex = this.selectedAudioIndex;

    if (currentIndex - 1 >= 0) {
      this.setSelectedAudioIndex(currentIndex - 1);
    } else {
      this.setSelectedAudioIndex(this.mediaContext.length - 1);
    }
  }

  public onClickShuffle() { this.setShuffleEnabled(!this.shuffleEnabled); this.setRepeatEnabled(false); }
  public onClickRepeat() { this.setRepeatEnabled(!this.repeatEnabled); this.setShuffleEnabled(false); }

  private shuffle(mediaContext: MediaContextElement[], currentAudioIndex: number): number {
    let lowerBound = 0;
    let upperBound = mediaContext.length;
    let randomTrackIndex: number = Math.floor(Math.random() * (upperBound - lowerBound) + lowerBound);

    if (randomTrackIndex === currentAudioIndex) {
        console.log(`recursing: new index ${randomTrackIndex} === previous ${currentAudioIndex}`);
        return this.shuffle(mediaContext, currentAudioIndex);
    }
    this.setSelectedAudioIndex(randomTrackIndex);
    return -1;
  }

  private restart() {
    this.audioService.seek(0);
    this.setCurrentTime(0);
    if (!this.audioService.getIsPlaying()) {
      this.audioService.play();
    }
  }

  private async getMediaContextAsPromise() { return await this.apiService.getMediaContextAsPromise(); }
  //----------------------------------------------------------------------------------------------------

  async ngOnInit() {
    this.setBrowserSupportsAudioVolumeManipulation(this.doesBrowserSupportVolumeManipulation());
    let mediaContext = await this.getMediaContextAsPromise();

    if (mediaContext !== undefined) {
      this.setMediaContext(mediaContext);
      await this.audioService.loadMediaContextElement(this.mediaContext, this.selectedAudioIndex);
      await this.artworkService.loadAudioArtworkImage(this.mediaContext, this.selectedAudioIndex);
      this.setAudioArtworkImageSrc(this.artworkService.getArtworkImageSrc());
    }

    this.intervalId = setInterval(() => {
      this.currentTime = this.audioService.getCurrentTime();
      this.duration = this.audioService.getDuration();
      this.setCurrentTimeHumanReadable(this.formatTimeToHumanReadableTimestamp(this.currentTime));
      this.setDurationHumanReadable(this.formatTimeToHumanReadableTimestamp(this.duration));
    }, 500);
  }

  ngOnDestroy() {
    clearInterval(this.intervalId);
  }
//----------------------------------------------------------------------------------------------------
  public togglePlay() {
    if (!this.userHasInteractedWithUI) {
      this.setUserHasInteractedWithUI(true);
    }

    if (this.isPlaying) {
      this.audioService.pause();
    } else {
      this.audioService.play();
    }
    this.setIsPlaying(!this.isPlaying);
  }

  public onSeek(e: Event) {
    const val = +(e.target as HTMLInputElement).value;
    this.audioService.seek(val);
    this.currentTime = val;
  }

  public async onNext(autoplay: boolean = false, indexOverride: number | null = null) {
    let mediaContext = await this.getMediaContextAsPromise();

    if (mediaContext !== undefined) {
      this.setMediaContext(mediaContext);

      if (indexOverride !== null) {
        this.setSelectedAudioIndex(indexOverride);
      } else if (this.repeatEnabled) {
          this.restart();
          return;
        } else if (this.shuffleEnabled) {
            this.shuffle(this.mediaContext, this.selectedAudioIndex);
          } else {
              this.setNextAudioIndex();
            }
      await this.audioService.onNext(this.mediaContext, this.selectedAudioIndex, autoplay);
      await this.artworkService.loadAudioArtworkImage(this.mediaContext, this.selectedAudioIndex);
      this.setAudioArtworkImageSrc(this.artworkService.getArtworkImageSrc());
    } else {
      console.log('PlayerComponent.onNext: could not get media context');
    }
  }

  public async onPrevious() {
    let mediaContext = await this.getMediaContextAsPromise();
    if (mediaContext !== undefined) {
      this.setMediaContext(mediaContext);
      this.setPreviousAudioIndex();
      await this.audioService.onPrevious(this.mediaContext, this.selectedAudioIndex);
      this.setIsPlaying(false);
      await this.artworkService.loadAudioArtworkImage(this.mediaContext, this.selectedAudioIndex);
      this.setAudioArtworkImageSrc(this.artworkService.getArtworkImageSrc());
      return;
    }
    console.log('PlayerComponent.onPrevious: could not get media context');
  }

  private formatTimeToHumanReadableTimestamp(timestamp: number) {
    let minutesString = Math.floor(timestamp / 60);
    let secondsString = Math.floor(timestamp % 60);
    return `${minutesString}` + ':' + (secondsString < 10 ? `0${secondsString}` : `${secondsString}`);
  }
//----------------------------------------------------------------------------------------------------
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
//----------------------------------------------------------------------------------------------------
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

  async openBottomSheet() {
      // https://stackoverflow.com/questions/60359019/how-to-return-data-from-matbottomsheet-to-its-parent-component
      const bottomSheetRef = this.bottomSheet.open(TrackSelectorBottomSheet);
      bottomSheetRef.afterDismissed().subscribe(async (unvalidatedContextElement: MediaContextElement) => {
        let mediaContext = await this.getMediaContextAsPromise();
        let index;
  
        if (mediaContext) {
          mediaContext.forEach((mediaContextElement: MediaContextElement, idk: number) => {
            if (mediaContextElement.id === unvalidatedContextElement.id) {
              index = mediaContextElement.id;
            }
          });
          await this.onNext(this.userHasInteractedWithUI ? true : false, index);
        }
      });
    }
}

// ----------------------------------------------------------------------------------------------------------------
// TODO: completely decouple bottomsheet from this component
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
        <input matSliderThumb [value]="getVolumeValue()"/>
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
  }

  close() { this.snackBarRef.dismiss(); }
  getVolumeValue() { return this.data.audioService.getVolume(); }

  onSliderChange(event: any) {
    const volume = Number(event.value ?? event.target?.value);
    this.data.audioService.setVolume(volume);
  }
}
