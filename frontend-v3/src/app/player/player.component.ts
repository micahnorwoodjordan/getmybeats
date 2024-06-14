import { Component, OnInit } from '@angular/core';
import { ApiService } from '../api-service';

@Component({
  selector: 'app-player',
  templateUrl: './player.component.html',
  styleUrl: './player.component.css'
})

export class PlayerComponent implements OnInit {
  audioTrack: any;
  audioTrackIsReady = false;

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.audioTrack = this.apiService.getAudioTrack('corporate.wav');  // wire up db for dynamic titles
    this.audioTrack.load();
    this.audioTrackIsReady = true;
  }
}
