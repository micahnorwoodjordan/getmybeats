import { Component, Output, EventEmitter } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';


@Component({
  selector: 'app-primary',
  imports: [
    MatIconModule
  ],
  templateUrl: './primary.component.html',
  styleUrl: './primary.component.css'
})
export class PrimaryComponent {
  public shuffleEnabled: boolean = false;
  public repeatEnabled: boolean = false;
  public isLoading: boolean = false;
  public isPlaying: boolean = false;

  @Output() next = new EventEmitter<void>();
  @Output() back = new EventEmitter<void>();
  @Output() shuffle = new EventEmitter<void>();
  @Output() playPause = new EventEmitter<void>();
  @Output() repeat = new EventEmitter<void>();
}
