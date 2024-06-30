import { Component, OnInit, Input } from '@angular/core';


@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})

export class HeaderComponent implements OnInit {
  @Input() lowBandwidthMode: boolean = false;

  constructor() {}

  ngOnInit(): void {}
}
