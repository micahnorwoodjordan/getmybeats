import { Component, OnInit, OnDestroy, effect, computed } from '@angular/core';
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
    private apiService: ApiService
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
  public browserSupportsAudioVolumeManipulation: boolean = true;  // TODO
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
  openCustomSnackBar() { }
}
