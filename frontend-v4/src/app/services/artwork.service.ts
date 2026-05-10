import { Injectable, signal } from '@angular/core';

import { environment } from '../../environments/environment.dev';

import { ApiService } from './api.service';
import { MediaContextElement } from '../interfaces/MediaContextElement';


@Injectable({ providedIn: 'root' })
export class ArtworkService {
  constructor(private apiService: ApiService) { }

  private defaultArtworkURL: string = environment.defaultArtworkImageURL;
  artworkURL = signal(this.defaultArtworkURL);

  public async loadArtwork(element: MediaContextElement) {
    let imageURL: string;

    if (element.artwork_filename_hash !== null) {
      let blob = await this.apiService.downloadArtworkImage(element.artwork_filename_hash);
      imageURL = URL.createObjectURL(blob);
    } else {
      imageURL = this.defaultArtworkURL;
    }

    this.artworkURL.set(imageURL);
  }
}
