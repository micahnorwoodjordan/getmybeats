import { Component, Input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatBottomSheet } from '@angular/material/bottom-sheet';

import { BottomSheetComponent } from './bottomsheet/bottomsheet.component';
import { environment } from '../../../../environments/environment.dev';
import { MediaContextElement } from '../../../interfaces/MediaContextElement';
import { MediaContextService } from '../../../services/mediaContext.service';


@Component({
  selector: 'app-secondary',
  imports: [
    MatIconModule
  ],
  templateUrl: './secondary.component.html',
  styleUrl: './secondary.component.css',
})
export class SecondaryComponent {
  constructor(private medicContextService: MediaContextService, private bottomSheet: MatBottomSheet) { }

  @Input() mediaContext: MediaContextElement[] = [];  // only hydrates the initial component list items; subsequent bottomsgeet hydrations come from the injected mediacontextservice
  @Input() isLoading: boolean = true;

  public userExperienceReportUrl: string = environment.apiHost + "/user/experience";
  public browserSupportsAudioVolumeManipulation: boolean = true;

  public async openBottomSheet() {
    await this.medicContextService.refreshMediaContext();

    const ref = this.bottomSheet.open(BottomSheetComponent, {
      data: this.medicContextService.mediaContext()
    });

    ref.afterDismissed().subscribe((selectedTrack: MediaContextElement) => {
      if (selectedTrack) {
        this.medicContextService.selectTrack(selectedTrack);
      }
    });
  }

  public openCustomSnackBar() {  } // TODO
}
