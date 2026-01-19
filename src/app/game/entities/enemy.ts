import Phaser from 'phaser';

export class Enemy extends Phaser.Physics.Arcade.Sprite {
  private health = 30;
  private maxHealth = 30;
  private attackPower = 15;
  private speed = 50;
  private direction = 1;
  private patrolDistance = 150;
  private startX: number;
  private experienceReward = 25;
  private isDead = false;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'enemy');
    
    this.startX = x;
    
    scene.add.existing(this);
    scene.physics.add.existing(this);
    
    this.setBounce(0.1);
    this.setCollideWorldBounds(true);
  }

  override update(): void {
    if (this.isDead) {
      return;
    }

    // Simple patrol AI
    this.patrol();
  }

  private patrol(): void {
    // Move back and forth
    this.setVelocityX(this.direction * this.speed);

    // Check if reached patrol limit
    const distanceFromStart = Math.abs(this.x - this.startX);
    if (distanceFromStart > this.patrolDistance) {
      this.direction *= -1;
      this.setFlipX(this.direction < 0);
    }
  }

  takeDamage(damage: number): void {
    if (this.isDead) {
      return;
    }

    this.health -= damage;
    
    // Visual feedback
    this.setTint(0xff0000);
    setTimeout(() => {
      if (!this.isDead) {
        this.clearTint();
      }
    }, 100);

    if (this.health <= 0) {
      this.die();
    }
  }

  private die(): void {
    this.isDead = true;
    this.setTint(0x666666);
    this.setVelocity(0, 0);
    
    // Fade out and destroy
    this.scene.tweens.add({
      targets: this,
      alpha: 0,
      y: this.y - 50,
      duration: 500,
      onComplete: () => {
        this.destroy();
      }
    });
  }

  getExperienceReward(): number {
    return this.experienceReward;
  }

  getAttackPower(): number {
    return this.attackPower;
  }

  getIsDead(): boolean {
    return this.isDead;
  }
}