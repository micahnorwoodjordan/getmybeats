import { Component, OnInit } from '@angular/core';

import { ApiService } from '../api-service';


@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.css'
})

export class FooterComponent implements OnInit {
  lastReleaseString: string = '';

  constructor(private apiService: ApiService) { }

  async ngOnInit(): Promise<void> { await this.setLastReleaseDate(); }

  async setLastReleaseDate() {
    let lastReleaseData: any = await this.apiService.getLastRelease();
    let unsanitizedString = lastReleaseData.release_date;
    this.lastReleaseString = unsanitizedString.split('T')[0];
  }
}
