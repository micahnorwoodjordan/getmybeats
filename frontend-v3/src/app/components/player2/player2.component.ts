import { Component, OnInit, OnDestroy } from '@angular/core';
import { environment } from 'src/environments/environment';
import { Audio2Service } from '../../services/audio2.service';

@Component({
  selector: 'app-player2',
  templateUrl: './player2.component.html',
  styleUrl: './player2.component.css'
})
export class Player2Component implements OnInit, OnDestroy {
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

  constructor(public audio: Audio2Service) {}

  async ngOnInit() {
    await this.audio.getDecryptedAudio();

    this.intervalId = setInterval(() => {
      this.currentTime = this.audio.getCurrentTime();
      this.duration = this.audio.getDuration();
      this.setCurrentTimeHumanReadable();
      this.setDurationHumanReadable();
    }, 500);
  }

  ngOnDestroy() {
    clearInterval(this.intervalId);
  }

  togglePlay() {
    if (this.isPlaying) {
      this.audio.pause();
    } else {
      this.audio.play();
    }
    this.isPlaying = !this.isPlaying;
  }

  onSeek(e: Event) {
    const val = +(e.target as HTMLInputElement).value;
    this.audio.seek(val);
    this.currentTime = val;
  }
  onPrevious() { }
  onNext() { }
  onClickShuffle() { }
  onClickRepeat() { }
  openBottomSheet() { }
  openCustomSnackBar() { }
}
