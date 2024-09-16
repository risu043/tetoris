const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const BLOCK_SIZE = 32;
const COLS = 10;
const ROWS = 20;
let score = 0;
let dropSpeed = 1000;
let isPaused = false;
let displayScore = document.getElementById('score');
let startButton = document.getElementById('start-button');
let pauseButton = document.getElementById('pause-button');
const pausedMessage = document.getElementById('paused-message');

// テトリミノの色
const COLORS = [
  '#FF0000',
  '#00FF00',
  '#0000FF',
  '#FFFF00',
  '#00FFFF',
  '#FF00FF',
  '#FFA500',
];

let board = [];
let currentPiece;

// テトリミノの形
const SHAPES = [
  [[1, 1, 1, 1]],
  [
    [1, 1],
    [1, 1],
  ],
  [
    [1, 1, 1],
    [0, 1, 0],
  ],
  [
    [1, 1, 1],
    [1, 0, 0],
  ],
  [
    [1, 1, 1],
    [0, 0, 1],
  ],
  [
    [1, 1, 0],
    [0, 1, 1],
  ],
  [
    [0, 1, 1],
    [1, 1, 0],
  ],
];

function init() {
  for (let r = 0; r < ROWS; r++) {
    board[r] = [];
    for (let c = 0; c < COLS; c++) {
      board[r][c] = 0;
    }
  }
  score = 0;
  newPiece();
}

function newPiece() {
  let randIndex = Math.floor(Math.random() * SHAPES.length);
  currentPiece = {
    shape: SHAPES[randIndex],
    color: COLORS[randIndex],
    index: randIndex,
    x: Math.floor(COLS / 2) - Math.ceil(SHAPES[randIndex][0].length / 2),
    y: 0,
  };
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // ボードの描画
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (board[r][c]) {
        ctx.fillStyle = COLORS[board[r][c] - 1];
        ctx.fillRect(c * BLOCK_SIZE, r * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
        ctx.strokeStyle = '#000';
        ctx.strokeRect(c * BLOCK_SIZE, r * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
      }
    }
  }

  // 現在のピースの描画
  if (currentPiece) {
    ctx.fillStyle = currentPiece.color;
    for (let r = 0; r < currentPiece.shape.length; r++) {
      for (let c = 0; c < currentPiece.shape[r].length; c++) {
        if (currentPiece.shape[r][c]) {
          ctx.fillRect(
            (currentPiece.x + c) * BLOCK_SIZE,
            (currentPiece.y + r) * BLOCK_SIZE,
            BLOCK_SIZE,
            BLOCK_SIZE
          );
          ctx.strokeStyle = '#000';
          ctx.strokeRect(
            (currentPiece.x + c) * BLOCK_SIZE,
            (currentPiece.y + r) * BLOCK_SIZE,
            BLOCK_SIZE,
            BLOCK_SIZE
          );
        }
      }
    }
  }
}

function moveDown() {
  movePiece(0, 1);
}

function collision() {
  for (let r = 0; r < currentPiece.shape.length; r++) {
    for (let c = 0; c < currentPiece.shape[r].length; c++) {
      if (currentPiece.shape[r][c]) {
        let newY = currentPiece.y + r;
        let newX = currentPiece.x + c;
        if (newY >= ROWS || newX < 0 || newX >= COLS || board[newY][newX]) {
          console.log('Collision detected at:', newY, newX);
          return true;
        }
      }
    }
  }
  return false;
}

function increaseSpeed() {
  dropSpeed *= 0.9;
}

// 横の列が揃っているかをチェックし、揃ったら消す関数
function checkFullRows() {
  let linesCleared = 0; // 消えた行数をカウント
  for (let r = ROWS - 1; r >= 0; r--) {
    let isFull = true;

    for (let c = 0; c < COLS; c++) {
      if (board[r][c] === 0) {
        isFull = false;
        break;
      }
    }

    if (isFull) {
      // 行が揃ったらその行を消す
      board.splice(r, 1);
      // 一番上に新しい空の行を追加する
      board.unshift(new Array(COLS).fill(0));
      // 行を詰めた後、次の行もチェックするためにrをインクリメント
      r++;
      linesCleared++; // 消えた行数をカウント
    }
  }

  // 消えた行に応じてスコアを加算
  if (linesCleared > 0) {
    score += linesCleared * 100;
  }
  displayScore.textContent = score;
  increaseSpeed();
}

function merge() {
  for (let r = 0; r < currentPiece.shape.length; r++) {
    for (let c = 0; c < currentPiece.shape[r].length; c++) {
      if (currentPiece.shape[r][c]) {
        board[currentPiece.y + r][currentPiece.x + c] = currentPiece.index + 1;
      }
    }
  }
  checkFullRows();
}

// キーボード入力を処理する関数
function handleKeyPress(event) {
  switch (event.keyCode) {
    case 37: // 左矢印キー
      movePiece(-1, 0);
      break;
    case 39: // 右矢印キー
      movePiece(1, 0);
      break;
    case 40: // 下矢印キー
      movePiece(0, 1);
      break;
    case 38: // 上矢印キー
      rotatePiece();
      break;
  }
}

// ピースを移動する関数
function movePiece(dx, dy) {
  currentPiece.x += dx;
  currentPiece.y += dy;

  if (collision()) {
    currentPiece.x -= dx;
    currentPiece.y -= dy;

    if (dy > 0) {
      merge();
      newPiece();
    }
  }

  draw();
}

// ピースを回転する関数
function rotatePiece() {
  let rotated = [];
  for (let c = 0; c < currentPiece.shape[0].length; c++) {
    let newRow = [];
    for (let r = currentPiece.shape.length - 1; r >= 0; r--) {
      newRow.push(currentPiece.shape[r][c]);
    }
    rotated.push(newRow);
  }

  let oldShape = currentPiece.shape;
  currentPiece.shape = rotated;

  if (collision()) {
    currentPiece.shape = oldShape;
  }

  draw();
}

document.addEventListener('keydown', handleKeyPress);

function isGameOver() {
  for (let c = 0; c < COLS; c++) {
    if (board[0][c] !== 0) {
      return true;
    }
  }
  return false;
}

function gameLoop() {
  if (isGameOver()) {
    alert('Game Over!');
    return;
  }

  if (isPaused) return;

  moveDown();
  setTimeout(gameLoop, dropSpeed);
}

startButton.addEventListener('click', () => {
  init();
  gameLoop();
});

pauseButton.addEventListener('click', () => {
  if (!isPaused) {
    isPaused = true;
    pausedMessage.style.display = 'block';
  } else {
    isPaused = false;
    pausedMessage.style.display = 'none';
    gameLoop();
  }
});
