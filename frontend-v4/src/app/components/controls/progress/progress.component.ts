import { Component, Output, EventEmitter } from '@angular/core';

import { MatIconModule } from '@angular/material/icon';
import { MatSliderModule } from '@angular/material/slider';


@Component({
  selector: 'app-progress',
  imports: [
    MatIconModule,
    MatSliderModule
  ],
  templateUrl: './progress.component.html',
  styleUrl: './progress.component.css'
})
export class ProgressComponent {
  public durationHumanReadable: string = "3:23";
  public currentTimeHumanReadable: string = "1:23";
  public currentTime: string = "1:56";
  public duration: number = 50;

  @Output() seek = new EventEmitter<number>();

  public onSeek(value: number) { this.seek.emit(value); }
}
