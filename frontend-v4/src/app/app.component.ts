import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { PrimaryComponent } from './components/controls/primary/primary.component';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    PrimaryComponent
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'frontend-v4';
}
