import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';


@Component({
  selector: 'app-secondary',
  imports: [
    MatIconModule
  ],
  templateUrl: './secondary.component.html',
  styleUrl: './secondary.component.css',
})
export class SecondaryComponent {  // TODO
  public userExperienceReportUrl: string = "";
  public browserSupportsAudioVolumeManipulation: boolean = true;

  public openBottomSheet() {  }
  public openCustomSnackBar() {  }
  public getIsLoading() {  }
}
