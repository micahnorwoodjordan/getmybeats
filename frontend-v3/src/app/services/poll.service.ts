import { Injectable } from '@angular/core';

import { environment } from 'src/environments/environment';
import { AudioService } from './audio.service';


@Injectable({
  providedIn: 'root'
})
export class PollService {
  constructor(private audioService: AudioService) { }
  
  public evaluateCurrentTimeForMediaContextUpdate() {
    let currentDate = new Date();

    let currentMillis = currentDate.getMilliseconds();
    let currentSeconds = currentDate.getSeconds();
    let currentMinutes = currentDate.getMinutes();

    let millisecondsUpperThreshold = 400;
    let millisecondsLowerThreshold = 200;
    let secondTimestamp = 15;

    let doPollForNewContext = (
    currentMinutes % environment.audioContextPollMinutesInterval === 0 &&
    currentSeconds === secondTimestamp &&
    currentMillis >= millisecondsLowerThreshold &&
    currentMillis <= millisecondsUpperThreshold
    );

    if (doPollForNewContext) {
        this.audioService.setContextExternal();
    }
  }

}
