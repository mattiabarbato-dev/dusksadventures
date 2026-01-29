import Phaser from 'phaser';

export class Enemy extends Phaser.Physics.Arcade.Sprite {
  private health = 30;
  private maxHealth = 30;
  private attackPower = 15;
  private speed = 50;
  private direction = 1;
  private patrolDistance = 300;
  private startX: number;
  private experienceReward = 25;
  private isDead = false;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'enemy');
    
    this.startX = x;
    
    scene.add.existing(this);
    scene.physics.add.existing(this);
    
    this.setBounce(0.1);
  }

  override update(): void {
    if (this.isDead || !this.body) {
      return;
    }

    // Ensure body is enabled
    const body = this.body as Phaser.Physics.Arcade.Body;
    if (!body.enable) {
      body.enable = true;
    }

    // Simple patrol AI
    this.patrol();
  }

  private patrol(): void {
    // Check if reached patrol limit and change direction
    if (this.x > this.startX + this.patrolDistance) {
      this.direction = -1;
    } else if (this.x < this.startX - this.patrolDistance) {
      this.direction = 1;
    }

    // Move in current direction
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setVelocityX(this.direction * this.speed);
    this.setFlipX(this.direction < 0);
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