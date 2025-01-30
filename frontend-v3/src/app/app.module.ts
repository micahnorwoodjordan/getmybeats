import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FlexLayoutModule } from '@angular/flex-layout';
import { AppRoutingModule } from './app-routing.module';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { HttpClientModule } from '@angular/common/http';

// angular material
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatIconModule } from '@angular/material/icon';
import { MatSliderModule } from '@angular/material/slider';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FormsModule } from '@angular/forms';
import { MatTooltipModule } from '@angular/material/tooltip';

// my components
// https://stackoverflow.com/questions/77852468/angular-standalone-component-not-woking-in-child-or-shared-componnent
// it was a DOOZY figuring out how to import standalone modules
// find the "Shared component in Feature : does not work !" section of Naren Murali's response
import { SelectComponent } from './components/select/select.component';
import { AppComponent } from './app.component';
import { HeaderComponent } from './components/header/header.component';
import { PlayerComponent } from './components/player/player.component';
import { FooterComponent } from './components/footer/footer.component';


@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    PlayerComponent,
    FooterComponent
  ],
  imports: [
    SelectComponent,
    BrowserModule,
    AppRoutingModule,
    FlexLayoutModule,
    MatIconModule,
    HttpClientModule,
    MatSliderModule,
    MatToolbarModule,
    FormsModule,
    MatProgressSpinnerModule,
    MatProgressBarModule,
    MatTooltipModule
  ],
  providers: [
    provideAnimationsAsync()
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
