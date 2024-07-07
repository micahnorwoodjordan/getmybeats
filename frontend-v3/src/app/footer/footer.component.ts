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

  ngOnInit() { }
}
