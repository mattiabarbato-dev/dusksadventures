import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { GameService } from '../../game/services/game.service';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss']
})
export class MenuComponent {
  showCredits = false;
  showSettings = false;
  hasSaveData = false;

  constructor(
    private router: Router,
    private gameService: GameService
  ) {
    this.checkSaveData();
  }

  private checkSaveData(): void {
    const savedData = localStorage.getItem('duskAdventures_saveData');
    this.hasSaveData = !!savedData;
  }

  startNewGame(): void {
    this.gameService.resetGame();
    this.router.navigate(['/game']);
  }

  continueGame(): void {
    if (this.hasSaveData) {
      this.router.navigate(['/game']);
    }
  }

  toggleCredits(): void {
    this.showCredits = !this.showCredits;
  }

  toggleSettings(): void {
    this.showSettings = !this.showSettings;
  }
}