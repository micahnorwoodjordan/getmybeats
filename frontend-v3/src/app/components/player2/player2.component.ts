import { Inject, Component, OnInit, OnDestroy, effect } from '@angular/core';
import { MatSnackBar, MAT_SNACK_BAR_DATA, MatSnackBarRef} from '@angular/material/snack-bar';
import { MatSliderModule } from '@angular/material/slider';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { environment } from 'src/environments/environment';
import { Audio2Service } from '../../services/audio2.service';
import { ArtworkService } from 'src/app/services/artwork.service';
import { MediaContextElement } from 'src/app/interfaces/MediaContextElement';
import { ApiService } from 'src/app/services/api.service';

@Component({
  selector: 'app-player2',
  templateUrl: './player2.component.html',
  styleUrl: './player2.component.css'
})
export class Player2Component implements OnInit, OnDestroy {
  constructor(
    private audio2Service: Audio2Service,
    private artworkService: ArtworkService,
    private apiService: ApiService,
    private _snackBar: MatSnackBar
  ) {
    let lastAudioFetchCycle = 0;

    effect(() => {
      const currentAudioFetchCycle = this.audio2Service.audioFetchCycle();

      if (currentAudioFetchCycle > lastAudioFetchCycle) {
        this.onNext();
      }

      lastAudioFetchCycle = currentAudioFetchCycle;
    });
  }
  //----------------------------------------------------------------------------------------------------
  public downloadProgress: number = 0;  // TODO
  public title: string = 'null';
  public loading: boolean = false;  // TODO
  public shuffleEnabled: boolean = false;  // TODO
  public repeatEnabled: boolean = false;  // TODO
  public hasPlaybackError: boolean = false;  // TODO
  public artworkImage: HTMLImageElement = new Image();
  public browserSupportsAudioVolumeManipulation: boolean = true;
  public userExperienceReportUrl: string = `${environment.apiHost}/user/experience`;
  public currentTime: number = 0;
  public currentTimeHumanReadable: string = '';
  public duration: number = 0;
  public durationHumanReadable: string = '';
  public isPlaying = false;
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

  public getTitle() { return this.audio2Service.getTitle(); }
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
  
  private async getMediaContextAsPromise() { return await this.apiService.getMediaContextAsPromise(); }
  //----------------------------------------------------------------------------------------------------

  async ngOnInit() {
    this.setBrowserSupportsAudioVolumeManipulation(this.doesBrowserSupportVolumeManipulation());
    let mediaContext = await this.getMediaContextAsPromise();

    if (mediaContext !== undefined) {
      this.setMediaContext(mediaContext);
      await this.audio2Service.loadMediaContextElement(this.mediaContext, this.selectedAudioIndex, false);
      await this.artworkService.loadAudioArtworkImage(this.mediaContext, this.selectedAudioIndex);
      this.setAudioArtworkImageSrc(this.artworkService.getArtworkImageSrc());
    }

    this.intervalId = setInterval(() => {
      this.currentTime = this.audio2Service.getCurrentTime();
      this.duration = this.audio2Service.getDuration();
      this.setCurrentTimeHumanReadable();
      this.setDurationHumanReadable();
    }, 500);
  }

  ngOnDestroy() {
    clearInterval(this.intervalId);
  }
//----------------------------------------------------------------------------------------------------
  togglePlay() {
    if (this.isPlaying) {
      this.audio2Service.pause();
    } else {
      this.audio2Service.play();
    }
    this.setIsPlaying(!this.isPlaying);
  }

  onSeek(e: Event) {
    const val = +(e.target as HTMLInputElement).value;
    this.audio2Service.seek(val);
    this.currentTime = val;
  }

  async onNext() {
    let mediaContext = await this.getMediaContextAsPromise();
    if (mediaContext !== undefined) {
      this.setMediaContext(mediaContext);
      this.setNextAudioIndex();
      await this.audio2Service.onNext(this.mediaContext, this.selectedAudioIndex, true);
      this.setIsPlaying(true);
      await this.artworkService.loadAudioArtworkImage(this.mediaContext, this.selectedAudioIndex);
      this.setAudioArtworkImageSrc(this.artworkService.getArtworkImageSrc());
      return;
    }
    console.log('PlayerComponent.onNext: could not get media context');
  }

  async onPrevious() {
    let mediaContext = await this.getMediaContextAsPromise();
    if (mediaContext !== undefined) {
      this.setMediaContext(mediaContext);
      this.setPreviousAudioIndex();
      await this.audio2Service.onPrevious(this.mediaContext, this.selectedAudioIndex, false);
      this.setIsPlaying(false);
      await this.artworkService.loadAudioArtworkImage(this.mediaContext, this.selectedAudioIndex);
      this.setAudioArtworkImageSrc(this.artworkService.getArtworkImageSrc());
      return;
    }
    console.log('PlayerComponent.onPrevious: could not get media context');
  }

   private setCurrentTimeHumanReadable() {
    let currentMinutes = Math.floor(this.currentTime / 60);
    let currentSeconds = Math.round(this.currentTime % 60);
    this.currentTimeHumanReadable = `${currentMinutes}` + ':' + (currentSeconds < 10 ? `0${currentSeconds}` : `${currentSeconds}`);
  }

  private setDurationHumanReadable() {
    let minutes = Math.floor(this.duration / 60);
    let seconds = Math.round(this.duration % 60);
    this.durationHumanReadable = `${minutes}` + ':' + (seconds < 10 ? `0${seconds}` : `${seconds}`);
  }
//----------------------------------------------------------------------------------------------------
  onClickShuffle() { }
  onClickRepeat() { }
  openBottomSheet() { }
  openCustomSnackBar() {
      if (this.snackbarOpen) {
        if (this.snackbarRef) {
          this.snackbarRef.dismiss();
          this.setSnackbarOpen(false);
        }
      } else {
        const snackbarRef = this._snackBar.openFromComponent(VolumeSliderSnackbar, {
          data: {
            audio2Service: this.audio2Service,
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
  getVolumeValue() { return this.data.audio2Service.getVolume(); }

  onSliderChange(event: any) {
    const volume = Number(event.value ?? event.target?.value);
    this.data.audio2Service.setVolume(volume);
  }
}
