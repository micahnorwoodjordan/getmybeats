import { Component, OnInit } from '@angular/core';

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

    audios = new FormControl('');
    audioSelectOptions: string[] = [];
    context: MediaContextElement[] | undefined = [];
    audioQueue: MediaContextElement[] = [];
    selectedAudioOptions: string[] = [];

    private setContext(newContext: MediaContextElement[]) { this.context = newContext; }
    private setAudioSelectOptions(newSelectOptions: string[]) { this.audioSelectOptions = newSelectOptions; }
    private addToSelectedAudioOptions(newOption: string) { this.selectedAudioOptions.push(newOption); }

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

    onSelectionChange(event: MatSelectChange) {
        let lastSongPicked = `${event.value}`.split(",").at(-1);
        if (lastSongPicked) {
            this.addToSelectedAudioOptions(lastSongPicked);
        }
        
        console.log(this.selectedAudioOptions);
    }
}
