import { Component, Output, EventEmitter, WritableSignal, computed } from '@angular/core';

import { MatIconModule } from '@angular/material/icon';
import { MatSliderModule } from '@angular/material/slider';
import { PlaybackService } from '../../../services/playback.service';


@Component({
  selector: 'app-volume-slider',
  imports: [
    MatIconModule,
    MatSliderModule
  ],
  templateUrl: './volume-slider.component.html',
  styleUrl: './volume-slider.component.css'
})
export class VolumeSliderComponent {
  constructor(public playbackService: PlaybackService) { }

  public onDrag(value: number) { this.playbackService.updateVolume(value); }
}
