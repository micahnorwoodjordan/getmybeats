import { Component, OnInit } from '@angular/core';


@Component({
  selector: 'app-controls',
  templateUrl: './controls.component.html',
  styleUrl: './controls.component.css'
})

export class ControlsComponent implements OnInit {
  public currentAudioTrackIsPlaying: boolean = false;
  public currentAudioTrack = new Audio("../assets/corporate.wav");

  ngOnInit(): void {
    this.currentAudioTrack.load();
  }

  onPlayPauseClick() {
    if (this.currentAudioTrackIsPlaying) {
      this.currentAudioTrack.pause();
    } else {
      this.currentAudioTrack.play();
    }

    this.currentAudioTrackIsPlaying = !this.currentAudioTrackIsPlaying;
  }
}
