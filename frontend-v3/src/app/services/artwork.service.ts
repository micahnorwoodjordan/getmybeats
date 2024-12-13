import { Injectable } from '@angular/core';

import { HttpEventType } from '@angular/common/http';

import { ApiService } from './api.service';


@Injectable({
    providedIn: 'root'
  })
  
export class ArtworkService {
    public audioArtwork: HTMLImageElement = new Image();

    constructor(private apiService: ApiService) { }

    public getAudioArtworkImage() { return this.audioArtwork; }

    public getAndLoadAudioArtwork(filenameHash: string) {
        console.log('getAndLoadAudioArtwork fired');
        let imageSrc = '';
        this.audioArtwork.src = '';
    
        this.apiService.getMaskedAudioArtworkImage(filenameHash).subscribe(
          event => {
            switch (event.type) {
              case HttpEventType.DownloadProgress:
                if (event.total !== undefined) {
                  console.log(`getAndLoadAudioArtwork: ${Math.round((event.loaded / event.total) * 100)}% of data fetched`);
                }
                break;
              case HttpEventType.Response:
                console.log(`getAndLoadAudioArtwork: received server response ${event.status}`);
    
                if (event.status == 200) {
                  if (event.body !== undefined && event.body !== null) {
                    imageSrc = URL.createObjectURL(event.body);
                    this.audioArtwork.src = imageSrc;
                  }
                } else {
                  console.log('getAndLoadAudioArtwork: ERROR fetching audio');
                }
                
                break;
              default:
                console.log('getAndLoadAudioArtwork: no response from server yet');
            }
          },
          error => {
            console.log(`getAndLoadAudioArtwork ERROR: ${error.toString()}`);
          }
        );
      } 
}