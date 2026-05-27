import { firstValueFrom, Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpEvent } from '@angular/common/http';


import { environment } from '../../environments/environment.dev';
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
    return firstValueFrom(this.httpClient.post(url, payload,{ responseType: 'json', headers: requestHeaders }));
  }

  getMediaContext(): Promise<MediaContextElement[]> {
    let location = '/media/context/';
    let url = environment.apiHost + location;
    return firstValueFrom(this.httpClient.get<MediaContextElement[]>(url));
  }

  downloadAudioTrack(filenameHash: string, requestGUID: string): Observable<HttpEvent<Blob>> {
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

  downloadArtworkImage(filenameHash: string): Promise<Blob> {
    let location = '/media/image/hash/' + filenameHash;
    let url = environment.apiHost + location;
    return firstValueFrom(this.httpClient.get(url, { responseType: 'blob' }));
  }
}
