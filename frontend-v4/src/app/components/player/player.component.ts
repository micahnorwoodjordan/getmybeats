import { Component } from '@angular/core';
import { PrimaryComponent } from '../controls/primary/primary.component';
import { SecondaryComponent } from '../controls/secondary/secondary.component';
import { ProgressComponent } from '../controls/progress/progress.component';
import { DetailsComponent } from '../details/details.component';


@Component({
  selector: 'app-player',
  imports: [
    PrimaryComponent,
    SecondaryComponent,
    ProgressComponent,
    DetailsComponent
  ],
  templateUrl: './player.component.html',
  styleUrl: './player.component.css',
})
export class PlayerComponent {

}
