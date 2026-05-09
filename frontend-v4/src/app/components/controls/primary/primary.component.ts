import { Component, Output, Input, EventEmitter } from '@angular/core';
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
  @Input() isPlaying: boolean = false;
  @Input() shuffleEnabled: boolean = false;
  @Input() repeatEnabled: boolean = false;
  @Input() isLoading: boolean = true;

  @Output() next = new EventEmitter<void>();
  @Output() back = new EventEmitter<void>();
  @Output() shuffle = new EventEmitter<void>();
  @Output() playPause = new EventEmitter<void>();
  @Output() repeat = new EventEmitter<void>();
}
