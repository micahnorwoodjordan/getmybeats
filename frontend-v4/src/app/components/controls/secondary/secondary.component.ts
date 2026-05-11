import { Component, Input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatBottomSheet } from '@angular/material/bottom-sheet';

import { BottomSheetComponent } from './bottomsheet/bottomsheet.component';
import { environment } from '../../../../environments/environment.dev';
import { MediaContextElement } from '../../../interfaces/MediaContextElement';


@Component({
  selector: 'app-secondary',
  imports: [
    MatIconModule
  ],
  templateUrl: './secondary.component.html',
  styleUrl: './secondary.component.css',
})
export class SecondaryComponent {
  constructor(private bottomSheet: MatBottomSheet) { }

  @Input() mediaContext: MediaContextElement[] = [];
  @Input() isLoading: boolean = true;

  public userExperienceReportUrl: string = environment.apiHost + "/user/experience";
  public browserSupportsAudioVolumeManipulation: boolean = true;

  public openBottomSheet() {
    this.bottomSheet.open(BottomSheetComponent, {
      data: this.mediaContext
    });
  }

  public closeBottomSheet() { this.bottomSheet.dismiss(); }  // TODO

  public openCustomSnackBar() {  } // TODO
}
