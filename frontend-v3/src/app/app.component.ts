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
  public contexts: IAudioContext[] | undefined;

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    console.log("AppComponent ngOnInit fired");
    this.apiService.getSiteAudioContext().subscribe(
      (contexts) => {
        this.contexts = contexts;
        this.logAudioContextRetrievalStatus();
      }
    );
  }

  private logAudioContextRetrievalStatus() {  // log whether we successfully retrieved audio context data
    if (this.contexts === undefined) {
      console.log("AppComponent audio context data retrieval: UNDEFINED");
    } else {
      if (this.contexts.length > 0) {
        console.log("AppComponent audio context data retrieval: SUCCESS");
      } else {
        console.log("AppComponent audio context data retrieval: FAILED");
      }
    }
  }
}
