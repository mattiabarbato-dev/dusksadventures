import Phaser from 'phaser';

export class PreloadScene extends Phaser.Scene {
  constructor() {
    super({ key: 'PreloadScene' });
  }

  preload(): void {
    // Progress bar
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    const progressBar = this.add.graphics();
    const progressBox = this.add.graphics();
    progressBox.fillStyle(0x222222, 0.8);
    progressBox.fillRect(width / 2 - 160, height / 2 - 25, 320, 50);

    const loadingText = this.make.text({
      x: width / 2,
      y: height / 2 - 50,
      text: 'Loading Dusk Adventures...',
      style: {
        font: '20px monospace',
        color: '#ffffff'
      }
    });
    loadingText.setOrigin(0.5, 0.5);

    const percentText = this.make.text({
      x: width / 2,
      y: height / 2,
      text: '0%',
      style: {
        font: '18px monospace',
        color: '#ffffff'
      }
    });
    percentText.setOrigin(0.5, 0.5);

    this.load.on('progress', (value: number) => {
      progressBar.clear();
      progressBar.fillStyle(0xffffff, 1);
      progressBar.fillRect(width / 2 - 150, height / 2 - 15, 300 * value, 30);
      percentText.setText(Math.floor(value * 100) + '%');
    });

    this.load.on('complete', () => {
      progressBar.destroy();
      progressBox.destroy();
      loadingText.destroy();
      percentText.destroy();
    });

    // Load player spritesheet with atlas
    this.load.atlas('player', 'assets/sprites/player.png', 'assets/sprites/player.json');

    // Load background
    this.load.image('background', 'assets/images/background.png');

    // Create placeholder assets for other game elements
    this.createPlaceholderAssets();
  }

  private createPlaceholderAssets(): void {
    // Ground tile
    const groundGraphics = this.make.graphics({});
    groundGraphics.fillStyle(0x8b4513);
    groundGraphics.fillRect(0, 0, 64, 64);
    groundGraphics.generateTexture('ground', 64, 64);
    groundGraphics.destroy();

    // Enemy
    const enemyGraphics = this.make.graphics({});
    enemyGraphics.fillStyle(0xe74c3c);
    enemyGraphics.fillRect(0, 0, 32, 32);
    enemyGraphics.generateTexture('enemy', 32, 32);
    enemyGraphics.destroy();

    // Coin
    const coinGraphics = this.make.graphics({});
    coinGraphics.fillStyle(0xf1c40f);
    coinGraphics.fillCircle(16, 16, 12);
    coinGraphics.generateTexture('coin', 32, 32);
    coinGraphics.destroy();

    // Health potion
    const potionGraphics = this.make.graphics({});
    potionGraphics.fillStyle(0xe74c3c);
    potionGraphics.fillRect(8, 0, 16, 24);
    potionGraphics.fillStyle(0x8b0000);
    potionGraphics.fillRect(12, 8, 8, 12);
    potionGraphics.generateTexture('potion', 32, 32);
    potionGraphics.destroy();
  }

  create(): void {
    // Create player animations
    this.createPlayerAnimations();

    this.scene.start('GameScene');
  }

  private createPlayerAnimations(): void {
    // Idle animation
    this.anims.create({
      key: 'player_idle',
      frames: [
        { key: 'player', frame: 'idle_01' },
        { key: 'player', frame: 'idle_02' }
      ],
      frameRate: 4,
      repeat: -1
    });

    // Walk animation
    this.anims.create({
      key: 'player_walk',
      frames: [
        { key: 'player', frame: 'walk_01' },
        { key: 'player', frame: 'walk_02' },
        { key: 'player', frame: 'walk_03' },
        { key: 'player', frame: 'walk_04' }
      ],
      frameRate: 8,
      repeat: -1
    });

    // Jump animation
    this.anims.create({
      key: 'player_jump',
      frames: [
        { key: 'player', frame: 'jump_01' }
      ],
      frameRate: 8,
      repeat: 0
    });

    // Attack/Slash animation
    this.anims.create({
      key: 'player_slash',
      frames: [
        { key: 'player', frame: 'attack_01' }
      ],
      frameRate: 10,
      repeat: 0
    });

    // Crouch - usa idle per ora
    this.anims.create({
      key: 'player_crouch',
      frames: [
        { key: 'player', frame: 'idle_01' }
      ],
      frameRate: 8,
      repeat: 0
    });
  }
}
