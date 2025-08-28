import { Component, OnInit, OnDestroy, effect, computed } from '@angular/core';
import { environment } from 'src/environments/environment';
import { Audio2Service } from '../../services/audio2.service';

@Component({
  selector: 'app-player2',
  templateUrl: './player2.component.html',
  styleUrl: './player2.component.css'
})
export class Player2Component implements OnInit, OnDestroy {
  constructor(public audio2Service: Audio2Service) {
    let lastAudioFetchCycle = 0;

    effect(() => {
      const currentAudioFetchCycle = this.audio2Service.audioFetchCycle();

      if (currentAudioFetchCycle > lastAudioFetchCycle) {
        this.onNext();
      }

      lastAudioFetchCycle = currentAudioFetchCycle;
    });
  }

  public audioHasArtwork: boolean = false;  // TODO
  public downloadProgress: number = 0;  // TODO
  public title: string = 'null';  // TODO
  public loading: boolean = false;  // TODO
  public shuffleEnabled: boolean = false;  // TODO
  public repeatEnabled: boolean = false;  // TODO
  public hasPlaybackError: boolean = false;  // TODO
  public artworkImage: HTMLImageElement = new Image();  // TODO
  public browserSupportsAudioVolumeManipulation: boolean = true;  // TODO
  public userExperienceReportUrl: string = `${environment.apiHost}/user/experience`;
  public currentTime: number = 0;
  public currentTimeHumanReadable: string = '';
  public duration: number = 0;
  public durationHumanReadable: string = '';
  public isPlaying = false;

  private selectedAudioIndex = 0;
  private intervalId: any;

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

  private setSelectedAudioIndex(newIndex: number) { this.selectedAudioIndex = newIndex; }
  private setIsPlaying(newValue: boolean) { this.isPlaying = newValue; }

  public getTitle() { return this.audio2Service.getTitle(); }
  
  private getMediaContext() { return this.audio2Service.getMediaContext(); }

  private setNextAudioIndex() {
        let currentIndex = this.selectedAudioIndex;

        if (currentIndex + 1 < this.getMediaContext().length) {
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
          this.setSelectedAudioIndex(this.getMediaContext().length - 1);
        }
    }

  async ngOnInit() {
    await this.audio2Service.initialize(this.selectedAudioIndex);

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
    this.setNextAudioIndex();
    await this.audio2Service.getDecryptedAudio(this.selectedAudioIndex, true);
  }

  async onPrevious() {
    this.setPreviousAudioIndex();
    await this.audio2Service.getDecryptedAudio(this.selectedAudioIndex, false);
  }

  onClickShuffle() { }
  onClickRepeat() { }
  openBottomSheet() { }
  openCustomSnackBar() { }
}
