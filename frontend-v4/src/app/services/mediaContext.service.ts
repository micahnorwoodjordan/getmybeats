import { Injectable } from '@angular/core';

import { ApiService } from './api.service';
import { MediaContextElement } from '../interfaces/MediaContextElement';


@Injectable({
  providedIn: 'root'
})

export class MediaContextService {
  constructor(private apiService: ApiService) { }
  public mediaContext: MediaContextElement[] = [];

  public setMediaContext(newContext: MediaContextElement[]) { this.mediaContext = newContext; }
  public getMediaContext(): MediaContextElement[] { return this.mediaContext; }

  public async refreshMediaContext() {
    this.setMediaContext(await this.apiService.getMediaContext());
    }
}
