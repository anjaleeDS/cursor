class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.canvas.width = 800;
        this.canvas.height = 400;
        
        // Game state
        this.gameOver = false;
        this.score = 0;
        
        // Player (Chicken) properties
        this.chicken = {
            x: 50,
            y: this.canvas.height - 100,
            width: 40,
            height: 40,
            velocityX: 0,
            velocityY: 0,
            isJumping: false
        };

        // Platform properties
        this.platforms = [
            { x: 0, y: this.canvas.height - 40, width: this.canvas.width, height: 40 }, // Ground
            { x: 300, y: 280, width: 100, height: 20 },
            { x: 500, y: 200, width: 100, height: 20 },
        ];

        // Collectibles (curry pieces)
        this.curryPieces = [
            { x: 320, y: 240, width: 20, height: 20, collected: false },
            { x: 520, y: 160, width: 20, height: 20, collected: false },
        ];

        // Controls
        this.keys = {
            right: false,
            left: false,
            up: false
        };

        // Event listeners
        this.setupEventListeners();
        
        // Start game loop
        this.gameLoop();
    }

    setupEventListeners() {
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowRight') this.keys.right = true;
            if (e.key === 'ArrowLeft') this.keys.left = true;
            if (e.key === 'ArrowUp') this.keys.up = true;
        });

        document.addEventListener('keyup', (e) => {
            if (e.key === 'ArrowRight') this.keys.right = false;
            if (e.key === 'ArrowLeft') this.keys.left = false;
            if (e.key === 'ArrowUp') this.keys.up = false;
        });
    }

    update() {
        // Horizontal movement
        if (this.keys.right) this.chicken.velocityX = 5;
        else if (this.keys.left) this.chicken.velocityX = -5;
        else this.chicken.velocityX = 0;

        // Jumping
        if (this.keys.up && !this.chicken.isJumping) {
            this.chicken.velocityY = -12;
            this.chicken.isJumping = true;
        }

        // Apply gravity
        this.chicken.velocityY += 0.5;

        // Update position
        this.chicken.x += this.chicken.velocityX;
        this.chicken.y += this.chicken.velocityY;

        // Check platform collisions
        this.platforms.forEach(platform => {
            if (this.checkCollision(this.chicken, platform)) {
                if (this.chicken.velocityY > 0) {
                    this.chicken.y = platform.y - this.chicken.height;
                    this.chicken.velocityY = 0;
                    this.chicken.isJumping = false;
                }
            }
        });

        // Check curry piece collection
        this.curryPieces.forEach(curry => {
            if (!curry.collected && this.checkCollision(this.chicken, curry)) {
                curry.collected = true;
                this.score += 10;
            }
        });

        // Keep chicken within bounds
        if (this.chicken.x < 0) this.chicken.x = 0;
        if (this.chicken.x > this.canvas.width - this.chicken.width) {
            this.chicken.x = this.canvas.width - this.chicken.width;
        }
    }

    checkCollision(rect1, rect2) {
        return rect1.x < rect2.x + rect2.width &&
               rect1.x + rect1.width > rect2.x &&
               rect1.y < rect2.y + rect2.height &&
               rect1.y + rect1.height > rect2.y;
    }

    draw() {
        // Clear canvas
        this.ctx.fillStyle = '#87CEEB';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw platforms
        this.ctx.fillStyle = '#8B4513';
        this.platforms.forEach(platform => {
            this.ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
        });

        // Draw curry pieces
        this.ctx.fillStyle = '#FFA500';
        this.curryPieces.forEach(curry => {
            if (!curry.collected) {
                this.ctx.fillRect(curry.x, curry.y, curry.width, curry.height);
            }
        });

        // Draw chicken
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.fillRect(this.chicken.x, this.chicken.y, this.chicken.width, this.chicken.height);
        
        // Draw chicken details (simple face)
        this.ctx.fillStyle = '#FF0000';
        this.ctx.fillRect(this.chicken.x + 30, this.chicken.y + 5, 5, 5); // Comb
        this.ctx.fillStyle = '#000000';
        this.ctx.fillRect(this.chicken.x + 25, this.chicken.y + 10, 3, 3); // Eye

        // Draw score
        this.ctx.fillStyle = '#000000';
        this.ctx.font = '20px Arial';
        this.ctx.fillText(`Score: ${this.score}`, 10, 30);
    }

    gameLoop() {
        if (!this.gameOver) {
            this.update();
            this.draw();
            requestAnimationFrame(() => this.gameLoop());
        }
    }
}

// Start the game when the page loads
window.onload = () => {
    new Game();
}; 