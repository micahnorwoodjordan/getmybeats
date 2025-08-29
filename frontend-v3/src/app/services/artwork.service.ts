import { Injectable } from '@angular/core';

import { ApiService } from './api.service';


@Injectable({
    providedIn: 'root'
  })
  
export class ArtworkService {
  constructor(private apiService: ApiService) { }

  public async getImageSrcURL(artworkFilenameHash: string) {
    let fileBlob = await this.apiService.downloadArtworkImageAsPromise(artworkFilenameHash);
    if(fileBlob) {
      return URL.createObjectURL(fileBlob);
    }
    return '';
  }
}
