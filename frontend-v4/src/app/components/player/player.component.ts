import { Component } from '@angular/core';
import { PrimaryComponent } from '../controls/primary/primary.component';
import { SecondaryComponent } from '../controls/secondary/secondary.component';


@Component({
  selector: 'app-player',
  imports: [
    PrimaryComponent,
    SecondaryComponent
  ],
  templateUrl: './player.component.html',
  styleUrl: './player.component.css',
})
export class PlayerComponent {

}
