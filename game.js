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

        this.level = {
            current: 1,
            maxLevel: 3,
            completed: false,
            platforms: [],
            transition: {
                active: false,
                timer: 0,
                message: ''
            }
        };

        // Event listeners
        this.setupEventListeners();
        
        // Start game loop
        this.gameLoop();

        // Initialize first level
        this.loadLevel(1);
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

        // Add level skip for testing (press 'N')
        document.addEventListener('keydown', (e) => {
            if (e.key === 'n' || e.key === 'N') {
                if (this.level.current < this.level.maxLevel) {
                    this.loadLevel(this.level.current + 1);
                }
            }
        });
    }

    update() {
        if (this.level.transition.active) {
            this.level.transition.timer--;
            if (this.level.transition.timer <= 0) {
                this.level.transition.active = false;
            }
            return; // Pause game updates during transition
        }

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

        // Check for level completion
        this.checkLevelCompletion();
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

        // Draw level transition message
        if (this.level.transition.active) {
            this.ctx.save();
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            
            this.ctx.fillStyle = 'white';
            this.ctx.font = '30px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(
                this.level.transition.message,
                this.canvas.width / 2,
                this.canvas.height / 2
            );
            this.ctx.restore();
        }

        // Draw level indicator
        this.ctx.fillStyle = '#000000';
        this.ctx.font = '20px Arial';
        this.ctx.fillText(`Level: ${this.level.current}`, 10, 60);
    }

    gameLoop() {
        if (!this.gameOver) {
            this.update();
            this.draw();
            requestAnimationFrame(() => this.gameLoop());
        }
    }

    generateLevel(levelNumber) {
        let platforms = [];
        const groundHeight = this.canvas.height - 40;
        
        switch(levelNumber) {
            case 1:
                // Level 1: "Learning the Ropes" - Length: 4000px
                platforms = [
                    // Ground sections with gaps
                    { x: 0, y: groundHeight, width: 600, height: 40 },
                    { x: 700, y: groundHeight, width: 400, height: 40 },
                    { x: 1200, y: groundHeight, width: 600, height: 40 },
                    { x: 1900, y: groundHeight, width: 400, height: 40 },
                    { x: 2400, y: groundHeight, width: 600, height: 40 },
                    { x: 3100, y: groundHeight, width: 900, height: 40 },
                    
                    // Tutorial platforms
                    { x: 300, y: groundHeight - 100, width: 100, height: 20 }, // Jump practice
                    { x: 500, y: groundHeight - 150, width: 100, height: 20 }, // Higher jump
                    
                    // First challenge section
                    { x: 800, y: groundHeight - 120, width: 80, height: 20 },
                    { x: 960, y: groundHeight - 160, width: 80, height: 20 },
                    { x: 1120, y: groundHeight - 200, width: 80, height: 20 },
                    
                    // Power-up practice area
                    { x: 1400, y: groundHeight - 180, width: 200, height: 20 },
                    { x: 1700, y: groundHeight - 150, width: 100, height: 20 },
                    
                    // Platforming challenge
                    { x: 2000, y: groundHeight - 100, width: 60, height: 20 },
                    { x: 2140, y: groundHeight - 140, width: 60, height: 20 },
                    { x: 2280, y: groundHeight - 180, width: 60, height: 20 },
                    { x: 2420, y: groundHeight - 220, width: 60, height: 20 },
                    
                    // Final stretch platforms
                    { x: 2600, y: groundHeight - 200, width: 100, height: 20 },
                    { x: 2800, y: groundHeight - 160, width: 100, height: 20 },
                    { x: 3000, y: groundHeight - 120, width: 100, height: 20 },
                    { x: 3200, y: groundHeight - 80, width: 100, height: 20 },
                    
                    // Victory platform
                    { x: 3800, y: groundHeight - 100, width: 200, height: 20 }
                ];
                break;

            case 2:
                // Level 2: "Sky High" - Length: 5000px
                platforms = [
                    // Starting ground
                    { x: 0, y: groundHeight, width: 400, height: 40 },
                    
                    // Vertical climbing section
                    { x: 400, y: groundHeight - 100, width: 100, height: 20 },
                    { x: 600, y: groundHeight - 200, width: 100, height: 20 },
                    { x: 400, y: groundHeight - 300, width: 100, height: 20 },
                    { x: 600, y: groundHeight - 400, width: 100, height: 20 },
                    
                    // High altitude platforms
                    { x: 800, y: groundHeight - 400, width: 1000, height: 20 },
                    
                    // Descending challenge
                    { x: 1900, y: groundHeight - 350, width: 80, height: 20 },
                    { x: 2060, y: groundHeight - 300, width: 80, height: 20 },
                    { x: 2220, y: groundHeight - 250, width: 80, height: 20 },
                    { x: 2380, y: groundHeight - 200, width: 80, height: 20 },
                    
                    // Moving ground sections
                    { x: 2500, y: groundHeight, width: 300, height: 40 },
                    { x: 2900, y: groundHeight, width: 300, height: 40 },
                    { x: 3300, y: groundHeight, width: 300, height: 40 },
                    
                    // Advanced platforming
                    { x: 3700, y: groundHeight - 150, width: 60, height: 20 },
                    { x: 3840, y: groundHeight - 150, width: 60, height: 20 },
                    { x: 3980, y: groundHeight - 150, width: 60, height: 20 },
                    { x: 4120, y: groundHeight - 150, width: 60, height: 20 },
                    
                    // Final challenge
                    { x: 4300, y: groundHeight - 200, width: 400, height: 20 },
                    { x: 4800, y: groundHeight - 100, width: 200, height: 20 }
                ];
                break;

            case 3:
                // Level 3: "The Grand Finale" - Length: 6000px
                platforms = [
                    // Starting area
                    { x: 0, y: groundHeight, width: 500, height: 40 },
                    
                    // Multi-path section
                    { x: 600, y: groundHeight - 100, width: 200, height: 20 },     // Lower path
                    { x: 600, y: groundHeight - 250, width: 200, height: 20 },     // Upper path
                    { x: 900, y: groundHeight - 175, width: 200, height: 20 },     // Middle connector
                    
                    // Challenging gaps
                    { x: 1200, y: groundHeight, width: 100, height: 40 },
                    { x: 1400, y: groundHeight, width: 100, height: 40 },
                    { x: 1600, y: groundHeight, width: 100, height: 40 },
                    
                    // Vertical maze
                    { x: 1800, y: groundHeight - 300, width: 400, height: 20 },
                    { x: 1800, y: groundHeight - 150, width: 200, height: 20 },
                    { x: 2000, y: groundHeight - 200, width: 200, height: 20 },
                    
                    // Power-up challenge section
                    { x: 2300, y: groundHeight - 250, width: 800, height: 20 },
                    { x: 2400, y: groundHeight - 400, width: 100, height: 20 },
                    { x: 2600, y: groundHeight - 350, width: 100, height: 20 },
                    { x: 2800, y: groundHeight - 300, width: 100, height: 20 },
                    
                    // Speed run section
                    { x: 3200, y: groundHeight, width: 1000, height: 40 },
                    
                    // Final gauntlet
                    { x: 4300, y: groundHeight - 150, width: 60, height: 20 },
                    { x: 4440, y: groundHeight - 200, width: 60, height: 20 },
                    { x: 4580, y: groundHeight - 250, width: 60, height: 20 },
                    { x: 4720, y: groundHeight - 300, width: 60, height: 20 },
                    { x: 4860, y: groundHeight - 350, width: 60, height: 20 },
                    { x: 5000, y: groundHeight - 400, width: 60, height: 20 },
                    
                    // Victory platform
                    { x: 5700, y: groundHeight - 200, width: 300, height: 20 }
                ];
                break;
        }

        // Add collectibles and power-ups based on platform positions
        this.curryPieces = [];
        this.powerUps.items = [];

        platforms.forEach(platform => {
            // Add curry pieces above platforms
            if (platform.width >= 100 && Math.random() > 0.5) {
                this.curryPieces.push({
                    x: platform.x + platform.width/2,
                    y: platform.y - 40,
                    width: 20,
                    height: 20,
                    collected: false
                });
            }

            // Add power-ups at challenging spots
            if (platform.y < groundHeight - 200 && Math.random() > 0.7) {
                const powerUpTypes = ['DOUBLE_JUMP', 'SPEED_BOOST', 'INVINCIBLE'];
                this.powerUps.items.push({
                    x: platform.x + platform.width/2,
                    y: platform.y - 60,
                    type: powerUpTypes[Math.floor(Math.random() * powerUpTypes.length)],
                    collected: false
                });
            }
        });

        // Add checkpoints
        this.checkpoints = [
            { x: 2000, y: groundHeight - 80, width: 30, height: 40, reached: false },
            { x: 4000, y: groundHeight - 80, width: 30, height: 40, reached: false },
            { x: platforms[platforms.length-1].x + 100, y: platforms[platforms.length-1].y - 80, width: 30, height: 40, reached: false }
        ];

        return platforms;
    }

    loadLevel(levelNumber) {
        this.level.current = levelNumber;
        this.level.completed = false;
        this.level.platforms = this.generateLevel(levelNumber);
        
        // Reset chicken position
        this.chicken.x = 50;
        this.chicken.y = this.canvas.height - 100;
        this.chicken.velocityX = 0;
        this.chicken.velocityY = 0;
        
        // Reset camera
        this.cameraOffset = 0;

        // Show level start message
        this.showLevelMessage(`Level ${levelNumber} - Start!`);
    }

    showLevelMessage(message) {
        this.level.transition.active = true;
        this.level.transition.timer = 120; // 2 seconds at 60fps
        this.level.transition.message = message;
    }

    checkLevelCompletion() {
        // Get the final checkpoint of the current level
        const finalCheckpoint = this.checkpoints[this.checkpoints.length - 1];
        
        if (!this.level.completed && this.checkCollision(this.chicken, finalCheckpoint)) {
            this.level.completed = true;
            this.sounds.victory.play();
            
            if (this.level.current < this.level.maxLevel) {
                // Show level complete message and prepare next level
                this.showLevelMessage(`Level ${this.level.current} Complete! Get Ready...`);
                setTimeout(() => {
                    this.loadLevel(this.level.current + 1);
                }, 2000);
            } else {
                // Show game complete message
                this.showLevelMessage('Congratulations! You beat the game!');
                setTimeout(() => {
                    this.resetGame();
                }, 3000);
            }
        }
    }

    resetGame() {
        this.score = 0;
        this.loadLevel(1);
    }
}

// Start the game when the page loads
window.onload = () => {
    new Game();
}; 