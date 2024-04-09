import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { environment } from 'src/environments/environment';
import { IAudioContext } from 'src/app/interfaces/iaudio.context';


@Injectable({
  providedIn: 'root'
})

export class ApiService {
  private host: string = environment.apiHost;

  constructor(private client: HttpClient) { }

  getSiteAudioContext() {
    let url = `${this.host}/context/`;
    return this.client.get<IAudioContext[]>(url);
  }

}
