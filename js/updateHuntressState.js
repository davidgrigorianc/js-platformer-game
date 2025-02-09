let lastDirectionChangeTime = 0;
const directionCooldown = 400;

function updateHuntressState(huntress, warrior, groundCollisionBlocks) {
  if (huntress.isTakingHit || !huntress.alive || !warrior.alive) {
    return;
  }
  const currentTime = Date.now();

  const distance = huntress.hitbox.position.x - warrior.hitbox.position.x;
  const distanceAbs = Math.abs(distance);

  const nearLeftBorder = huntress.hitbox.position.x <= 50;
  const nearRightBorder = huntress.hitbox.position.x >= 500;
  const isOnSameVerticalLevel =
    Math.abs(huntress.hitbox.position.y - warrior.hitbox.position.y) < 15;
  huntress.checkForHorizontalCanvasCollisions();

  function isWallInFront(huntress) {
    const direction = huntress.direction === "right" ? 1 : -1; // Check for wall based on direction
    const nextX =
      huntress.hitbox.position.x + direction * huntress.hitbox.width;

    return groundCollisionBlocks.some((ground) => {
      const withinXRange =
        nextX + huntress.hitbox.width > ground.position.x &&
        nextX < ground.position.x + ground.width;

      if (withinXRange) {
        ground.update();
      }

      const directlyAtLevel =
        ground.position.y + ground.height <=
        huntress.hitbox.position.y + huntress.hitbox.height;

      return directlyAtLevel && withinXRange;
    });
  }

  // **Attack logic:** Huntress attacks within a specific range
  if (
    distanceAbs >= 50 &&
    distanceAbs <= 150 &&
    checkVerticalCollisionForBot(huntress.hitbox, warrior.hitbox)
  ) {
    if (distance > 0 && huntress.direction === "right") {
      huntress.switchDirection("left");
    } else if (distance < 0 && huntress.direction === "left") {
      huntress.switchDirection("right");
    }

    if (isOnSameVerticalLevel) {
      huntress.attack();
      huntress.velocity.x = 0;
    }
  }

  // **Escape logic:** Handle near border cases
  else if (distanceAbs < 50 && isOnSameVerticalLevel) {
    // adding unprediction
    if (Math.random() < 0.1) {
      if (currentTime - lastDirectionChangeTime > directionCooldown) {
        huntress.jump();
        if (distance > 0 && huntress.direction === "right") {
          if (currentTime - lastDirectionChangeTime > directionCooldown) {
            huntress.moveLeft();
            huntress.jump();
            lastDirectionChangeTime = currentTime;
          }
        } else if (distance < 0 && huntress.direction === "left") {
          if (currentTime - lastDirectionChangeTime > directionCooldown) {
            huntress.jump();
            huntress.moveRight();
            lastDirectionChangeTime = currentTime;
          }
        }
        lastDirectionChangeTime = currentTime;
      }
    } else if (nearRightBorder) {
      if (currentTime - lastDirectionChangeTime > directionCooldown) {
        huntress.moveLeft();
        huntress.jump();
        lastDirectionChangeTime = currentTime;
      }
    } else if (nearLeftBorder) {
      if (huntress.hitbox.position.x <= 50) {
        if (currentTime - lastDirectionChangeTime > directionCooldown) {
          huntress.jump();
          huntress.moveRight();
          lastDirectionChangeTime = currentTime;
        }
      } else if (isWallInFront(huntress)) {
        huntress.jump();
      } else {
        if (currentTime - lastDirectionChangeTime > directionCooldown) {
          huntress.moveRight();
          lastDirectionChangeTime = currentTime;
        }
      }
    } else if (!nearLeftBorder && !nearRightBorder) {
      if (distance > 0) {
        if (!isWallInFront(huntress)) {
          if (Math.random() < 0.2) {
            huntress.jump();
            huntress.moveLeft();
          } else if (
            currentTime - lastDirectionChangeTime >
            directionCooldown
          ) {
            huntress.jump();
            huntress.moveRight();
            lastDirectionChangeTime = currentTime;
          }
        } else {
          huntress.jump();
        }
      } else {
        if (!isWallInFront(huntress)) {
          if (Math.random() < 0.2) {
            huntress.jump();
            huntress.moveRight();
          } else if (
            currentTime - lastDirectionChangeTime >
            directionCooldown
          ) {
            huntress.moveLeft();
            lastDirectionChangeTime = currentTime;
          }
        } else {
          huntress.jump();
        }
      }
    }
  } else {
    if (currentTime - lastDirectionChangeTime > directionCooldown) {
      if (Math.random() < 0.1) {
        huntress.moveRight();
        lastDirectionChangeTime = currentTime;
      }
    }
    if (currentTime - lastDirectionChangeTime > directionCooldown) {
      if (Math.random() < 0.1) {
        huntress.moveLeft();
        lastDirectionChangeTime = currentTime;
      }
    }

    if (Math.random() < 0.1) {
      huntress.jump();
    }
  }
}

function updateWarriorState(
  warrior,
  huntress,
  groundCollisionBlocks,
  platformCollisionBlocks
) {
  if (!warrior.alive || !huntress.alive) {
    return;
  }

  const distance = warrior.hitbox.position.x - huntress.hitbox.position.x;
  const distanceAbs = Math.abs(distance);
  const isOnSameVerticalLevel =
    Math.abs(huntress.hitbox.position.y - warrior.hitbox.position.y) < 15;
  huntress.checkForHorizontalCanvasCollisions();

  warrior.checkForHorizontalCanvasCollisions();

  function canJumpToHuntress() {
    const verticalDistance =
      huntress.hitbox.position.y - warrior.hitbox.position.y;
    const verticalDistanceAbs = Math.abs(verticalDistance);
    const horizontalDistanceAbs = Math.abs(
      huntress.hitbox.position.x - warrior.hitbox.position.x
    );

    // Check if the warrior can jump vertically towards the Huntress
    if (
      verticalDistance < -10 &&
      verticalDistanceAbs > 15 &&
      verticalDistanceAbs < 50 &&
      horizontalDistanceAbs < 200
    ) {
      return true;
    }
    return false;
  }

  // **Check if there's a platform to jump onto:** Warrior can jump on a platform if it's within a certain range above the warrior
  if (warrior.isGrounded && (canJumpToHuntress() || isOnSameVerticalLevel)) {
    warrior.state = "goToHuntress";
  }

  // **Attack logic:** Warrior attacks when attackbox collides with huntress hitbox
  if (
    collision({
      object1: warrior.attackBox,
      object2: huntress.hitbox,
    })
  ) {
    if (Math.random() < 0.1) {
      warrior.attack();
    }
  }

  // **Movement logic:** Move towards the Huntress
  if (warrior.state === "goToHuntress") {
    if (
      distance >= 0 &&
      warrior.isGrounded &&
      (isOnSameVerticalLevel ||
        canJumpToHuntress() ||
        huntress.hitbox.position.y > warrior.hitbox.position.y)
    ) {
      warrior.moveLeft();
    } else if (
      distance < 0 &&
      warrior.isGrounded &&
      (isOnSameVerticalLevel ||
        canJumpToHuntress() ||
        huntress.hitbox.position.y > warrior.hitbox.position.y)
    ) {
      warrior.moveRight();
    }
    if (canJumpToHuntress() && !huntress.isGrounded) {
      warrior.jump();
    }
  }

  if (
    huntress.hitbox.position.y > warrior.hitbox.position.y &&
    warrior.isGrounded &&
    huntress.isGrounded
  ) {
    warrior.changeState("shouldGoDown");
  }

  if (warrior.state === "shouldGoDown") {
    if (distance < 0) {
      warrior.moveRight();
    } else {
      warrior.moveLeft();
    }

    if (isOnSameVerticalLevel) {
      warrior.changeState("goToHuntress");
    }
    return;
  }

  // **Jump logic:** Warrior will jump only if they are not on the same vertical level and can jump to huntress or platform
  if (
    warrior.hitbox.position.y > huntress.hitbox.position.y &&
    huntress.isGrounded
  ) {
    warrior.changeState("jumpingToPlatform");
    moveToNearestPlatform();
  }
}

function canJumpToPlatformRunning(warrior, platform) {
  const warriorX = warrior.hitbox.position.x;
  const warriorY = warrior.hitbox.position.y;
  const platformX = platform.position.x;
  const platformY = platform.position.y;

  const horizontalDistance = Math.abs(warriorX - platformX);
  const verticalDistance = Math.abs(platformY - warriorY);

  // Conditions:
  // 1. Platform is within a reasonable horizontal range while running.
  // 2. Platform is higher but within a jumpable vertical range.
  // 3. Warrior is grounded and moving towards the platform.

  return (
    horizontalDistance > 0 &&
    horizontalDistance < 50 &&
    verticalDistance > 0 &&
    verticalDistance < 70 &&
    warrior.isGrounded
  );
}

function moveAndJumpToPlatform(warrior, targetPlatform) {
  if (targetPlatform) {
    const platformCenterX =
      targetPlatform.position.x + targetPlatform.width / 2;

    if (warrior.hitbox.position.x < platformCenterX) {
      warrior.moveRight();
    } else if (warrior.hitbox.position.x > platformCenterX) {
      warrior.moveLeft();
    }
    if (Math.abs(warrior.hitbox.position.x - platformCenterX) < 70) {
      warrior.jump();
    }
    if (warrior.isGrounded) {
      warrior.changeState("idle");
    }
  }
}

function moveToNearestPlatform() {
  if (!warrior.isGrounded) {
    return;
  }
  const targetPlatform = platformCollisionBlocks
    .filter((platform) => {
      const verticalDistance = Math.abs(
        warrior.hitbox.position.y - platform.position.y
      );

      return (
        verticalDistance > 0 &&
        verticalDistance < 40 &&
        warrior.hitbox.position.y > platform.position.y
      );
    })
    .sort((a, b) => {
      return (
        Math.abs(warrior.hitbox.position.x - a.position.x) -
        Math.abs(warrior.hitbox.position.x - b.position.x)
      );
    })[0];
  if (targetPlatform) {
    targetPlatform.update();
  }

  if (targetPlatform) {
    const platformCenterX =
      targetPlatform.position.x + targetPlatform.width / 2;

    if (Math.abs(warrior.hitbox.position.x - platformCenterX) < 10) {
      warrior.stopMoving();
      warrior.jump();
      warrior.changeState("goToHuntress");
    } else if (canJumpToPlatformRunning(warrior, targetPlatform)) {
      moveAndJumpToPlatform(warrior, targetPlatform);
      if (
        warrior.hitbox.position.y < targetPlatform.position.y &&
        warrior.isGrounded
      ) {
        //   console.log("PLATFORM REACHED");
      }
    } else {
      if (warrior.hitbox.position.x < platformCenterX && warrior.isGrounded) {
        warrior.moveRight();
      } else if (
        warrior.hitbox.position.x > platformCenterX &&
        warrior.isGrounded
      ) {
        warrior.moveLeft();
      }
    }
    // Clear target when reached
    if (
      warrior.hitbox.position.y < targetPlatform.position.y &&
      warrior.isGrounded
    ) {
      targetPlatform.reached();

      warrior.changeState("idle");
    }
  }
}
