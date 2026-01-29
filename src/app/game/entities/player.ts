import Phaser from 'phaser';

export class Player extends Phaser.GameObjects.Container {
  // The visible sprite (child of container)
  private sprite: Phaser.GameObjects.Sprite;
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
  private canDoubleJump = true;

  // Combat
  private isAttacking = false;
  private attackCooldown = 500;
  private lastAttackTime = 0;
  private invulnerable = false;
  private invulnerabilityDuration = 1000;

  // Player state
  private playerState: 'idle' | 'walk' | 'jump' | 'attack' = 'idle';
  private isGrounded = true;

  // Coyote time - allows jumping shortly after leaving a platform
  private coyoteTime = 80; // ms
  private lastGroundedTime = 0;

  // Jump buffer - registers jump input slightly before landing
  private jumpBufferTime = 80; // ms
  private lastJumpPressTime = -1000; // Start negative to prevent auto-jump at game start

  // Track current animation to avoid restarting it
  private currentAnimation = '';
  private lastAnimationChangeTime = 0;
  private animationDebounceTime = 100; // ms - minimum time before allowing animation change

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y);

    // Create the visual sprite as a child - it won't affect physics
    // Sprite frames are now aligned with feet at bottom-center
    // Body bottom is at y=+35, so place sprite feet there
    this.sprite = scene.add.sprite(-15, 5, 'player', 'idle_01');
    this.sprite.setScale(0.5); // Scale down the 192x192 sprite to 96x96
    this.sprite.setOrigin(0.5, 1); // Anchor at bottom-center (feet)
    this.add(this.sprite);

    // Add container to scene and enable physics on the CONTAINER (not the sprite)
    scene.add.existing(this);
    scene.physics.add.existing(this);

    const body = this.body as Phaser.Physics.Arcade.Body;

    // Set a fixed body size for the container - this won't change with animations
    body.setSize(50, 70);
    body.setOffset(-25, -35); // Center the body on the container origin

    // Basic physics setup
    this.setSize(50, 70); // Container size for physics
    body.setCollideWorldBounds(true);
    body.setBounce(0);
  }

  override update(cursors: Phaser.Types.Input.Keyboard.CursorKeys): void {
    if (this.isAttacking) {
      return;
    }

    const body = this.body as Phaser.Physics.Arcade.Body;
    const currentTime = this.scene.time.now;

    // Ensure body stays enabled
    if (!body.enable) {
      body.enable = true;
    }

    // Ground detection - check if body is blocked from below
    const isOnGround = body.blocked.down;

    if (isOnGround) {
      this.isGrounded = true;
      this.lastGroundedTime = currentTime;
      this.canDoubleJump = true;
    } else {
      // Only mark as not grounded if we've been off the ground for a bit
      // This prevents flickering from single-frame ground detection failures
      const groundedGracePeriod = 100; // ms - increased to prevent animation flickering
      if (currentTime - this.lastGroundedTime > groundedGracePeriod) {
        this.isGrounded = false;
      }
    }

    // Coyote time check
    const canCoyoteJump = (currentTime - this.lastGroundedTime) < this.coyoteTime;

    const isMoving = cursors.left.isDown || cursors.right.isDown;

    // Horizontal movement
    if (cursors.left.isDown) {
      body.setVelocityX(-this.speed);
      this.sprite.setFlipX(true);
    } else if (cursors.right.isDown) {
      body.setVelocityX(this.speed);
      this.sprite.setFlipX(false);
    } else {
      body.setVelocityX(0);
    }

    // Track jump input (for jump buffer)
    if (Phaser.Input.Keyboard.JustDown(cursors.up!)) {
      this.lastJumpPressTime = currentTime;
    }

    // Check if jump was recently pressed (jump buffer)
    const jumpBuffered = (currentTime - this.lastJumpPressTime) < this.jumpBufferTime;

    // Jump logic
    if (jumpBuffered) {
      if (this.isGrounded || canCoyoteJump) {
        body.setVelocityY(this.jumpVelocity);
        this.isGrounded = false;
        this.lastGroundedTime = 0;
        this.lastJumpPressTime = 0;
      } else if (this.canDoubleJump) {
        body.setVelocityY(this.jumpVelocity);
        this.canDoubleJump = false;
        this.lastJumpPressTime = 0;
      }
    }

    // Attack
    if (Phaser.Input.Keyboard.JustDown(cursors.space!)) {
      this.attack();
      return;
    }

    // Determine animation state
    // Use isGrounded flag which has hysteresis logic for stability
    let targetAnim: string;
    if (!this.isGrounded) {
      targetAnim = 'player_jump';
    } else if (isMoving) {
      targetAnim = 'player_walk';
    } else {
      targetAnim = 'player_idle';
    }

    // Only change animation if different from current and debounce time has passed
    // Jump animation bypasses debounce for responsiveness
    const canChangeAnimation =
      targetAnim === 'player_jump' ||
      (currentTime - this.lastAnimationChangeTime) >= this.animationDebounceTime;

    if (this.currentAnimation !== targetAnim && canChangeAnimation) {
      this.currentAnimation = targetAnim;
      this.lastAnimationChangeTime = currentTime;
      this.sprite.anims.play(targetAnim, true);
    }
  }

  private attack(): void {
    const currentTime = Date.now();
    if (currentTime - this.lastAttackTime < this.attackCooldown) {
      return;
    }

    this.isAttacking = true;
    this.lastAttackTime = currentTime;
    this.playerState = 'attack';

    // Play slash animation
    this.currentAnimation = 'player_slash';
    this.sprite.anims.play('player_slash');

    // End attack after a delay (since we have single frame)
    this.scene.time.delayedCall(300, () => {
      this.isAttacking = false;
      // Reset animation tracking to force re-evaluation on next frame
      this.currentAnimation = '';
    });

    // Check for enemies in range
    this.checkAttackHit();
  }

  private checkAttackHit(): void {
    const attackRange = 80;
    const attackDirection = this.sprite.flipX ? -1 : 1;

    // Emit attack event for scene to handle
    this.scene.events.emit('playerAttack', {
      x: this.x + (attackDirection * attackRange / 2),
      y: this.y,
      width: attackRange,
      height: 60,
      damage: this.attackPower
    });
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

    // Visual feedback - flash red
    this.sprite.setTint(0xff0000);
    this.invulnerable = true;

    // Flicker effect
    this.scene.tweens.add({
      targets: this.sprite,
      alpha: 0.5,
      duration: 100,
      yoyo: true,
      repeat: 5,
      onComplete: () => {
        this.sprite.clearTint();
        this.sprite.setAlpha(1);
        this.invulnerable = false;
      }
    });

    console.log(`Player health: ${this.currentHealth}/${this.maxHealth}`);
  }

  heal(amount: number): void {
    this.currentHealth = Math.min(this.maxHealth, this.currentHealth + amount);

    // Green flash for healing
    this.sprite.setTint(0x00ff00);
    this.scene.time.delayedCall(200, () => {
      this.sprite.clearTint();
    });

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

    // Level up visual effect
    this.sprite.setTint(0xffff00);
    this.scene.time.delayedCall(500, () => {
      this.sprite.clearTint();
    });

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

  // Wrapper methods for sprite visual effects
  setTint(color: number): this {
    this.sprite.setTint(color);
    return this;
  }

  clearTint(): this {
    this.sprite.clearTint();
    return this;
  }
}
