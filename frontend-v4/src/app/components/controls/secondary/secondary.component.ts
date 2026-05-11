import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

import { environment } from '../../../../environments/environment.dev';


@Component({
  selector: 'app-secondary',
  imports: [
    MatIconModule
  ],
  templateUrl: './secondary.component.html',
  styleUrl: './secondary.component.css',
})
export class SecondaryComponent {
  public userExperienceReportUrl: string = environment.apiHost + "/user/experience";
  public browserSupportsAudioVolumeManipulation: boolean = true;

  public openBottomSheet() {  }
  public openCustomSnackBar() {  }
  public getIsLoading() {  }
}
