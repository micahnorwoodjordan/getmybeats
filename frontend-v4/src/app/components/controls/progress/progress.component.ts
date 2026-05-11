import { Component, Output, EventEmitter, WritableSignal, computed } from '@angular/core';

import { PlaybackService } from '../../../services/playback.service';

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
  readonly currentTime: WritableSignal<number>;
  readonly duration: WritableSignal<number>;
  readonly currentTimeHumanReadable = computed(() => this.formatTime(this.currentTime()));
  readonly durationHumanReadable = computed(() =>this.formatTime(this.duration()));

  @Output() seek = new EventEmitter<number>();

  constructor(private playbackService: PlaybackService) {
    this.currentTime = this.playbackService.seconds;
    this.duration = this.playbackService.duration;
  }

  private formatTime(seconds: number): string {
    if (!Number.isFinite(seconds)) return '0:00';

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }

  public onSeek(value: number) { this.seek.emit(value); }
}
