import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { environment } from 'src/environments/environment';


@Injectable({
  providedIn: 'root'
})

export class ApiService {

  private baseApiMediaUrl = environment.apiHost + environment.apiMediaPath;
  private baseLocalMediaPath = environment.localMediaPath;

  constructor(private httpClient: HttpClient) { }

  getAudioFilenames() {
    let location = '/audio-filenames';
    let url = environment.apiHost + location;
    return this.httpClient.get(url).toPromise();
  }

  getAudioTrack(audioTitle: string) {
    let url = this.baseLocalMediaPath + audioTitle
    return new Audio(url);
  }
}
