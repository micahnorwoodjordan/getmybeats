import { Component, SimpleChanges, EventEmitter, OnInit, Input, Output } from '@angular/core';

import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';

import { NgFor } from '@angular/common';
import { MatSelectChange, MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';

import { MediaContextElement } from '../../interfaces/MediaContextElement';

import { AudioService } from '../../services/audio.service';



@Component({
  selector: 'app-select',
  templateUrl: './select.component.html',
  styleUrl: './select.component.css',
  standalone: true,
  imports: [
    MatFormFieldModule,
    MatSelectModule,
    FormsModule,
    ReactiveFormsModule,
    NgFor
  ],
})


export class SelectComponent implements OnInit {
    constructor(private audioService: AudioService) { }

    audios = new FormControl([]);
    audioSelectOptions: string[] = [];
    context: MediaContextElement[] | undefined = [];
    queue: string[] = [];

    @Input() updatedAudioQueue: string[] = [];
    @Output() newAudioOptionEvent = new EventEmitter<string []>();

    private setContext(newContext: MediaContextElement[]) { this.context = newContext; }
    private setAudioSelectOptions(newSelectOptions: string[]) { this.audioSelectOptions = newSelectOptions; }
    private updateQueue(updatedQueue: string[]) { this.queue = updatedQueue; }

    async ngOnInit() {
        let audioContext = await this.audioService.getContextSynchronously();

        if (audioContext) {
            this.setContext(audioContext);
            if (this.context) {
                let newSelectOptions: string[] = [];
                this.context.forEach((mediaContextElement: MediaContextElement, idx: number) => {
                    newSelectOptions.push(mediaContextElement.title);
                });
                this.setAudioSelectOptions(newSelectOptions);
            }
        } else {
            console.log('SelectComponent.OnInit: no audio context');
        }
    }
    clearFulfilledQueueItems(previouslyQueuedTitles: []) {  // string array but avoiding typescript typechecking clash with the `never` type
        let newValues = previouslyQueuedTitles.filter(v => this.updatedAudioQueue.includes(v));
        if (newValues) {
            this.audios.setValue(newValues);
        }
    }

    ngOnChanges(changes: SimpleChanges) {  // https://v16.angular.io/guide/lifecycle-hooks#onchanges
        for (const propName in changes) {
            const changeString = changes[propName];
            // "queued" from the perspective of the AudioService
            // the component still needs to do some work to update the UI
            // NOTE: these are strings and need to be converted to an array
            const previouslyQueuedTitles = changeString.previousValue;
            const currentlyQueuedTitles = changeString.currentValue;

            if (currentlyQueuedTitles.length < previouslyQueuedTitles.length) {
                this.clearFulfilledQueueItems(previouslyQueuedTitles);
            }
        }
    }

    onSelectionChange(event: MatSelectChange) {
        this.updateQueue(event.value);
        this.newAudioOptionEvent.emit(this.queue);      
    }
}
