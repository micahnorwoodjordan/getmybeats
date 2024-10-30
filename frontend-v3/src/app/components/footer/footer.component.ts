import { Component, OnInit } from '@angular/core';


import { ApiService } from '../../services/api.service';


@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.css'
})

export class FooterComponent implements OnInit {
  constructor(private apiService: ApiService) { }

  ngOnInit() { }
}

