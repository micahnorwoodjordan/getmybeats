import { Component, OnInit, Input } from '@angular/core';

import { ApiService } from '../api-service';


@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})

export class HeaderComponent implements OnInit {
  @Input() lowBandwidthMode: boolean = false;

  lastReleaseString: string = '';

  constructor(private apiService: ApiService) {}

  async ngOnInit(): Promise<void> { await this.setLastReleaseDate(); }

  async setLastReleaseDate() {
    let lastReleaseData: any = await this.apiService.getLastRelease();
    let unsanitizedString = lastReleaseData.release_date;
    this.lastReleaseString = unsanitizedString.split('T')[0];
  }
}
