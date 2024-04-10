import { Component } from '@angular/core';

import { ApiService } from './services/api/api.service';
import { IAudioContext } from './interfaces/iaudio.context';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})

export class AppComponent {
  title = 'frontend-v3';

  public audioContexts: IAudioContext[] | undefined;
  public initialAudioElement: HTMLAudioElement | undefined;

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {  // get full site context pertaining to audio media files and database entries
    console.log("AppComponent ngOnInit fired");
    this.apiService.getSiteAudioContext().subscribe(
      (response) => {
        this.audioContexts = response;
        this.logAudioContextRetrievalStatus();
      }
    );

    if (this.audioContexts !== undefined) {
      let route = this.audioContexts[0].filename;
      this.apiService.getAudioFile(route).subscribe(
        (response) => {
          let filename = response.headers.get('content-disposition')?.split(';')[1].split('=')[1];
          let blob = response.body;

          if (blob === null) {
            console.log("AppComponent could not parse API response");
          } else {
            this.initialAudioElement = new Audio(window.URL.createObjectURL(blob));
            this.logAudioElementInitializationStatus();
          }
        }
      );
    }
  }

  private logAudioElementInitializationStatus() {
    if (this.initialAudioElement === undefined) {
      console.log("AppComponent initialAudioElement retrieval: FAILED");
    } else {
      console.log("AppComponent initialAudioElement retrieval: SUCCESS");
    }
  }

  private logAudioContextRetrievalStatus() {  // log whether we successfully retrieved audio context data
    if (this.audioContexts === undefined) {
      console.log("AppComponent audio context data retrieval: UNDEFINED");
    } else {
      if (this.audioContexts.length > 0) {
        console.log("AppComponent audio context data retrieval: SUCCESS");
      } else {
        console.log("AppComponent audio context data retrieval: FAILED");
      }
    }
  }
}
