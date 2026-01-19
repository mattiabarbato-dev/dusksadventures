import Phaser from 'phaser';

export class Player extends Phaser.Physics.Arcade.Sprite {
  // RPG Stats
  private maxHealth = 100;
  private currentHealth = 100;
  private attackPower = 10;
  private defense = 5;
  private level = 1;
  private experience = 0;
  private experienceToNextLevel = 100;

  // Movement
  private speed = 200;
  private jumpVelocity = -400;
  private doubleJump = false;
  private canDoubleJump = true;

  // Combat
  private isAttacking = false;
  private attackCooldown = 500;
  private lastAttackTime = 0;
  private invulnerable = false;
  private invulnerabilityDuration = 1000;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'player');
    
    scene.add.existing(this);
    scene.physics.add.existing(this);
    
    this.setCollideWorldBounds(false);
    this.setBounce(0.1);
    this.setScale(1);
  }

  override update(cursors: Phaser.Types.Input.Keyboard.CursorKeys): void {
    if (this.isAttacking) {
      return;
    }

    // Horizontal movement
    if (cursors.left.isDown) {
      this.setVelocityX(-this.speed);
      this.setFlipX(true);
    } else if (cursors.right.isDown) {
      this.setVelocityX(this.speed);
      this.setFlipX(false);
    } else {
      this.setVelocityX(0);
    }

    // Jump
    const onGround = this.body?.touching.down;
    
    if (onGround) {
      this.canDoubleJump = true;
    }

    if (Phaser.Input.Keyboard.JustDown(cursors.up!)) {
      if (onGround) {
        this.setVelocityY(this.jumpVelocity);
      } else if (this.canDoubleJump) {
        this.setVelocityY(this.jumpVelocity);
        this.canDoubleJump = false;
      }
    }

    // Attack
    if (Phaser.Input.Keyboard.JustDown(cursors.space!)) {
      this.attack();
    }
  }

  private attack(): void {
    const currentTime = Date.now();
    if (currentTime - this.lastAttackTime < this.attackCooldown) {
      return;
    }

    this.isAttacking = true;
    this.lastAttackTime = currentTime;

    // Attack animation/effect would go here
    this.setTint(0xffff00);
    
    setTimeout(() => {
      this.isAttacking = false;
      this.clearTint();
    }, 200);

    // Check for enemies in range
    this.checkAttackHit();
  }

  private checkAttackHit(): void {
    const attackRange = 60;
    const attackDirection = this.flipX ? -1 : 1;
    
    // This would check collision with enemies in a real implementation
    // For now, it's a placeholder
  }

  takeDamage(damage: number): void {
    if (this.invulnerable) {
      return;
    }

    const actualDamage = Math.max(1, damage - this.defense);
    this.currentHealth -= actualDamage;
    
    if (this.currentHealth < 0) {
      this.currentHealth = 0;
    }

    // Visual feedback
    this.setTint(0xff0000);
    this.invulnerable = true;

    setTimeout(() => {
      this.clearTint();
      this.invulnerable = false;
    }, this.invulnerabilityDuration);

    console.log(`Player health: ${this.currentHealth}/${this.maxHealth}`);
  }

  heal(amount: number): void {
    this.currentHealth = Math.min(this.maxHealth, this.currentHealth + amount);
    console.log(`Player healed! Health: ${this.currentHealth}/${this.maxHealth}`);
  }

  gainExperience(amount: number): void {
    this.experience += amount;
    console.log(`Gained ${amount} XP! Total: ${this.experience}/${this.experienceToNextLevel}`);

    if (this.experience >= this.experienceToNextLevel) {
      this.levelUp();
    }
  }

  private levelUp(): void {
    this.level++;
    this.experience -= this.experienceToNextLevel;
    this.experienceToNextLevel = Math.floor(this.experienceToNextLevel * 1.5);

    // Stat increases
    this.maxHealth += 20;
    this.currentHealth = this.maxHealth;
    this.attackPower += 5;
    this.defense += 2;

    console.log(`LEVEL UP! Now level ${this.level}`);
  }

  isDead(): boolean {
    return this.currentHealth <= 0;
  }

  // Getters for stats
  getHealth(): number {
    return this.currentHealth;
  }

  getMaxHealth(): number {
    return this.maxHealth;
  }

  getLevel(): number {
    return this.level;
  }

  getExperience(): number {
    return this.experience;
  }

  getExperienceToNextLevel(): number {
    return this.experienceToNextLevel;
  }

  getAttackPower(): number {
    return this.attackPower;
  }

  getDefense(): number {
    return this.defense;
  }
}