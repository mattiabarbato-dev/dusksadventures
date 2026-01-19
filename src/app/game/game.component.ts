import { Component, OnInit, OnDestroy } from '@angular/core';
import Phaser from 'phaser';
import { GameScene } from './scenes/game.scene';
import { PreloadScene } from './scenes/preload.scene';
import { GameService } from './services/game.service';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.scss']
})
export class GameComponent implements OnInit, OnDestroy {
  private game!: Phaser.Game;
  showHud = true;

  constructor(public gameService: GameService) {}

  ngOnInit(): void {
    this.initGame();
  }

  ngOnDestroy(): void {
    if (this.game) {
      this.game.destroy(true);
    }
  }

  private initGame(): void {
    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      width: 1280,
      height: 720,
      parent: 'game-container',
      physics: {
        default: 'arcade',
        arcade: {
          gravity: { y: 800, x: 0 },
          debug: false
        }
      },
      scene: [PreloadScene, GameScene],
      scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
      },
      backgroundColor: '#2d2d2d'
    };

    this.game = new Phaser.Game(config);
  }
}