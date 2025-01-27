import { Component, OnInit } from '@angular/core';

import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';

import {NgFor} from '@angular/common';
import {MatSelectModule} from '@angular/material/select';
import {MatFormFieldModule} from '@angular/material/form-field';


import { AudioService } from '../../services/audio.service';



@Component({
  selector: 'app-select',
  templateUrl: './select.component.html',
  styleUrl: './select.component.css',
  standalone: true,
  imports: [MatFormFieldModule, MatSelectModule, FormsModule, ReactiveFormsModule, NgFor],
})


export class SelectComponent implements OnInit {
    constructor(private audioService: AudioService) { }

    audios = new FormControl('');
    audioSelectOptions: string[] = ['ramen', 'noodles'];

    ngOnInit() { console.log('component init fired'); }
}
