import { Injectable } from '@angular/core';

import { ApiService } from './api-service';
import { environment } from 'src/environments/environment';


@Injectable({
  providedIn: 'root'
})
export class PollService {
  private intervalId: any;
  private hashesWereRotated: boolean = false;
  public context: any;

  constructor(private apiService: ApiService) { }

  public getContext() { return this.context; }
  private async setContext(newContext: any) { this.context = newContext; }

  // ------------------------------------------------ AUDIO CONTEXTUALIZATION LOGIC BEGIN -------------------------------------------------------------
  // https://developer.mozilla.org/en-US/docs/Web/API/setInterval
  // https://stackoverflow.com/questions/73847771/setinterval-returns-undefined-or-scope-of-returned-value-wrong

  // this logic below helps sync the frontend with the filename hash rotation on the backend:
  //       at every 15th epoch minute it will begin polling the api, but will stop as soon as it receives an updated audio context
  //       this will allow for a near-seamless user experience in the middle of a hash rotation cycle

  async evaluateCurrentContext(): Promise<any> {  // remember, this gets called every second of each 15th epoch minute
    console.log('evaluateCurrentContext fired');
    if(new Date().getMinutes() % environment.audioContextPollMinuteTimestamp === 0) {
      if (!this.hashesWereRotated) {
        this.hashesWereRotated = await this.pollNewContext();
      }
    }
    else {
      if (this.context === undefined) { await this.pollNewContext(); }  // for 1st time getting context
      this.hashesWereRotated = false;
    }
  }

  async pollNewContext(): Promise<boolean> {
    console.log('pollNewContext fired');
    let newContext = await this.apiService.getMediaContext();
    let receivedNewContext = JSON.stringify(this.context) !== JSON.stringify(newContext);

    if (receivedNewContext) {
      console.log('pollNewContext: recieved updated audio context');
      this.setContext(newContext);
      this.stopPollNewContext();
    }
    return receivedNewContext;
  }

  stopPollNewContext() {
    console.log('stopPollNewContext fired');
    this.intervalId = setInterval(() => {
      clearInterval(this.intervalId);
    }, environment.audioContextEvaluationIntervalSeconds * 1000);
  }

  // ------------------------------------------------ AUDIO CONTEXTUALIZATION LOGIC END ---------------------------------------------------------------
}
