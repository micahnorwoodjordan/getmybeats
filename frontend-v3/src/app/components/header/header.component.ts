import { Component, OnInit, Input } from '@angular/core';
import { HttpEventType } from '@angular/common/http';

import { ApiService } from '../../services/api.service';
import { environment } from 'src/environments/environment';


@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})

export class HeaderComponent implements OnInit {
  userExperienceReportUrl = `${environment.apiHost}/user/experience`;
  @Input() hasPlaybackError: boolean = false;

  lastReleaseString: string = '';

  constructor(private apiService: ApiService) {}

  ngOnInit() { this.setLastReleaseDate(); }

  setLastReleaseDate() {
    this.apiService.getLastRelease().subscribe(
      event => {
        switch (event.type) {
          case HttpEventType.Response:
            console.log(`setLastReleaseDate: received server response ${event.status}`);
            if (event.status == 200) {
              if (event.body !== undefined && event.body !== null) {
                let lastRelease = event.body;
                let unsanitizedString = lastRelease.release_date;
                this.lastReleaseString = unsanitizedString.split('T')[0];
              }
            } else {
              console.log('setLastReleaseDate: ERROR fetching release date');
            }
            
            break;
          default:
            console.log('setLastReleaseDate: no response from server yet');
        }
      },
      error => {
        console.log(`setLastReleaseDate ERROR: ${error.toString()}`);
      }
    );
  }
}
