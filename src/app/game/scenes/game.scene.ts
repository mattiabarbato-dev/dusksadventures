import Phaser from 'phaser';
import { Player } from '../entities/player';
import { Enemy } from '../entities/enemy';
import { GameService } from '../services/game.service';

export class GameScene extends Phaser.Scene {
  private player!: Player;
  private enemies!: Phaser.Physics.Arcade.Group;
  private platforms!: Phaser.Physics.Arcade.StaticGroup;
  private coins!: Phaser.Physics.Arcade.Group;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private gameService!: GameService;

  constructor() {
    super({ key: 'GameScene' });
  }

  create(): void {
    // Get GameService from registry
    this.gameService = this.registry.get('gameService');

    // Background images with parallax effect (tiled for full level width)
    const bg1 = this.add.image(0, 0, 'background').setOrigin(0, 0);
    bg1.setScrollFactor(0.3); // Parallax - moves slower than camera
    bg1.setDisplaySize(1920, 720);

    const bg2 = this.add.image(1920, 0, 'background').setOrigin(0, 0);
    bg2.setScrollFactor(0.3);
    bg2.setDisplaySize(1920, 720);

    // Set world bounds to match the level size
    this.physics.world.setBounds(0, 0, 3200, 720);

    // Create platforms
    this.createPlatforms();

    // Create player
    this.player = new Player(this, 100, 450);

    // Create enemies
    this.enemies = this.physics.add.group();
    this.createEnemies();

    // Create collectibles
    this.createCoins();

    // Input
    this.cursors = this.input.keyboard!.createCursorKeys();

    // Collisions
    this.physics.add.collider(this.player, this.platforms);
    this.physics.add.collider(this.enemies, this.platforms);
    this.physics.add.collider(this.coins, this.platforms);

    // Player interactions
    this.physics.add.overlap(this.player, this.coins, this.collectCoin, undefined, this);
    this.physics.add.overlap(this.player, this.enemies, this.hitEnemy, undefined, this);

    // Listen for player attack events
    this.events.on('playerAttack', this.handlePlayerAttack, this);

    // Camera follow player
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
    this.cameras.main.setBounds(0, 0, 3200, 720);
  }

  override update(): void {
    this.player.update(this.cursors);

    // Update enemies
    this.enemies.children.entries.forEach((enemy) => {
      (enemy as Enemy).update();
    });

    // Check if player fell off the map
    if (this.player.y > 800) {
      this.gameOver();
    }
  }

  private createPlatforms(): void {
    this.platforms = this.physics.add.staticGroup();

    // Ground - create a long platform
    for (let i = 0; i < 50; i++) {
      this.platforms.create(i * 64 + 32, 688, 'ground');
    }

    // Platforms
    this.platforms.create(400, 568, 'ground');
    this.platforms.create(600, 500, 'ground');
    this.platforms.create(850, 450, 'ground');
    this.platforms.create(1100, 400, 'ground');
    this.platforms.create(1400, 350, 'ground');
    this.platforms.create(1700, 450, 'ground');
    this.platforms.create(2000, 500, 'ground');
    this.platforms.create(2300, 400, 'ground');
    this.platforms.create(2600, 550, 'ground');
    this.platforms.create(2900, 450, 'ground');

    // Refresh all bodies in the static group
    this.platforms.refresh();
  }

  private createEnemies(): void {
    const enemyPositions = [
      { x: 500, y: 500 },
      { x: 900, y: 380 },
      { x: 1500, y: 280 },
      { x: 2100, y: 430 },
      { x: 2700, y: 480 }
    ];

    enemyPositions.forEach(pos => {
      const enemy = new Enemy(this, pos.x, pos.y);
      this.enemies.add(enemy);
    });
  }

  private createCoins(): void {
    this.coins = this.physics.add.group();

    const coinPositions = [
      { x: 300, y: 600 },
      { x: 400, y: 500 },
      { x: 600, y: 430 },
      { x: 850, y: 380 },
      { x: 1100, y: 330 },
      { x: 1400, y: 280 },
      { x: 1700, y: 380 },
      { x: 2000, y: 430 },
      { x: 2300, y: 330 },
      { x: 2600, y: 480 },
      { x: 2900, y: 380 }
    ];

    coinPositions.forEach(pos => {
      const coin = this.coins.create(pos.x, pos.y, 'coin');
      coin.setBounce(0.5);
    });
  }

  private collectCoin(player: any, coin: any): void {
    coin.disableBody(true, true);

    // Update gold in GameService
    const currentStats = this.gameService.getPlayerStats();
    this.gameService.updatePlayerStats({ gold: currentStats.gold + 10 });
  }

  private handlePlayerAttack(attackData: { x: number; y: number; width: number; height: number; damage: number }): void {
    // Create attack hitbox
    const attackRect = new Phaser.Geom.Rectangle(
      attackData.x - attackData.width / 2,
      attackData.y - attackData.height / 2,
      attackData.width,
      attackData.height
    );

    // Check each enemy
    this.enemies.children.entries.forEach((enemyObj) => {
      const enemy = enemyObj as Enemy;
      if (enemy.getIsDead()) return;

      // Check if enemy is in attack range
      const enemyBounds = enemy.getBounds();
      if (Phaser.Geom.Rectangle.Overlaps(attackRect, enemyBounds)) {
        enemy.takeDamage(attackData.damage);

        // If enemy died, give XP
        if (enemy.getIsDead()) {
          this.player.gainExperience(enemy.getExperienceReward());

          // Update XP in GameService
          this.gameService.updatePlayerStats({
            experience: this.player.getExperience(),
            level: this.player.getLevel(),
            experienceToNextLevel: this.player.getExperienceToNextLevel()
          });
        }
      }
    });
  }

  private hitEnemy(player: any, enemy: any): void {
    // Apply damage to player
    this.player.takeDamage(20);

    // Update health in GameService
    this.gameService.updatePlayerStats({ health: this.player.getHealth() });

    // Knockback
    const knockbackDirection = player.x < enemy.x ? -1 : 1;
    const body = player.body as Phaser.Physics.Arcade.Body;
    body.setVelocityX(knockbackDirection * 200);
    body.setVelocityY(-200);

    if (this.player.isDead()) {
      this.gameOver();
    }
  }

  private gameOver(): void {
    this.physics.pause();
    this.player.setTint(0xff0000);
    this.gameService.setGameState('gameOver');

    const gameOverText = this.add.text(
      this.cameras.main.centerX,
      this.cameras.main.centerY,
      'GAME OVER\n\nPress SPACE to restart',
      {
        fontSize: '48px',
        color: '#fff',
        stroke: '#000',
        strokeThickness: 6,
        align: 'center'
      }
    );
    gameOverText.setOrigin(0.5);
    gameOverText.setScrollFactor(0);

    this.input.keyboard?.once('keydown-SPACE', () => {
      this.gameService.resetGame();
      this.scene.restart();
    });
  }
}