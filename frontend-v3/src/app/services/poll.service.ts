import { Injectable } from '@angular/core';

import { environment } from 'src/environments/environment';
import { AudioService } from './audio.service';


@Injectable({
  providedIn: 'root'
})
export class PollService {
  constructor(private audioService: AudioService) { }

  private POLL_TIMESTAMP_MINUTES: number = 2;
  private POLL_TIMESTAMP_SECONDS_UPPER_THRESHOLD: number = 10;
  private POLL_TIMESTAMP_SECONDS_LOWER_THRESHOLD: number = 0;
  private POLL_TIMESTAMP_MILLIS_UPPER_THRESHOLD: number = 400;
  private POLL_TIMESTAMP_MILLIS_LOWER_THRESHOLD: number = 200;
  
  public evaluateCurrentTimeForMediaContextUpdate() {
    let currentDate = new Date();
    let currentMillis = currentDate.getMilliseconds();
    let currentSeconds = currentDate.getSeconds();
    let currentMinutes = currentDate.getMinutes();

    let doPollForNewContext = (
        currentMinutes % this.POLL_TIMESTAMP_MINUTES === 0 &&
        currentSeconds >= this.POLL_TIMESTAMP_SECONDS_LOWER_THRESHOLD &&
        currentSeconds <= this.POLL_TIMESTAMP_SECONDS_UPPER_THRESHOLD &&
        currentMillis >= this.POLL_TIMESTAMP_MILLIS_LOWER_THRESHOLD &&
        currentMillis <= this.POLL_TIMESTAMP_MILLIS_UPPER_THRESHOLD
    );

    if (doPollForNewContext) {
        this.audioService.setContextExternal();
    }
  }

}
