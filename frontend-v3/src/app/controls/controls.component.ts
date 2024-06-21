import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';


@Component({
  selector: 'app-controls',
  templateUrl: './controls.component.html',
  styleUrl: './controls.component.css'
})

export class ControlsComponent implements OnInit {
  @Input() audioTrack: any;
  @Input() audioFilenamesData: any;
  @Input() selectedAudioIndex: any;
  @Input() numberOfTracks: any;
  @Output() selectedAudioIndexChange: EventEmitter<number> = new EventEmitter<number>();


  public audioTrackIsPlaying: boolean = false;


  ngOnInit(): void {
    let numberOfTracks = this.audioFilenamesData.filenames.length;
  }

  onPlayPauseClick() {
    if (this.audioTrackIsPlaying) {
      this.audioTrack.pause();
    } else {
      this.audioTrack.play();
    }
    this.audioTrackIsPlaying = !this.audioTrackIsPlaying;
  }

  pauseOnCycleThrough() {
    this.audioTrack.pause();
    this.audioTrackIsPlaying = false;
  }

  onNext() {
    this.pauseOnCycleThrough();

    if (this.selectedAudioIndex + 1 < this.numberOfTracks) {
      this.selectedAudioIndex += 1;
    } else {
      this.selectedAudioIndex = 0;
    }
    this.selectedAudioIndexChange.emit(this.selectedAudioIndex);
  }

  onPrevious() {
    this.pauseOnCycleThrough();

    if (this.selectedAudioIndex - 1 >= 0) {
      this.selectedAudioIndex -= 1;
    } else {
      this.selectedAudioIndex = this.numberOfTracks - 1;
    }
    this.selectedAudioIndexChange.emit(this.selectedAudioIndex);
  }
}
