import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { environment } from 'src/environments/environment';


@Injectable({
  providedIn: 'root'
})

export class ApiService {
  constructor(private httpClient: HttpClient) { }

  getAudioFilenames() {
    let location = '/audio-filenames';
    let url = environment.apiHost + environment.apiPath + location;
    return this.httpClient.get(url).toPromise();
  }

  getAudioTrack(audioTitle: string) {
    let url = environment.apiMediaPath + audioTitle + '?' + 'audio_access_token=' + environment.apiAudioAccessToken;
    return new Audio(url);
  }

  getLastRelease() {
    let location = '/releases/-1/';
    let url = environment.apiHost + environment.apiPath + location;
    return this.httpClient.get(url).toPromise();
  }
}
