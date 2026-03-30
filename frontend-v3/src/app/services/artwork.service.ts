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
      console.log('BEGIN loadAudioArtworkImage');
      let artworkFilenameHash = mediaContext[audioIndex].artwork_filename_hash;
    
      if (!artworkFilenameHash) {
        this.setArtworkIsValid(false);
        console.log('REPORT loadAudioArtworkImage: no associated artwork');
        return;
      }
  
      let imageSrc = await this.getImageSrcURL(artworkFilenameHash);
      if(imageSrc !== '') {
        this.setArtworkIsValid(true);
        this.setArtworkImageSrc(imageSrc);
        console.log('END loadAudioArtworkImage');
      } else {
        console.error('ERROR loadAudioArtworkImage: associated artwork exists but could not be found');
      }
    }
//----------------------------------------------------------------------------------------------------
}
