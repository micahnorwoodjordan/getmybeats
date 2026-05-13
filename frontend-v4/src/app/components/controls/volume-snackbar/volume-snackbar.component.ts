import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBarModule, MatSnackBarRef } from '@angular/material/snack-bar';
import { VolumeSliderComponent } from '../volume-slider/volume-slider.component';

@Component({
  selector: 'app-volume-snackbar',
  standalone: true,
  imports: [
    MatSnackBarModule,
    VolumeSliderComponent,
    MatIconModule
  ],
  templateUrl: './volume-snackbar.component.html',
  styleUrls: ['./volume-snackbar.component.css']
})
export class VolumeSnackbarComponent {
  constructor(private snackBarRef: MatSnackBarRef<VolumeSnackbarComponent>) { }

  public close() { this.snackBarRef.dismiss(); }
}
