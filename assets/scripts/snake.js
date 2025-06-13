// Game constants
const GRID_SIZE = 20;
const GRID_WIDTH = 30;
const GRID_HEIGHT = 30;

// Game variables
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scorePanel = document.getElementById('scorePanel');
const gameOverScreen = document.getElementById('gameOver');
const finalScore = document.getElementById('finalScore');
const restartBtn = document.getElementById('restartBtn');

// Touch control buttons
const upBtn = document.getElementById('up-btn');
const downBtn = document.getElementById('down-btn');
const leftBtn = document.getElementById('left-btn');
const rightBtn = document.getElementById('right-btn');

let snake = [];
let direction = 'right';
let nextDirection = 'right';
let gameSpeed = 120;
let gameLoop;
let score = 0;
let highScore = 0;
let food = { x: 0, y: 0 };
let gameActive = false;

// Set canvas size to fixed grid units
function resizeCanvas() {
    canvas.width = GRID_WIDTH * GRID_SIZE;
    canvas.height = GRID_HEIGHT * GRID_SIZE;
}

// Initialize game
function initGame() {
    // Center starting position
    const startX = Math.floor(GRID_WIDTH / 2);
    const startY = Math.floor(GRID_HEIGHT / 2);

    // Initial snake position in grid coordinates
    snake = [
        { x: startX, y: startY }, // head
        { x: startX - 1, y: startY },
        { x: startX - 2, y: startY }
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
    let newFood;
    let onSnake;

    do {
        onSnake = false;
        newFood = {
            x: Math.floor(Math.random() * GRID_WIDTH),
            y: Math.floor(Math.random() * GRID_HEIGHT)
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
function drawSnakeSegment(segment, isHead = false) {
    const x = segment.x * GRID_SIZE;
    const y = segment.y * GRID_SIZE;

    ctx.fillStyle = isHead ? '#fff' : '#ddd';
    ctx.fillRect(x, y, GRID_SIZE, GRID_SIZE);

    ctx.strokeStyle = '#555';
    ctx.lineWidth = 1;
    ctx.strokeRect(x, y, GRID_SIZE, GRID_SIZE);

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

// Draw food
function drawFood() {
    const x = food.x * GRID_SIZE;
    const y = food.y * GRID_SIZE;

    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(x + GRID_SIZE / 2, y + GRID_SIZE / 2, GRID_SIZE / 2 - 2, 0, Math.PI * 2);
    ctx.fill();
}

// Draw grid pattern
function drawGrid() {
    ctx.strokeStyle = '#222';
    ctx.lineWidth = 1;

    // Vertical lines
    for (let x = 0; x <= canvas.width; x += GRID_SIZE) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
    }

    // Horizontal lines
    for (let y = 0; y <= canvas.height; y += GRID_SIZE) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
    }
}

// Update score display
function updateScore() {
    scorePanel.textContent = `SCORE: ${score} | HIGH SCORE: ${highScore}`;
}

// Main drawing function
function drawGame() {
    // Clear canvas
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw grid
    drawGrid();

    // Draw food
    drawFood();

    // Draw snake
    for (let i = 0; i < snake.length; i++) {
        drawSnakeSegment(snake[i], i === 0);
    }
}

// Update game state
function updateGame() {
    if (!gameActive) return;

    // Update direction
    direction = nextDirection;

    // Calculate new head position in grid coordinates
    const head = { x: snake[0].x, y: snake[0].y };

    // Move head based on direction
    switch (direction) {
        case 'right': head.x++; break;
        case 'left': head.x--; break;
        case 'up': head.y--; break;
        case 'down': head.y++; break;
    }

    // Wrap around borders
    if (head.x >= GRID_WIDTH) head.x = 0;
    if (head.x < 0) head.x = GRID_WIDTH - 1;
    if (head.y >= GRID_HEIGHT) head.y = 0;
    if (head.y < 0) head.y = GRID_HEIGHT - 1;

    // Check if snake hits itself
    for (let i = 0; i < snake.length; i++) {
        if (head.x === snake[i].x && head.y === snake[i].y) {
            gameOver();
            return;
        }
    }

    // Add new head to snake
    snake.unshift(head);

    // Check if snake ate food (using grid coordinates)
    if (head.x === food.x && head.y === food.y) {
        // Increase score
        score += 10;

        // Update high score
        if (score > highScore) {
            highScore = score;
        }

        // Update score display
        updateScore();

        // Spawn new food
        spawnFood();

        // Increase speed every 50 points
        if (score % 50 === 0 && gameSpeed > 50) {
            gameSpeed -= 5;
            clearInterval(gameLoop);
            gameLoop = setInterval(updateGame, gameSpeed);
        }
    } else {
        // Remove tail if no food was eaten
        snake.pop();
    }

    // Draw updated game
    drawGame();
}

// Game over function
function gameOver() {
    gameActive = false;
    clearInterval(gameLoop);

    // Show game over screen
    finalScore.textContent = `Score: ${score}`;
    gameOverScreen.style.display = 'block';
}

// Keyboard input handling
document.addEventListener('keydown', (e) => {
    // Prevent default behavior for arrow keys
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault();
    }

    // Set next direction based on key press
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

// Touch control handlers
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

resizeCanvas();
initGame();