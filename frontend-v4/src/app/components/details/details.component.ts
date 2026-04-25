import { Component } from '@angular/core';
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
  public getIsLoading(): boolean { return true; }
  public getDownloadProgress(): number { return 56; }
  public getTitle(): string { return "noodles"; }
  public getAuthor(): string { return "micah"; }
}
