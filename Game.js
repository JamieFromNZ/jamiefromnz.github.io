class Game {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.context = this.canvas.getContext('2d');
        this.players = [];
        this.food = [];
        this.bullets = [];
        this.running = true;
    }

    addPlayer(player) {
        this.players.push(player);
    }

    addBullet(bullet) {
        this.bullets.push(bullet);
    }

    addFood(food) {
        this.food.push(food);
    }

    update() {
        this.checkCollision();

        this.players.forEach((player) => {
            player.updatePosition();
            player.updateTrail();
        });

        this.bullets.forEach(bullet => bullet.updatePosition());

        this.players.filter(player => player instanceof AIPlayer).forEach(aiPlayer => aiPlayer.moveSmartly(this));
    }

    draw() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.players.forEach(player => player.draw(this.context));
        this.food.forEach(foodItem => foodItem.draw(this.context));
        this.bullets.forEach(bullet => bullet.draw(this.context));
    }

    run() {
        this.intervalId = setInterval(() => {
            if (this.running) {
                this.update();
                this.draw();
            }
        }, 100);
    }

    handleInput(key) {
        this.players.forEach(player => player.handleInput(key));
    }

    // need to make this more object based
    checkCollision() {
        this.players.forEach((player, playerIndex) => {
            // Check if player is outside the canvas
            if (player.x < 0 || player.y < 0 || player.x >= this.canvas.width || player.y >= this.canvas.height) {
                this.gameOver(player);
            }

            this.food.forEach((foodItem, index) => {
                if (player.x === foodItem.x && player.y === foodItem.y) {
                    foodItem.eat(player, this);
                    this.food.splice(index, 1);
                }
            });

            // Check if player is on another player's trail
            this.players.forEach(otherPlayer => {
                if (player.hasAnchor) return;
                for (let i = 0; i < otherPlayer.trail.length - 1; i++) {
                    const trailPos = otherPlayer.trail[i];

                    // Check if the player's current position matches the trail position
                    if (player.x === trailPos.x && player.y === trailPos.y) {
                        if (player.bombs > 0) {
                            this.context.strokeStyle = 'tomato';
                            otherPlayer.trail.splice(i, 1);
                            player.bombs -= 1;
                        } else {
                            this.gameOver(player);
                        }
                    }
                }
            });

            // check if a bullet has hit a player
            this.bullets.forEach((bullet, bulletIndex) => {
                for (let i = 0; i < player.trail.length - 1; i++) {
                    const trailPos = player.trail[i];

                    if (bullet.x === trailPos.x && bullet.y === trailPos.y) {
                        this.bullets.splice(bulletIndex, 1);
                    }
                }

                if (bullet.x < 0 || bullet.y < 0 || bullet.x >= this.canvas.width || bullet.y >= this.canvas.height) {
                    this.bullets.splice(bulletIndex, 1);
                }
            });
        });
    }

    // probably could do this better (with using the same function or something idk, maybe I could use it with checkCOllision somehow)
    willCollideWithOthers(nextX, nextY, excludePlayer) {
        return this.players.some(player => {
            if (player === excludePlayer) return false;

            return player.trail.some(trailPos => trailPos.x === nextX && trailPos.y === nextY);
        });
    }

    gameOver(player) {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.running = false;

        this.alert("Someone died.");
    }

    restart() {
        // Stop the current game loop
        clearInterval(this.intervalId);

        // Reset the game state
        this.players = [];
        this.food = [];

        this.running = true;

        this.start();

        // Start the game loop again
        this.run();
    }

    generateRandomFood() {
        let foods = ['SpeedBoost', 'Bomb', 'Sentry'];

        // Generate random x and y coordinates within the canvas
        const x = Math.floor(Math.random() * ((this.canvas.width - 20) / 20)) * 20;
        const y = Math.floor(Math.random() * ((this.canvas.height - 20) / 20)) * 20;
        const foodIndex = Math.floor(Math.random() * foods.length);
        let food;

        switch (foods[foodIndex]) {
            case 'SpeedBoost':
                food = new SpeedBoost(x, y, 20);
                break;
            case 'Bomb':
                food = new Bomb(x, y, 20);
                break;
            case 'Sentry':
                food = new Sentry(x, y, 20);
                break;
        }

        // Add the food to the game
        this.addFood(food);
    }

    alert(message) {
        const alertBox = document.getElementById('alert');
        const alertMessage = document.getElementById('alertMessage');
        alertMessage.textContent = message;
        alertBox.className = 'alert-visible';

        setInterval(() => {
            const alertBox = document.getElementById('alert');
            alertBox.className = 'alert-hidden';
        }, 3000);
    }
}