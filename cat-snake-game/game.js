## ignore me im fat
const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const scoreEl = document.getElementById("score");
const bestEl = document.getElementById("best");
const timerEl = document.getElementById("timer");
const restartBtn = document.getElementById("restart");

const gridSize = 20;
const tileCount = canvas.width / gridSize;
const speedMs = 95;
const totalTimeSec = 60;

let direction = { x: 1, y: 0 };
let nextDirection = { x: 1, y: 0 };
let snake = [];
let mouse = { x: 0, y: 0 };
let score = 0;
let best = Number(localStorage.getItem("catSnakeBest") || 0);
let timeLeftSec = totalTimeSec;
let gameStartMs = 0;
let gameOver = false;
let tickHandle;

bestEl.textContent = String(best);

function resetGame() {
  snake = [
    { x: 8, y: 10 },
    { x: 7, y: 10 },
    { x: 6, y: 10 },
  ];
  direction = { x: 1, y: 0 };
  nextDirection = { x: 1, y: 0 };
  score = 0;
  timeLeftSec = totalTimeSec;
  gameStartMs = Date.now();
  gameOver = false;
  scoreEl.textContent = "0";
  timerEl.textContent = String(timeLeftSec);
  spawnMouse();
  clearInterval(tickHandle);
  tickHandle = setInterval(gameTick, speedMs);
  draw();
}

function spawnMouse() {
  while (true) {
    const candidate = {
      x: Math.floor(Math.random() * tileCount),
      y: Math.floor(Math.random() * tileCount),
    };
    const overlaps = snake.some((part) => part.x === candidate.x && part.y === candidate.y);
    if (!overlaps) {
      mouse = candidate;
      return;
    }
  }
}

function gameTick() {
  if (gameOver) return;
  const elapsedSec = Math.floor((Date.now() - gameStartMs) / 1000);
  timeLeftSec = Math.max(0, totalTimeSec - elapsedSec);
  timerEl.textContent = String(timeLeftSec);
  if (timeLeftSec === 0) {
    finishGame("Time Up!");
    return;
  }

  direction = nextDirection;

  const head = {
    x: snake[0].x + direction.x,
    y: snake[0].y + direction.y,
  };

  const hitWall = head.x < 0 || head.y < 0 || head.x >= tileCount || head.y >= tileCount;
  const hitSelf = snake.some((part) => part.x === head.x && part.y === head.y);

  if (hitWall || hitSelf) {
    finishGame("Cat Napped!");
    return;
  }

  snake.unshift(head);

  if (head.x === mouse.x && head.y === mouse.y) {
    score += 1;
    scoreEl.textContent = String(score);
    spawnMouse();
  } else {
    snake.pop();
  }

  draw();
}

function finishGame(title = "Cat Napped!") {
  gameOver = true;
  clearInterval(tickHandle);
  if (score > best) {
    best = score;
    localStorage.setItem("catSnakeBest", String(best));
    bestEl.textContent = String(best);
  }
  draw();

  ctx.fillStyle = "rgba(0,0,0,0.55)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#ffe7b0";
  ctx.font = "bold 44px Trebuchet MS";
  ctx.textAlign = "center";
  ctx.fillText(title, canvas.width / 2, canvas.height / 2 - 10);
  ctx.font = "22px Trebuchet MS";
  ctx.fillText("Press Restart", canvas.width / 2, canvas.height / 2 + 30);
}

function draw() {
  ctx.fillStyle = "#1c3531";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  drawGrid();
  drawMouse();
  drawSnake();
}

function drawGrid() {
  ctx.strokeStyle = "#244743";
  ctx.lineWidth = 1;
  for (let i = 1; i < tileCount; i += 1) {
    const pos = i * gridSize;
    ctx.beginPath();
    ctx.moveTo(pos, 0);
    ctx.lineTo(pos, canvas.height);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, pos);
    ctx.lineTo(canvas.width, pos);
    ctx.stroke();
  }
}

function drawMouse() {
  const px = mouse.x * gridSize;
  const py = mouse.y * gridSize;

  ctx.fillStyle = "#c3c3c3";
  ctx.beginPath();
  ctx.ellipse(px + 10, py + 12, 8, 6, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.beginPath();
  ctx.ellipse(px + 5, py + 7, 3, 4, 0, 0, Math.PI * 2);
  ctx.ellipse(px + 13, py + 7, 3, 4, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = "#8e8e8e";
  ctx.beginPath();
  ctx.moveTo(px + 18, py + 13);
  ctx.quadraticCurveTo(px + 23, py + 15, px + 25, py + 20);
  ctx.stroke();

  ctx.fillStyle = "#111";
  ctx.fillRect(px + 9, py + 11, 1.8, 1.8);
}

function drawSnake() {
  snake.forEach((part, index) => {
    const px = part.x * gridSize;
    const py = part.y * gridSize;

    if (index === 0) {
      drawCatHead(px, py);
      return;
    }

    const hueShift = Math.max(0, 56 - index * 2);
    ctx.fillStyle = `rgb(${84 + hueShift}, ${130 + Math.floor(hueShift / 2)}, 77)`;
    ctx.fillRect(px + 2, py + 2, gridSize - 4, gridSize - 4);
  });
}

function drawCatHead(px, py) {
  ctx.fillStyle = "#f4b942";
  ctx.fillRect(px + 1, py + 3, 18, 16);

  ctx.beginPath();
  ctx.moveTo(px + 3, py + 4);
  ctx.lineTo(px + 6, py + 0);
  ctx.lineTo(px + 8, py + 5);
  ctx.moveTo(px + 12, py + 5);
  ctx.lineTo(px + 14, py + 0);
  ctx.lineTo(px + 17, py + 4);
  ctx.fill();

  const eyeOffset = direction.x === -1 ? -2 : direction.x === 1 ? 2 : 0;
  const eyeVertical = direction.y === -1 ? -2 : direction.y === 1 ? 2 : 0;

  ctx.fillStyle = "#111";
  ctx.fillRect(px + 6 + eyeOffset, py + 9 + eyeVertical, 2, 2);
  ctx.fillRect(px + 12 + eyeOffset, py + 9 + eyeVertical, 2, 2);

  ctx.strokeStyle = "#6e4c10";
  ctx.beginPath();
  ctx.moveTo(px + 10, py + 12);
  ctx.lineTo(px + 10, py + 15);
  ctx.moveTo(px + 10, py + 14);
  ctx.lineTo(px + 6, py + 15);
  ctx.moveTo(px + 10, py + 14);
  ctx.lineTo(px + 14, py + 15);
  ctx.stroke();
}

function updateDirection(key) {
  if (key === "ArrowUp" || key.toLowerCase() === "w") {
    if (direction.y !== 1) nextDirection = { x: 0, y: -1 };
  }
  if (key === "ArrowDown" || key.toLowerCase() === "s") {
    if (direction.y !== -1) nextDirection = { x: 0, y: 1 };
  }
  if (key === "ArrowLeft" || key.toLowerCase() === "a") {
    if (direction.x !== 1) nextDirection = { x: -1, y: 0 };
  }
  if (key === "ArrowRight" || key.toLowerCase() === "d") {
    if (direction.x !== -1) nextDirection = { x: 1, y: 0 };
  }
}

window.addEventListener("keydown", (e) => updateDirection(e.key));
restartBtn.addEventListener("click", resetGame);

resetGame();
