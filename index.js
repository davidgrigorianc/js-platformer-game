// **Canvas and Context Setup**
const canvas = document.querySelector("canvas");
const c = canvas.getContext("2d");
canvas.width = 1074;
canvas.height = 576;
const scaledCanvas = { width: canvas.width / 4, height: canvas.height / 4 };

// **UI Elements**

const startButton = document.getElementById("startGame");
const startMenu = document.getElementById("startMenu");
const warriorHealthBar = document.querySelector("#warriorHealth");
const huntressHealthBar = document.querySelector("#huntressHealth");
const resultBox = document.getElementById("gameResultBox");
const resultText = document.getElementById("gameResultText");
const restartButton = document.getElementById("restartButton");
const characterButtons = document.querySelectorAll(".character-btn");
const startGameButton = document.getElementById("startGame");
const menuTitle = document.getElementById("menuTitle");
const menuSubtitle = document.getElementById("menuSubtitle");

// Highlight selected button & store character selection
characterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    characterButtons.forEach((btn) => btn.classList.remove("active"));
    button.classList.add("active");

    selectedCharacter = button.dataset.character;
    startGameButton.disabled = false;
  });
});

// **Game State Variables**
let isDebug = true;
let gameStarted = false;
let turnOnBot = true;
let player;
const gravity = 0.1;

// **Collision Block Arrays**
const createCollisionBlocks = (collisions, isPlatform = false) => {
  const collisionBlocks = [];
  const collisions2D = [];

  for (let i = 0; i < collisions.length; i += 36) {
    collisions2D.push(collisions.slice(i, i + 36));
  }

  collisions2D.forEach((row, y) => {
    row.forEach((symbol, x) => {
      if (symbol === 202) {
        collisionBlocks.push(
          new CollisionBlock({
            position: {
              x: x * 16,
              y: y * 16,
            },
            height: isPlatform ? 4 : undefined,
          })
        );
      }
    });
  });

  return collisionBlocks;
};

const collisionBlocks = createCollisionBlocks(floorCollisions);
const platformCollisionBlocks = createCollisionBlocks(platformCollisions, true);

// **Character Creation Helper**

const characterConfigs = {
  warrior: {
    imageSrc: "./img/warrior/Idle.png",
    frameRate: 8,
    animations: {
      Idle: {
        imageSrc: "./img/warrior/Idle.png",
        frameRate: 8,
        frameBuffer: 12,
      },
      IdleLeft: {
        imageSrc: "./img/warrior/IdleLeft.png",
        frameRate: 8,
        frameBuffer: 12,
      },
      Run: {
        imageSrc: "./img/warrior/Run.png",
        frameRate: 8,
        frameBuffer: 7,
      },
      RunLeft: {
        imageSrc: "./img/warrior/RunLeft.png",
        frameRate: 8,
        frameBuffer: 7,
      },
      Jump: {
        imageSrc: "./img/warrior/Jump.png",
        frameRate: 2,
        frameBuffer: 20,
      },
      JumpLeft: {
        imageSrc: "./img/warrior/JumpLeft.png",
        frameRate: 2,
        frameBuffer: 20,
      },
      Fall: {
        imageSrc: "./img/warrior/Fall.png",
        frameRate: 2,
        frameBuffer: 20,
      },
      FallLeft: {
        imageSrc: "./img/warrior/FallLeft.png",
        frameRate: 2,
        frameBuffer: 20,
      },
      Attack1: {
        imageSrc: "./img/warrior/Attack1.png",
        frameRate: 4,
        frameBuffer: 6,
      },
      Attack1Left: {
        imageSrc: "./img/warrior/Attack1Left.png",
        frameRate: 4,
        frameBuffer: 6,
      },
      Attack2: {
        imageSrc: "./img/warrior/Attack2.png",
        frameRate: 4,
        frameBuffer: 6,
      },
      Attack3: {
        imageSrc: "./img/warrior/Attack3.png",
        frameRate: 4,
        frameBuffer: 6,
      },
      TakeHit: {
        imageSrc: "./img/warrior/TakeHitWhite.png",
        frameRate: 4,
        frameBuffer: 6,
      },
      Death: {
        imageSrc: "./img/warrior/Death.png",
        frameRate: 6,
        frameBuffer: 12,
      },
    },
  },
  huntress: {
    imageSrc: "./img/huntress/Sprites/Character/Idle.png",
    frameRate: 10,
    animations: {
      Idle: {
        imageSrc: "./img/huntress/Sprites/Character/Idle.png",
        frameRate: 10,
        frameBuffer: 6,
      },
      IdleLeft: {
        imageSrc: "./img/huntress/Sprites/Character/IdleLeft.png",
        frameRate: 10,
        frameBuffer: 6,
      },
      Run: {
        imageSrc: "./img/huntress/Sprites/Character/Run.png",
        frameRate: 8,
        frameBuffer: 7,
      },
      RunLeft: {
        imageSrc: "./img/huntress/Sprites/Character/RunLeft.png",
        frameRate: 8,
        frameBuffer: 7,
      },
      Jump: {
        imageSrc: "./img/huntress/Sprites/Character/Jump.png",
        frameRate: 2,
        frameBuffer: 20,
      },
      JumpLeft: {
        imageSrc: "./img/huntress/Sprites/Character/JumpLeft.png",
        frameRate: 2,
        frameBuffer: 20,
      },
      Fall: {
        imageSrc: "./img/huntress/Sprites/Character/FallLeft.png",
        frameRate: 2,
        frameBuffer: 20,
      },
      FallLeft: {
        imageSrc: "./img/huntress/Sprites/Character/Fall.png",
        frameRate: 2,
        frameBuffer: 20,
      },
      Attack1: {
        imageSrc: "./img/huntress/Sprites/Character/Attack.png",
        frameRate: 6,
        frameBuffer: 4,
      },
      Attack1Left: {
        imageSrc: "./img/huntress/Sprites/Character/AttackLeft.png",
        frameRate: 6,
        frameBuffer: 4,
      },
      TakeHit: {
        imageSrc: "./img/huntress/Sprites/Character/GetHitWhite.png",
        frameRate: 4,
        frameBuffer: 6,
      },
      TakeHitLeft: {
        imageSrc: "./img/huntress/Sprites/Character/GetHitWhite.png",
        frameRate: 4,
        frameBuffer: 6,
      },
      Death: {
        imageSrc: "./img/huntress/Sprites/Character/Death.png",
        frameRate: 10,
        frameBuffer: 10,
      },
    },
  },
};
function createCharacter(
  CharacterClass,
  position,
  collisionBlocks,
  platformBlocks,
  scale = 0.5
) {
  const config = characterConfigs[CharacterClass.name.toLowerCase()];
  return new CharacterClass({
    position,
    collisionBlocks,
    platformCollisionBlocks: platformBlocks,
    imageSrc: config.imageSrc,
    frameRate: config.frameRate,
    animations: config.animations,
    scale,
  });
}

function randomNumber(min, max) {
  return Math.random() * (max - min) + min;
}

// **Create Initial Characters (for game start and restart)**
let warrior;
let huntress;

function createInitialCharacters() {
  warrior = createCharacter(
    Warrior,
    { x: randomNumber(100, 300), y: randomNumber(100, 380) },
    collisionBlocks,
    platformCollisionBlocks,
    0.55
  );
  //x: randomNumber(100, 450)
  huntress = createCharacter(
    Huntress,
    { x: randomNumber(200, 450), y: randomNumber(100, 380) },
    collisionBlocks,
    platformCollisionBlocks,
    0.6
  );
}

// **Character Instances Creation**
createInitialCharacters();

player = huntress;

const arrows = [];
const keys = {
  left: { pressed: false },
  right: { pressed: false },
  space: { pressed: false },
};

// **Camera and background**
const background = new Sprite({
  position: { x: 0, y: 0 },
  imageSrc: "./img/background.png",
});
const backgroundImageHeight = 432;
const camera = {
  position: {
    x: 0,
    y: -backgroundImageHeight + scaledCanvas.height,
  },
};

// **Event Listeners**
setupEventListeners();

// **Game Start and UI Functions**
function setupEventListeners() {
  startButton.addEventListener("click", startGame);
  restartButton.addEventListener("click", restartGame);
  window.addEventListener("keydown", handleKeyDown);
  window.addEventListener("keyup", handleKeyUp);
}

function startGame() {
  const selectedCharacter = document.querySelector(".character-btn.active");
  if (!selectedCharacter) {
    return;
  }

  const chosenCharacter = selectedCharacter.dataset.character;
  console.log("chosenCharacter", chosenCharacter);

  menuBox.style.display = "none";

  createInitialCharacters();
  updateCameraPosition();
  startTimer();
  if (chosenCharacter === "warrior") {
    player = warrior;
  } else if (chosenCharacter === "huntress") {
    player = huntress;
  }
  gameStarted = true;
}

function restartGame() {
  warrior.health = 100;
  huntress.health = 100;
  const selectedCharacter = document.querySelector(".character-btn.active");

  const chosenCharacter = selectedCharacter.dataset.character;

  warriorHealthBar.style.width = "100%";
  huntressHealthBar.style.width = "100%";

  createInitialCharacters();

  if (chosenCharacter === "warrior") {
    player = warrior;
  } else if (chosenCharacter === "huntress") {
    player = huntress;
  }

  updateCameraPosition();
  gameStarted = true;
  console.log("Game restarted!");
  startTimer();

  menuBox.style.display = "none";
}

function showGameResult(winner) {
  let isWin = player === warrior && winner === "warrior" ? true : false;
  menuBox.style.display = "block";
  resultText.textContent = isWin ? "You Win!" : "You Died!";
  resultText.classList.toggle("win", isWin);
  resultText.classList.toggle("died", !isWin);
  resultText.style.display = "block";
  menuTitle.style.display = "none";
  menuSubtitle.style.display = "none";
  startButton.style.display = "none";
  restartButton.style.display = "block";
  gameStarted = false;
}

// **Input Handlers**
function handleKeyDown(event) {
  switch (event.code) {
    case "ArrowRight":
      keys.right.pressed = true;
      break;
    case "ArrowLeft":
      keys.left.pressed = true;
      break;
    case "ArrowUp":
      if (player.alive) player.jump();
      break;
    case "Space":
      if (player.alive) player.attack(huntress);
      break;
  }
  if (isDebug) {
    switch (event.code) {
      case "KeyP":
        switchPlayer();
        break;
      case "KeyB":
        toggleBot();
        break;
      case "KeyW":
        camera.position.y += 5;
        break;
      case "KeyS":
        camera.position.y -= 5;
        break;
      case "KeyA":
        camera.position.x += 5;
        break;
      case "KeyD":
        camera.position.x -= 5;
        break;
    }
  }
}

function handleKeyUp(event) {
  switch (event.code) {
    case "ArrowRight":
      keys.right.pressed = false;
      break;
    case "ArrowLeft":
      keys.left.pressed = false;
      break;
  }
}

// **Player and Bot Switching**
function switchPlayer() {
  player = player === warrior ? huntress : warrior;
  updateCameraPosition();
}

function toggleBot() {
  turnOnBot = !turnOnBot;
}

function updateCameraPosition() {
  setTimeout(() => {
    camera.position.x = -(
      player.cameraBox.position.x +
      player.cameraBox.width / 2 -
      canvas.width / 8
    );
    camera.position.y = -(
      player.cameraBox.position.y +
      player.cameraBox.height / 2 -
      canvas.height / 8
    );
    if (camera.position.y < -285) {
      camera.position.y = -285;
    }
    if (camera.position.y > -1) {
      camera.position.y = -1;
    }
    if (camera.position.x < -304) {
      camera.position.x = -304;
    }
    if (camera.position.x > -1) {
      camera.position.x = -1;
    }
  }, 200);
}
function updateMonitoring(huntress, warrior) {
  // Update Huntress values
  document.querySelector(".huntress-hitbox-x").textContent =
    huntress.hitbox.position.x.toFixed(2);
  document.querySelector(".huntress-hitbox-y").textContent =
    huntress.hitbox.position.y.toFixed(2);
  document.querySelector(".huntress-isGrounded").textContent =
    huntress.isGrounded;

  // Update Warrior values
  document.querySelector(".warrior-hitbox-x").textContent =
    warrior.hitbox.position.x.toFixed(2);
  document.querySelector(".warrior-hitbox-y").textContent =
    warrior.hitbox.position.y.toFixed(2);

  document.querySelector(".warrior-state").textContent = warrior.state;
  document.querySelector(".warrior-isGrounded").textContent =
    warrior.isGrounded;

  document.querySelector(".camera-position-x").textContent = camera.position.x;
  document.querySelector(".camera-position-y").textContent = camera.position.y;
}

// **Game Loop**
function animate() {
  window.requestAnimationFrame(animate);
  c.fillStyle = "white";
  c.fillRect(0, 0, canvas.width, canvas.height);
  c.save();
  c.scale(4, 4);
  c.translate(camera.position.x, camera.position.y);

  background.update();
  if (gameStarted) {
    huntress.checkForHorizontalCanvasCollisions();
    warrior.checkForHorizontalCanvasCollisions();

    huntress.update();
    warrior.update();
    //  getNearestPlatform(warrior);
    if (isDebug) {
      updateMonitoring(huntress, warrior);
    }

    if (warrior.isAttacking) warrior.handleAttack(huntress);

    if (turnOnBot && player != huntress)
      setTimeout(() => {
        updateHuntressState(huntress, warrior, collisionBlocks), 500;
      });
    if (turnOnBot && player != warrior)
      setTimeout(() => {
        updateWarriorState(
          warrior,
          huntress,
          collisionBlocks,
          platformCollisionBlocks
        ),
          500;
      });

    updateArrows();
    handlePlayerMovement();
  }
  c.restore();
}

function updateArrows() {
  arrows.forEach((arrow, index) => {
    arrow.update();
    if (collision({ object1: warrior.hitbox, object2: arrow }) && !arrow.hit) {
      warrior.takeHit(arrow.damage);
      arrow.hit = true;
      warriorHealthBar.style.width = warrior.health + "%";
    }
    if (arrow.position.x < 0 || arrow.position.x > canvas.width)
      arrows.splice(index, 1);
  });
}

function handlePlayerMovement() {
  if (player && player.alive) {
    player.velocity.x = 0;
    if (keys.right.pressed) {
      player.velocity.x = 2;
      if (player.velocity.y === 0) {
        player.switchSprite("Run");
      }
      player.switchDirection("right");
      player.shouldPanCameraToLeft({ canvas, camera });
    } else if (keys.left.pressed) {
      player.velocity.x = -2;
      if (player.velocity.y === 0) {
        player.switchSprite("RunLeft");
      }

      player.switchDirection("left");
      player.shouldPanCameraToRight({ canvas, camera });
    } else if (player.velocity.y === 0) {
      player.switchSprite("Idle");
    }
    if (player.velocity.y < 0) {
      player.shouldPanCameraDown({ canvas, camera });
      player.switchSprite("Jump");
    } else if (player.velocity.y > 0) {
      player.shouldPanCameraUp({ canvas, camera });
      player.switchSprite("Fall");
    }
  }
}

animate();

// **Timer
let timerInterval;
let gameTime = 180;

function startTimer() {
  let timeLeft = gameTime;
  document.getElementById("gameTimer").textContent = formatTime(timeLeft);

  clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    timeLeft--;
    document.getElementById("gameTimer").textContent = formatTime(timeLeft);
    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      gameOver();
    }
  }, 1000);
}

function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

function gameOver() {
  document.getElementById("gameTimer").textContent = "03:00";
  let winner = warrior.health > huntress.health ? "warrior" : "huntress";
  if (warrior.health === huntress.health) {
    huntress.death();
    warrior.death();
    showGameResult(player === huntress ? "huntress" : "warrior");
    return;
  }
  if (winner === "warrior") {
    huntress.death();
    showGameResult("warrior");
  } else {
    warrior.death();
    showGameResult("huntress");
  }
}
