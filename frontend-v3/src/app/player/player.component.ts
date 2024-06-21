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
  audioFilenamesData: any;
  selectedAudioIndex = 0;
  numberOfTracks: any;

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.setInitialAudioState();
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
}
