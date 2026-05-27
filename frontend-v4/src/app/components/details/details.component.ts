import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-details',
  imports: [
    CommonModule
  ],
  templateUrl: './details.component.html',
  styleUrl: './details.component.css',
})
export class DetailsComponent {
  @Input() isLoading: boolean = false;
  @Input() downloadProgress: number = 0;
  @Input() title: string = "loading...";
  @Input() author: string = "loading...";
}
