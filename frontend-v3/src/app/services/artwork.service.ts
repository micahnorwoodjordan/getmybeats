import { Injectable } from '@angular/core';

import { ApiService } from './api.service';
import { MediaContextElement } from '../interfaces/MediaContextElement';


@Injectable({
    providedIn: 'root'
  })
  
export class ArtworkService {
  constructor(private apiService: ApiService) { }
//----------------------------------------------------------------------------------------------------
  public artworkIsValid: boolean = false;
  public artworkImageSrc: string = '';
//----------------------------------------------------------------------------------------------------
  public getArtworkIsValid() { return this.artworkIsValid; }
  public getArtworkImageSrc() { return this.artworkImageSrc; }
  private setArtworkIsValid(newValue: boolean) { this.artworkIsValid = newValue; }
  private setArtworkImageSrc(newSrc: string) { this.artworkImageSrc = newSrc; }
//----------------------------------------------------------------------------------------------------
  private async getImageSrcURL(artworkFilenameHash: string) {
    let fileBlob = await this.apiService.downloadArtworkImageAsPromise(artworkFilenameHash);
    if(fileBlob) {
      return URL.createObjectURL(fileBlob);
    }
    return '';
  }
//----------------------------------------------------------------------------------------------------
  public async loadAudioArtworkImage(mediaContext: MediaContextElement[], audioIndex: number) {
      console.log('loadAudioArtworkImage: begin');
      let artworkFilenameHash = mediaContext[audioIndex].artwork_filename_hash;
    
      if (!artworkFilenameHash) {
        this.setArtworkIsValid(false);
        console.log('loadAudioArtworkImage: no artwork hash');
        return;
      }
  
      let imageSrc = await this.getImageSrcURL(artworkFilenameHash);
      if(imageSrc !== '') {
        console.log('loadAudioArtworkImage: retrieved image source');
        this.setArtworkIsValid(true);
        this.setArtworkImageSrc(imageSrc);
      } else {
        console.log('loadAudioArtworkImage: no context/audio index');
      }
      console.log('loadAudioArtworkImage: end');
    }
//----------------------------------------------------------------------------------------------------
}
