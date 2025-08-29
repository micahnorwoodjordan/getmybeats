import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { environment } from 'src/environments/environment';
import { ReleaseDate } from 'src/app/interfaces/ReleaseDate';
import { MediaContextElement } from '../interfaces/MediaContextElement';


@Injectable({
  providedIn: 'root'
})

export class ApiService {
  constructor(private httpClient: HttpClient) { }

  postNewEncryptionKey(key: Uint8Array, requestGUID: string) {
    let location = '/media/audio/playbackrequest/';
    let url = environment.apiHost + location;
    let requestHeaders = new HttpHeaders().set('Audio-Request-Id', requestGUID);
    let payload = { playbackRequestKey: key };
    return this.httpClient.post(url, payload, { responseType: 'json', headers: requestHeaders }).toPromise();
  }

  getMediaContext() {
    let location = '/media/context/';
    let url = environment.apiHost + location;
    return this.httpClient.get<Array<MediaContextElement>>(
      url,
      {
        observe: 'events',
        reportProgress: true,
        responseType: 'json'
      }
    );
  }

  getMediaContextAsPromise() {
    let location = '/media/context/';
    let url = environment.apiHost + location;
    return this.httpClient.get<MediaContextElement[]>(url, { responseType: 'json' }).toPromise();
  }

  downloadAudioTrack(filenameHash: string, requestGUID: string) {
    let location = '/media/audio/hash/' + filenameHash;
    let url = environment.apiHost + location;
    let requestHeaders = new HttpHeaders().set('Audio-Request-Id', requestGUID);
    return this.httpClient.get(
      url,
      {
        observe: 'events',
        responseType: 'blob',
        reportProgress: true,
        headers: requestHeaders
      }
    );
  }

  downloadAudioTrackAsPromise(filenameHash: string, requestGUID: string) {
    let location = '/media/audio/hash/' + filenameHash;
    let url = environment.apiHost + location;
    let requestHeaders = new HttpHeaders().set('Audio-Request-Id', requestGUID);
    return this.httpClient.get(url, { responseType: 'blob', headers: requestHeaders }).toPromise();
  }

  downloadArtworkImageAsPromise(filenameHash: string) {
    let location = '/media/image/hash/' + filenameHash;
    let url = environment.apiHost + location;
    return this.httpClient.get(url, { responseType: 'blob' }).toPromise();
  }

  getLastRelease() {
    let location = '/releases/-1/';
    let url = environment.apiHost + location;
    return this.httpClient.get<ReleaseDate>(
      url,
      {
        observe: 'events',
        reportProgress: true,
        responseType: 'json'
      }
    );
  }
}
