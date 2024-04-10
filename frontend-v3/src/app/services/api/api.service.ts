import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { environment } from 'src/environments/environment';
import { IAudioContext } from 'src/app/interfaces/iaudio.context';


@Injectable({
  providedIn: 'root'
})

export class ApiService {
  private apiHost: string = environment.apiHost;
  private apiMediaDir: string = environment.apiMediaDir;

  constructor(private client: HttpClient) { }

  getSiteAudioContext() {
    let route = 'context/';
    let url = `${this.apiHost}/${route}`;
    return this.client.get<IAudioContext[]>(url);
  }

  getAudioFile(route: string) {
    let url = `${this.apiHost}/${this.apiMediaDir}/${route}`;
    return this.client.get(url, {observe: 'response', responseType: 'blob'});
  }
}
