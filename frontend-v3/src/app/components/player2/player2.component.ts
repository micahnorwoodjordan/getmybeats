import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { Audio2Service } from '../../services/audio2.service';


@Component({
  selector: 'app-player2',
  templateUrl: './player2.component.html',
  styleUrl: './player2.component.css'
})
export class Player2Component implements OnInit, OnDestroy {
    constructor(private audio2Service: Audio2Service, private apiService: ApiService) { }

    getIsPlaying() { return this.audio2Service.isPlaying(); }
    getCurrentTime() { return this.audio2Service.currentTime; }
    getDuration() { return this.audio2Service.duration; }

  async ngOnInit() {
    this.audio2Service.getDecryptedAudio();
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
