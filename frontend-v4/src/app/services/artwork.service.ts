import { Injectable, signal } from '@angular/core';

import { ApiService } from './api.service';
import { MediaContextElement } from '../interfaces/MediaContextElement';


@Injectable({ providedIn: 'root' })
export class ArtworkService {
  constructor(private apiService: ApiService) { }

  artworkURL = signal("http://localhost/placeholder.png");

  public async loadArtwork(element: MediaContextElement) {
    let blob = await this.apiService.downloadArtworkImage(element.artwork_filename_hash);
    let imageURL: string = URL.createObjectURL(blob);
    this.artworkURL.set(imageURL);
    console.log(this.artworkURL);
  }
}
