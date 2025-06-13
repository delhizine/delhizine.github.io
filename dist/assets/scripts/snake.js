const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scorePanel = document.getElementById('scorePanel');
const gameOverScreen = document.getElementById('gameOver');
const finalScore = document.getElementById('finalScore');
const restartBtn = document.getElementById('restartBtn');
const controls = document.getElementById('controls');

// Touch control buttons
const upBtn = document.getElementById('up-btn');
const downBtn = document.getElementById('down-btn');
const leftBtn = document.getElementById('left-btn');
const rightBtn = document.getElementById('right-btn');

// Game settings
const gridSize = 20;
const maxGridUnits = 30;
let snake = [];
let direction = 'right';
let nextDirection = 'right';
let gameSpeed = 120;
let gameLoop;
let score = 0;
let highScore = 0;
let food = { x: 0, y: 0 };
let gameActive = false;

// Set canvas size to max 30 grid units
function resizeCanvas() {
    const canvasWrapper = document.getElementById('canvasWrapper');
    const wrapperWidth = canvasWrapper.clientWidth;
    const wrapperHeight = canvasWrapper.clientHeight;

    // Calculate maximum canvas size (30 grid units)
    const maxCanvasSize = maxGridUnits * gridSize;

    // Calculate actual canvas size (maintain aspect ratio)
    const canvasSize = Math.min(
        Math.min(wrapperWidth, wrapperHeight),
        maxCanvasSize
    );

    // Set canvas dimensions
    canvas.width = canvasSize;
    canvas.height = canvasSize;

    // Center canvas
    canvas.style.width = `${canvasSize}px`;
    canvas.style.height = `${canvasSize}px`;
}

// Initialize game
function initGame() {
    // Calculate grid-aligned starting position
    const gridUnits = Math.floor(canvas.width / gridSize);
    const startX = Math.floor(gridUnits / 2) * gridSize;
    const startY = Math.floor(gridUnits / 2) * gridSize;

    // Initial snake position
    snake = [
        { x: startX, y: startY }, // head
        { x: startX - gridSize, y: startY },
        { x: startX - gridSize * 2, y: startY }
    ];

    direction = 'right';
    nextDirection = 'right';
    score = 0;
    gameActive = true;
    gameSpeed = 120;

    // Generate first food
    spawnFood();

    // Update score display
    updateScore();

    // Hide game over screen
    gameOverScreen.style.display = 'none';

    // Clear any existing game loop
    if (gameLoop) clearInterval(gameLoop);

    // Start game loop
    gameLoop = setInterval(updateGame, gameSpeed);
}

// Spawn food at random location
function spawnFood() {
    const gridUnits = Math.floor(canvas.width / gridSize);
    let newFood;
    let onSnake;

    do {
        onSnake = false;
        newFood = {
            x: Math.floor(Math.random() * gridUnits) * gridSize,
            y: Math.floor(Math.random() * gridUnits) * gridSize
        };

        // Check if food is on snake
        for (let segment of snake) {
            if (segment.x === newFood.x && segment.y === newFood.y) {
                onSnake = true;
                break;
            }
        }
    } while (onSnake);

    food = newFood;
}

// Draw a snake segment
function drawSnakeSegment(x, y, isHead = false) {
    ctx.fillStyle = isHead ? '#fff' : '#ddd';
    ctx.fillRect(x, y, gridSize, gridSize);

    ctx.strokeStyle = '#555';
    ctx.lineWidth = 1;
    ctx.strokeRect(x, y, gridSize, gridSize);

    // Draw eyes on head
    if (isHead) {
        ctx.fillStyle = '#000';
        // Position eyes based on direction
        if (direction === 'right') {
            ctx.fillRect(x + 13, y + 5, 4, 4);
            ctx.fillRect(x + 13, y + 11, 4, 4);
        } else if (direction === 'left') {
            ctx.fillRect(x + 3, y + 5, 4, 4);
            ctx.fillRect(x + 3, y + 11, 4, 4);
        } else if (direction === 'up') {
            ctx.fillRect(x + 5, y + 3, 4, 4);
            ctx.fillRect(x + 11, y + 3, 4, 4);
        } else if (direction === 'down') {
            ctx.fillRect(x + 5, y + 13, 4, 4);
            ctx.fillRect(x + 11, y + 13, 4, 4);
        }
    }
}

function drawFood() {
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(food.x + gridSize / 2, food.y + gridSize / 2, gridSize / 2 - 2, 0, Math.PI * 2);
    ctx.fill();
}

function drawGrid() {
    ctx.strokeStyle = '#222';
    ctx.lineWidth = .5;

    for (let x = 0; x < canvas.width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
    }

    for (let y = 0; y < canvas.height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
    }
}

function updateScore() {
    scorePanel.textContent = `SCORE: ${score} | HIGH SCORE: ${highScore}`;
}

function drawGame() {
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    drawGrid();

    drawFood();

    for (let i = 0; i < snake.length; i++) {
        drawSnakeSegment(snake[i].x, snake[i].y, i === 0);
    }
}

function updateGame() {
    if (!gameActive) return;

    direction = nextDirection;

    const head = { x: snake[0].x, y: snake[0].y };

    switch (direction) {
        case 'right':
            head.x += gridSize;
            break;
        case 'left':
            head.x -= gridSize;
            break;
        case 'up':
            head.y -= gridSize;
            break;
        case 'down':
            head.y += gridSize;
            break;
    }

    if (head.x >= canvas.width) head.x = 0;
    if (head.x < 0) head.x = canvas.width - gridSize;
    if (head.y >= canvas.height) head.y = 0;
    if (head.y < 0) head.y = canvas.height - gridSize;

    for (let i = 0; i < snake.length; i++) {
        if (head.x === snake[i].x && head.y === snake[i].y) {
            gameOver();
            return;
        }
    }

    snake.unshift(head);

    if (head.x === food.x && head.y === food.y) {
        score += 10;

        if (score > highScore) {
            highScore = score;
        }

        updateScore();
        spawnFood();

        if (score % 50 === 0 && gameSpeed > 50) {
            gameSpeed -= 5;
            clearInterval(gameLoop);
            gameLoop = setInterval(updateGame, gameSpeed);
        }
    } else {
        snake.pop();
    }

    drawGame();
}

function gameOver() {
    gameActive = false;
    clearInterval(gameLoop);

    finalScore.textContent = `Score: ${score}`;
    gameOverScreen.style.display = 'block';
}

document.addEventListener('keydown', (e) => {
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault();
    }

    switch (e.key) {
        case 'ArrowUp':
            if (direction !== 'down') nextDirection = 'up';
            break;
        case 'ArrowDown':
            if (direction !== 'up') nextDirection = 'down';
            break;
        case 'ArrowLeft':
            if (direction !== 'right') nextDirection = 'left';
            break;
        case 'ArrowRight':
            if (direction !== 'left') nextDirection = 'right';
            break;
        case ' ':
            if (!gameActive) initGame();
            break;
    }
});

upBtn.addEventListener('touchstart', (e) => {
    e.preventDefault();
    if (direction !== 'down') nextDirection = 'up';
});

downBtn.addEventListener('touchstart', (e) => {
    e.preventDefault();
    if (direction !== 'up') nextDirection = 'down';
});

leftBtn.addEventListener('touchstart', (e) => {
    e.preventDefault();
    if (direction !== 'right') nextDirection = 'left';
});

rightBtn.addEventListener('touchstart', (e) => {
    e.preventDefault();
    if (direction !== 'left') nextDirection = 'right';
});

upBtn.addEventListener('mousedown', () => {
    if (direction !== 'down') nextDirection = 'up';
});

downBtn.addEventListener('mousedown', () => {
    if (direction !== 'up') nextDirection = 'down';
});

leftBtn.addEventListener('mousedown', () => {
    if (direction !== 'right') nextDirection = 'left';
});

rightBtn.addEventListener('mousedown', () => {
    if (direction !== 'left') nextDirection = 'right';
});

restartBtn.addEventListener('click', initGame);

window.addEventListener('resize', () => {
    resizeCanvas();
    if (gameActive) drawGame();
});

resizeCanvas();
initGame();