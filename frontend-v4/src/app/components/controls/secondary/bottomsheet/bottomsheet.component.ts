import { Component, Inject } from '@angular/core';
import { MatListModule } from '@angular/material/list';
import { MatBottomSheetRef, MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';

import { MediaContextElement } from '../../../../interfaces/MediaContextElement';

@Component({
  selector: 'app-queue-sheet',
  standalone: true,
  templateUrl: './bottomsheet.component.html',
  styleUrl: './bottomsheet.component.css',
  imports: [MatListModule]
})
export class BottomSheetComponent {
constructor(
    private bottomSheetRef: MatBottomSheetRef<BottomSheetComponent>,

    @Inject(MAT_BOTTOM_SHEET_DATA)
    public mediaContext: MediaContextElement[]
  ) { }

  public select(mediaContextElement: MediaContextElement) {
    this.bottomSheetRef.dismiss(mediaContextElement);
  }
}
