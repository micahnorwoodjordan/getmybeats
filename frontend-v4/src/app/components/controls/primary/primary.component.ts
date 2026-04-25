import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';


@Component({
  selector: 'app-primary',
  imports: [
    MatIconModule
  ],
  templateUrl: './primary.component.html',
  styleUrl: './primary.component.css'
})
export class PrimaryComponent {  // TODO
  public shuffleEnabled: boolean = false;
  public repeatEnabled: boolean = false;
  public isLoading: boolean = false;
  public isPlaying: boolean = false;

  public onClickShuffle() {  }
  public onPrevious() {  }
  public togglePlay() {  }
  public onNext() {  }
  public onClickRepeat() {  }
}
