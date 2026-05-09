import { Observable, from, mergeMap, of, filter, finalize, catchError } from 'rxjs';
import { Injectable } from '@angular/core';
import { HttpEventType } from '@angular/common/http';

import { ApiService } from './api.service';

import { AudioDownloadEvent } from '../types/AudioDownloadEvent';
import { MediaContextElement } from '../interfaces/MediaContextElement';
import { CryptographyService } from './cryptography.service';

@Injectable({ providedIn: 'root' })
export class RetrievalService {
  constructor(private apiService: ApiService, private cryptographyService: CryptographyService) { }

  public retrieveAudioFromServer$(mediaContextElement: MediaContextElement, requestGUID: string, encyrptionKey: Uint8Array): Observable<AudioDownloadEvent> {
    return this.apiService.downloadAudioTrack(mediaContextElement.audio_filename_hash, requestGUID).pipe(
        mergeMap(async (event) => {
            switch (event.type) {
                case HttpEventType.DownloadProgress:
                    if (event.total !== undefined) {
                        const percent = Math.round((event.loaded / event.total) * 100);

                        if (percent % 20 === 0) {
                            console.log(`REPORT getandloadaudiotrack: ${percent}% complete`);
                        }

                        return { type: 'progress', percent } as AudioDownloadEvent;
                    }

                    return null;

                case HttpEventType.Response:
                    if (event.status === 200 && event.body) {
                        const encrypted = await event.body.arrayBuffer();
                        const decrypted = await this.cryptographyService.decryptAudioData(encrypted, encyrptionKey);
                        return { type: 'complete', data: decrypted } as AudioDownloadEvent;
                    } else {
                        throw new Error('ERROR getandloadaudiotrack');
                    }

                default:
                    return null;
            }
        }),
        filter((e): e is AudioDownloadEvent => e !== null),
        finalize(() => { console.log('END getandloadaudiotrack'); }),
        catchError((error) => {
            console.error(`ERROR getandloadaudiotrack: ${error.toString()}`);
            return of({ type: 'error', error } as AudioDownloadEvent);
        })
    );
  }
}
