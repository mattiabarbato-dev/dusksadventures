import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { GameComponent } from './game/game.component';
import { MenuComponent } from './components/menu/menu.component';
import { HudComponent } from './components/hud/hud.component';

@NgModule({
  declarations: [
    AppComponent,
    GameComponent,
    MenuComponent,
    HudComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
