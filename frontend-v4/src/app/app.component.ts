import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { PlayerComponent } from './components/player/player.component';



@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    PlayerComponent
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'frontend-v4';
}
