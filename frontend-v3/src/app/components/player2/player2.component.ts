import { Component, OnInit, OnDestroy } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { Audio2Service } from '../../services/audio2.service';


@Component({
  selector: 'app-player2',
  templateUrl: './player2.component.html',
  styleUrl: './player2.component.css'
})
export class Player2Component implements OnInit, OnDestroy {
    constructor(private audio2Service: Audio2Service, private apiService: ApiService) { }

    public getIsPlaying() { return this.audio2Service.isPlaying(); }
    public getCurrentTime() { return this.audio2Service.currentTime(); }
    public getDuration() { return this.audio2Service.duration; }
    private setCurrentTime(newValue: number) { this.currentPlaybackTime = newValue; }

    public currentPlaybackTime: number = 0;
    private currentPlaybackTimeRepaintMillis: number = 500;

  async ngOnInit() {
    this.audio2Service.getDecryptedAudio();
    setInterval(() => {
      this.setCurrentTime(this.getCurrentTime());
    }, this.currentPlaybackTimeRepaintMillis);

    // await this.audio2Service.loadFromArrayBuffer(decrypted);
  }

  ngOnDestroy() {
    this.audio2Service.destroy();
  }

  togglePlay() {
    if (this.audio2Service.isPlaying()) {
      this.audio2Service.pause();
    } else {
      this.audio2Service.play();
    }
  }

  onSeek(event: Event) {
    const input = event.target as HTMLInputElement;
    this.audio2Service.seek(parseFloat(input.value));
  }
}
