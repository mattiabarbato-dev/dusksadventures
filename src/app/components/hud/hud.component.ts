import { Component, Input, OnInit } from '@angular/core';
import { GameService, PlayerStats } from '../../game/services/game.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-hud',
  templateUrl: './hud.component.html',
  styleUrls: ['./hud.component.scss']
})
export class HudComponent implements OnInit {
  @Input() gameService!: GameService;
  
  playerStats: PlayerStats = {
    health: 100,
    maxHealth: 100,
    level: 1,
    experience: 0,
    experienceToNextLevel: 100,
    attackPower: 10,
    defense: 5,
    gold: 0
  };

  showInventory = false;
  showPauseMenu = false;

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.gameService.playerStats$.subscribe(stats => {
      this.playerStats = stats;
    });

    // Listen for ESC key to pause
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.togglePause();
      }
    });
  }

  get healthPercentage(): number {
    return (this.playerStats.health / this.playerStats.maxHealth) * 100;
  }

  get experiencePercentage(): number {
    return (this.playerStats.experience / this.playerStats.experienceToNextLevel) * 100;
  }

  toggleInventory(): void {
    this.showInventory = !this.showInventory;
  }

  togglePause(): void {
    this.showPauseMenu = !this.showPauseMenu;
  }

  resumeGame(): void {
    this.showPauseMenu = false;
  }

  returnToMenu(): void {
    this.router.navigate(['/']);
  }
}