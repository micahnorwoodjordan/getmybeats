import { Component, OnInit } from '@angular/core';
import {MatListModule} from '@angular/material/list';
import { MatBottomSheet, MatBottomSheetModule, MatBottomSheetRef } from '@angular/material/bottom-sheet';


import { ApiService } from '../api-service';


@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.css'
})

export class FooterComponent implements OnInit {
  lastReleaseString: string = '';
  sliderValue: number = 0;

  constructor(private apiService: ApiService, private _bottomSheet: MatBottomSheet) { }

  ngOnInit() { }

  onSliderChange(event: Event) {
    
  }

  openBottomSheet(): void {
    this._bottomSheet.open(BottomSheetOverviewExampleSheet);
  }
}

@Component({
  selector: 'app-footer-bottom-sheet',
  styleUrl: './footer.component.css',
  imports: [MatListModule],
  standalone: true,
  template: `
  <mat-nav-list>
    <a href="https://keep.google.com/" mat-list-item>
        <span matListItemTitle>Google Keep</span>
        <span matLine>Add to a note</span>
    </a>
  </mat-nav-list>
  `
})
export class BottomSheetOverviewExampleSheet {
  constructor(private _bottomSheetRef: MatBottomSheetRef<BottomSheetOverviewExampleSheet>) {}

  openLink(event: MouseEvent): void {
    this._bottomSheetRef.dismiss();
    event.preventDefault();
  }
}
