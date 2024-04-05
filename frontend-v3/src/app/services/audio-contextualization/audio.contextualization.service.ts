import { Injectable } from '@angular/core';

import { IAudioContext } from "../../interfaces/iaudio.context";


@Injectable({
  providedIn: 'root'
})

export class AudioContextualizationService {
  constructor(
    private rawAudioElements: Array<HTMLAudioElement>,
    private rawImageElements: Array<HTMLImageElement>
  ) {}

  getAudioContexts() {
    const audioContexts: Array<IAudioContext> = [];

    this.rawAudioElements.map((rawAudio, idx) => {
      var context: IAudioContext = {
        title: rawAudio.src,
        artist: "me",
        image: this.rawImageElements[idx],  // backend needs to finish embeddeding
        audio: rawAudio  // backend needs to finish embeddeding
      }
      audioContexts.push(context);
    });

    return audioContexts;
  }
}
