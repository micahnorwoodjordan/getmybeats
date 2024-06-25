import { Component, OnInit } from '@angular/core';
import * as moment from 'moment';

import { ApiService } from '../api-service';


@Component({
  selector: 'app-player',
  templateUrl: './player.component.html',
  styleUrl: './player.component.css'
})

export class PlayerComponent implements OnInit {
  audioTrack: any;
  audioTrackIsReady = false;
  audioFilenamesData: any;
  selectedAudioIndex = 0;
  numberOfTracks: any;
  audioTrackIsPlaying: boolean = false;
  musicLength: string = '0:00';
  duration: number = 1;
  currentTime: string = '0:00';

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.setInitialAudioState();

    this.audioTrack.ondurationchange = () => {
      const totalSeconds = Math.floor(this.audioTrack.duration), duration = moment.duration(totalSeconds, 'seconds');
      this.musicLength = duration.seconds() < 10 ? 
        `${Math.floor(duration.asMinutes())}:
        0${duration.seconds()}` : 
        `${Math.floor(duration.asMinutes())}:
        ${duration.seconds()}`;
      this.duration = totalSeconds;
    }

    this.audioTrack.ontimeupdate = () => {
      const duration = moment.duration(Math.floor(this.audioTrack.currentTime), 'seconds');
      this.currentTime = duration.seconds() < 10 ? 
          `${Math.floor(duration.asMinutes())}:
          0${duration.seconds()}` : 
          `${Math.floor(duration.asMinutes())}:
          ${duration.seconds()}`;
    }
  }

  async setInitialAudioState() {
    // https://balramchavan.medium.com/using-async-await-feature-in-angular-587dd56fdc77
    this.audioFilenamesData = await this.apiService.getAudioFilenames();
    this.numberOfTracks = this.audioFilenamesData.filenames.length;
    let audioFilename = this.audioFilenamesData.filenames[this.selectedAudioIndex];
    this.audioTrack = this.apiService.getAudioTrack(audioFilename);
    this.audioTrack.load();
    this.audioTrackIsReady = true;
  }
  onSelectedAudioIndexChange(newIndex: number) {
    this.selectedAudioIndex = newIndex;
    let audioFilename = this.audioFilenamesData.filenames[this.selectedAudioIndex];
    this.audioTrack = this.apiService.getAudioTrack(audioFilename);
    console.log(audioFilename);
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
    this.onSelectedAudioIndexChange(this.selectedAudioIndex);
  }

  onPrevious() {
    this.pauseOnCycleThrough();

    if (this.selectedAudioIndex - 1 >= 0) {
      this.selectedAudioIndex -= 1;
    } else {
      this.selectedAudioIndex = this.numberOfTracks - 1;
    }
    this.onSelectedAudioIndexChange(this.selectedAudioIndex);
  }

  onSliderChange(event: any) {
    this.audioTrack.currentTime = event.value;
  }
}
