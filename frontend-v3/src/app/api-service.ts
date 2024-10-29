import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { environment } from 'src/environments/environment';


@Injectable({
  providedIn: 'root'
})

export class ApiService {
  constructor(private httpClient: HttpClient) { }

  getMediaContext() {
    let location = '/media/context/';
    let url = environment.apiHost + location;
    return this.httpClient.get(url).toPromise();
  }

  getMaskedAudioTrack(filenameHash: string, requestGUID: string) {
    let location = '/media/hash/' + filenameHash;
    let url = environment.apiHost + location;
    let requestHeaders = new HttpHeaders().set('Request-Id', requestGUID);
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

  getLastRelease() {
    let location = '/releases/-1/';
    let url = environment.apiHost + location;
    return this.httpClient.get(url).toPromise();
  }
}
