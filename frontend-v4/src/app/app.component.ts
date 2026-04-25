import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { PrimaryComponent } from './components/controls/primary/primary.component';
import { SecondaryComponent } from './components/controls/secondary/secondary.component';


@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    PrimaryComponent,
    SecondaryComponent
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'frontend-v4';
}
