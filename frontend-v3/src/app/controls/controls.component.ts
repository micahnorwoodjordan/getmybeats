import { Component, OnInit } from '@angular/core';


@Component({
  selector: 'app-controls',
  templateUrl: './controls.component.html',
  styleUrl: './controls.component.css'
})

export class ControlsComponent implements OnInit {
  // private audioContextualizationService = new AudioContextualizationService(
  //   Array.from(document.getElementsByTagName("audio")),
  //   Array.from(document.getElementsByTagName("img")).filter((image => {true})),  // embed some key into the img from in backend
  // ); 

  public currentAudioTrackIsPlaying: boolean = false;
  // public audioContexts = this.audioContextualizationService.getAudioContexts();
  // public currentAudioTrack = new Audio(this.audioContexts[0].audio.src);

  ngOnInit(): void {
    // this.currentAudioTrack.load();
  }

  onPlayPauseClick() {
  //   if (this.currentAudioTrackIsPlaying) {
  //     this.currentAudioTrack.pause();
  //   } else {
  //     this.currentAudioTrack.play();
  //   }

    this.currentAudioTrackIsPlaying = !this.currentAudioTrackIsPlaying;
  }
}
