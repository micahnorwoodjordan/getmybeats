import { Component, OnInit, OnDestroy } from '@angular/core';

import { environment } from 'src/environments/environment';
import { ApiService } from '../../services/api.service';
import { Audio2Service } from '../../services/audio2.service';


@Component({
  selector: 'app-player2',
  templateUrl: './player2.component.html',
  styleUrl: './player2.component.css'
})
export class Player2Component implements OnInit, OnDestroy {
    constructor(private audio2Service: Audio2Service, private apiService: ApiService) { }

    public userExperienceReportUrl: string = `${environment.apiHost}/user/experience`
    public browserSupportsAudioVolumeManipulation: boolean = true;

    public getIsPlaying() { return this.audio2Service.getIsPlaying(); }
    public getCurrentTime() { return this.audio2Service.getCurrentTime(); }
    public getDuration() { return this.audio2Service.getDuration(); }
    public getAudioArtworkImageSrc() { return this.audio2Service.getArtworkImageSrc(); }
    public getLoading() { return this.audio2Service.getLoading(); }
    public getDownloadProgress() { return this.audio2Service.getDownloadProgress(); }
    public getTitle() { return this.audio2Service.getTitle(); }
    public getShuffleEnabled() { return this.audio2Service.getShuffleEnabled(); }
    public getRepeatEnabled() { return this.audio2Service.getRepeatEnabled();  }

    private setCurrentPlaybackTime(newValue: number) { this.currentPlaybackTime = newValue; }

    public currentPlaybackTime: number = 0;
    public artworkImage: HTMLImageElement = new Image();
    public audioHasArtwork: boolean = false;
    public hasPlaybackError: boolean = false;
    private currentPlaybackTimeRepaintMillis: number = 500;

  async ngOnInit() {
    this.audio2Service.getDecryptedAudio();
    setInterval(() => {
      this.setCurrentPlaybackTime(this.getCurrentTime());
    }, this.currentPlaybackTimeRepaintMillis);

    // await this.audio2Service.loadFromArrayBuffer(decrypted);
  }

  ngOnDestroy() {
    this.audio2Service.destroy();
  }

  togglePlay() {
    if (this.getIsPlaying()) {
      this.audio2Service.pause();
    } else {
      this.audio2Service.play();
    }
  }

  onSeek(event: Event) {
    const input = event.target as HTMLInputElement;
    this.audio2Service.seek(parseFloat(input.value));
  }

  onClickShuffle() { }
  onPrevious() { }
  onNext() { }
  onPlayPauseClick() { }
  onClickRepeat() { }
  openBottomSheet() { }
  openCustomSnackBar() { }
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
}
