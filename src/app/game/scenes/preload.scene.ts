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

    // Load assets - questi sono placeholder, dovrai creare/trovare le risorse grafiche
    // Per ora carichiamo delle geometrie colorate come placeholder
    this.createPlaceholderAssets();
  }

  private createPlaceholderAssets(): void {
    // Creiamo placeholder grafici usando il canvas di Phaser
    // Player
    const playerGraphics = this.make.graphics({});
    playerGraphics.fillStyle(0x4a90e2);
    playerGraphics.fillRect(0, 0, 32, 48);
    playerGraphics.generateTexture('player', 32, 48);
    
    // Ground tile
    const groundGraphics = this.make.graphics({});
    groundGraphics.fillStyle(0x8b4513);
    groundGraphics.fillRect(0, 0, 64, 64);
    groundGraphics.generateTexture('ground', 64, 64);
    
    // Enemy
    const enemyGraphics = this.make.graphics({});
    enemyGraphics.fillStyle(0xe74c3c);
    enemyGraphics.fillRect(0, 0, 32, 32);
    enemyGraphics.generateTexture('enemy', 32, 32);
    
    // Coin
    const coinGraphics = this.make.graphics({});
    coinGraphics.fillStyle(0xf1c40f);
    coinGraphics.fillCircle(16, 16, 12);
    coinGraphics.generateTexture('coin', 32, 32);
    
    // Health potion
    const potionGraphics = this.make.graphics({});
    potionGraphics.fillStyle(0xe74c3c);
    potionGraphics.fillRect(8, 0, 16, 24);
    potionGraphics.fillStyle(0x8b0000);
    potionGraphics.fillRect(12, 8, 8, 12);
    potionGraphics.generateTexture('potion', 32, 32);
  }

  create(): void {
    this.scene.start('GameScene');
  }
}