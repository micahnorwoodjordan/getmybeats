import { Component, OnInit, Input } from '@angular/core';


@Component({
  selector: 'app-controls',
  templateUrl: './controls.component.html',
  styleUrl: './controls.component.css'
})

export class ControlsComponent implements OnInit {
  @Input() audioTrack: any;
  public audioTrackIsPlaying: boolean = false;


  ngOnInit(): void { }

  onPlayPauseClick() {
    if (this.audioTrackIsPlaying) {
      this.audioTrack.pause();
    } else {
      this.audioTrack.play();
    }
    this.audioTrackIsPlaying = !this.audioTrackIsPlaying;
  }
}
