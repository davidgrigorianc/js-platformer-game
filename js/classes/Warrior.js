class Warrior extends Sprite {
  constructor({
    position,
    collisionBlocks,
    platformCollisionBlocks,
    imageSrc,
    frameRate,
    scale = 0.5,
    animations,
  }) {
    super({ imageSrc, frameRate, scale });

    this.alive = true;
    this.isGrounded = false;
    this.health = 100;
    this.damage = 10;
    this.state = "idle";

    this.position = position;
    this.velocity = {
      x: 0,
      y: 1,
    };

    this.collisionBlocks = collisionBlocks;
    this.platformCollisionBlocks = platformCollisionBlocks;

    this.hitbox = {
      position: {
        x: this.position.x,
        y: this.position.y,
      },
      width: 10,
      height: 10,
    };

    this.attackBox = {
      position: {
        x: this.position.x,
        y: this.position.y,
      },
      width: 10,
      height: 10,
    };

    this.animations = animations;
    this.isAnimationStopped = false;

    for (let key in this.animations) {
      const image = new Image();
      image.src = this.animations[key].imageSrc;
      this.animations[key].image = image;
    }

    this.direction = "right";

    this.isAttacking = false;
    this.isTakingHit = false;

    this.cameraBox = {
      position: {
        x: this.position.x,
        y: this.position.y,
      },
      width: 200,
      height: 80,
    };
  }

  updateCameraBox() {
    this.cameraBox = {
      position: {
        x: this.position.x - 50,
        y: this.position.y,
      },
      width: 200,
      height: 80,
    };
  }

  checkForHorizontalCanvasCollisions() {
    if (
      this.hitbox.position.x + this.hitbox.width + this.velocity.x >= 576 ||
      this.hitbox.position.x + this.velocity.x <= 0
    ) {
      this.velocity.x = 0;
    }
  }

  shouldPanCameraToLeft({ canvas, camera }) {
    const cameraBoxRightSide = this.cameraBox.position.x + this.cameraBox.width;

    if (cameraBoxRightSide >= 574) return;
    if (cameraBoxRightSide >= canvas.width / 4 + Math.abs(camera.position.x)) {
      camera.position.x -= this.velocity.x;
    }
  }

  shouldPanCameraToRight({ canvas, camera }) {
    if (this.cameraBox.position.x <= 0) {
      return;
    }
    if (this.cameraBox.position.x <= Math.abs(camera.position.x)) {
      camera.position.x -= this.velocity.x;
    }
  }

  shouldPanCameraDown({ canvas, camera }) {
    if (this.cameraBox.position.y + this.velocity.y <= 0) return;
    if (this.cameraBox.position.y <= Math.abs(camera.position.y)) {
      camera.position.y -= this.velocity.y;
    }
  }

  shouldPanCameraUp({ canvas, camera }) {
    if (
      this.cameraBox.position.y + this.cameraBox.height + this.velocity.y >=
      432
    )
      return;
    const scaledCanvasHeight = canvas.height / 4;
    if (
      this.cameraBox.position.y + this.cameraBox.height >=
      Math.abs(camera.position.y) + scaledCanvasHeight
    ) {
      camera.position.y -= this.velocity.y;
    }
  }

  stopAnimationOnLastFrame() {
    this.isAnimationStopped = true;
    this.currentFrame = this.frameRate - 1;
  }

  update() {
    if (!this.isAnimationStopped) {
      this.updateFrames();
    }
    this.updateHitbox();
    this.updateAttackBox();
    this.updateCameraBox();

    if (this.velocity.y === 0) {
      this.isGrounded = true;
    } else {
      this.isGrounded = false;
    }
    // c.fillStyle = "rgba(34, 211, 255, 0.5)";
    // c.fillRect(
    //   this.attackBox.position.x,
    //   this.attackBox.position.y,
    //   this.attackBox.width,
    //   this.attackBox.height
    // );

    // c.fillStyle = "rgba(34, 211, 255, 0.5)";
    // c.fillRect(
    //   this.cameraBox.position.x,
    //   this.cameraBox.position.y,
    //   this.cameraBox.width,
    //   this.cameraBox.height
    // );
    // c.fillStyle = "rgba(76, 0, 255, 0.5)";
    // c.fillRect(this.position.x, this.position.y, this.width, this.height);

    // c.fillStyle = "rgba(34, 211, 18, 0.5)";
    // c.fillRect(
    //   this.hitbox.position.x,
    //   this.hitbox.position.y,
    //   this.hitbox.width,
    //   this.hitbox.height
    // );

    this.draw();
    this.position.x += this.velocity.x;
    this.updateHitbox();
    this.checkForHorizontalCollisions();
    this.applyGravity();
    this.updateHitbox();
    this.checkForVerticalCollisions();
  }
  updateHitbox() {
    let offsetX = 0;
    if (this.direction === "left") {
      offsetX = -8;
    }
    this.hitbox = {
      position: {
        x: this.position.x + (70 + offsetX) * this.scale,
        y: this.position.y + 52 * this.scale,
      },
      width: 28 * this.scale,
      height: 54 * this.scale,
    };
  }

  updateAttackBox() {
    let offsetX = 90;
    if (this.direction === "left") {
      offsetX = 22;
    }
    this.attackBox = {
      position: {
        x: this.position.x + offsetX * this.scale,
        y: this.position.y + 60 * this.scale,
      },
      width: 60 * this.scale,
      height: 40 * this.scale,
    };
  }

  applyGravity() {
    this.velocity.y += gravity;
    this.position.y += this.velocity.y;
  }

  checkForVerticalCollisions() {
    for (let i = 0; i < this.collisionBlocks.length; i++) {
      const collisionBlock = this.collisionBlocks[i];

      if (
        collision({
          object1: this.hitbox,
          object2: collisionBlock,
        })
      ) {
        if (this.velocity.y > 0) {
          this.velocity.y = 0;

          const offset =
            this.hitbox.position.y - this.position.y + this.hitbox.height;

          this.position.y = collisionBlock.position.y - offset - 0.01;
          break;
        }
        if (this.velocity.y < 0) {
          this.velocity.y = 0;

          const offset = this.hitbox.position.y - this.position.y;

          this.position.y =
            collisionBlock.position.y + collisionBlock.height - offset + 0.01;
          break;
        }
      }
    }

    //platform collision blocks

    for (let i = 0; i < this.platformCollisionBlocks.length; i++) {
      const platformCollisionBlock = this.platformCollisionBlocks[i];

      if (
        platformCollision({
          object1: this.hitbox,
          object2: platformCollisionBlock,
        })
      ) {
        if (this.velocity.y > 0) {
          this.velocity.y = 0;

          const offset =
            this.hitbox.position.y - this.position.y + this.hitbox.height;

          this.position.y = platformCollisionBlock.position.y - offset - 0.01;
          break;
        }
      }
    }
  }

  checkForHorizontalCollisions() {
    for (let i = 0; i < this.collisionBlocks.length; i++) {
      const collisionBlock = this.collisionBlocks[i];

      if (
        collision({
          object1: this.hitbox,
          object2: collisionBlock,
        })
      ) {
        if (this.velocity.x > 0) {
          this.velocity.x = 0;

          const offset =
            this.hitbox.position.x - this.position.x + this.hitbox.width;

          this.position.x = collisionBlock.position.x - offset - 0.01;
          break;
        }
        if (this.velocity.x < 0) {
          this.velocity.x = 0;

          const offset = this.hitbox.position.x - this.position.x;

          this.position.x =
            collisionBlock.position.x + collisionBlock.width - offset + 0.01;
          break;
        }
      }
    }
  }

  switchSprite(spriteName) {
    if (this.isTakingHit && !spriteName.startsWith("TakeHit")) return;
    if (this.isAttacking && !spriteName.startsWith("Attack")) return;

    if (this.direction === "left") {
      const actionLeft = spriteName + "Left";
      if (this.animations[actionLeft]) {
        spriteName = actionLeft;
      }
    }
    console.log(spriteName);
    if (this.image === this.animations[spriteName].image || !this.loaded)
      return;

    this.currentFrame = 0;
    this.image = this.animations[spriteName].image;
    this.frameRate = this.animations[spriteName].frameRate;
    this.frameBuffer = this.animations[spriteName].frameBuffer;
  }

  switchDirection(direction) {
    this.direction = direction;
  }

  moveRight() {
    this.velocity.x = 1.7;
    if (this.velocity.y === 0) {
      this.switchSprite("Run");
    }
    this.switchDirection("right");
    this.checkForHorizontalCanvasCollisions();
  }

  moveLeft() {
    this.velocity.x = -1.7;
    if (this.velocity.y === 0) {
      this.switchSprite("RunLeft");
    }
    this.switchDirection("left");
    this.checkForHorizontalCanvasCollisions();
  }

  stopMoving() {
    this.velocity.x = 0;
    if (this.direction === "left") {
      this.switchSprite("IdleLeft");
    } else {
      this.switchSprite("Idle");
    }
  }

  attack(huntress) {
    if (this.isTakingHit) return;
    if (this.isAttacking) return;

    this.isAttacking = true;
    if (this.direction === "left") {
      this.switchSprite("Attack1Left");
    } else {
      this.switchSprite("Attack1");
    }

    const totalFrames = this.animations["Attack1"].frameRate;
    const attackDuration = totalFrames * this.frameBuffer * (1000 / 60);

    setTimeout(() => {
      this.isAttacking = false;
      this.switchSprite("Idle");
    }, attackDuration);
  }

  handleAttack(huntress) {
    if (
      collision({
        object1: this.attackBox,
        object2: huntress.hitbox,
      })
    ) {
      huntress.takeHit(this.damage);
      huntressHealthBar.style.width = huntress.health + "%";
    }
  }

  jump() {
    if (this.velocity.y === 0) {
      this.velocity.y = -3.7;
      this.isGrounded = false;
    }
  }

  takeHit(damage) {
    if (!this.alive) return;

    if (this.isTakingHit) return;

    this.isTakingHit = true;
    this.isAttacking = false; // Stop attacking when taking a hit
    this.switchSprite("TakeHit");

    this.health -= damage;

    setTimeout(() => {
      this.isTakingHit = false;
      if (this.health <= 0) {
        this.death();
        showGameResult("huntress");
      } else {
        this.switchSprite("Idle");
      }
    }, 400);
  }

  death() {
    if (!this.alive) return;

    console.log("Warrior has died!");

    this.alive = false;

    this.velocity.x = 0;
    //this.velocity.y = 0;
    this.switchSprite("Death");
    this.stopAnimationOnLastFrame();
  }

  changeState(state) {
    console.log("state", state);

    this.state = state;
  }
}
