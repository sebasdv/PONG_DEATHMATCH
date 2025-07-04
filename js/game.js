// Clase principal del juego
class Game {
    constructor() {
        this.canvas = document.getElementById('game-board');
        this.ctx = this.canvas.getContext('2d');
        
        // Referencias a los menús
        this.mainMenu = document.getElementById('main-menu');
        this.gameOverMenu = document.getElementById('game-over');
        this.winnerText = document.getElementById('winner-text');
        
        // Estado del juego
        this.gameMode = null;
        this.gameRunning = false;
        this.lastTime = 0;
        this.animationId = null;
        
        // Configurar canvas
        this.resizeCanvas();
        
        // Inicializar componentes
        this.initializeComponents();
        this.setupEventListeners();
        
        // Mostrar menú principal
        this.showMainMenu();
    }
    
    initializeComponents() {
        // Inicializar raquetas
        this.leftPaddle = new Paddle(20, GAME_CONFIG.HEIGHT / 2 - GAME_CONFIG.PADDLE.HEIGHT / 2, 'left');
        this.rightPaddle = new Paddle(GAME_CONFIG.WIDTH - 20 - GAME_CONFIG.PADDLE.WIDTH, GAME_CONFIG.HEIGHT / 2 - GAME_CONFIG.PADDLE.HEIGHT / 2, 'right');
        
        // Inicializar pelota
        this.ball = new Ball();
        
        // Inicializar sistemas
        this.projectileSystem = new ProjectileSystem();
        this.particleSystem = new ParticleSystem();
        this.ai = new AI(this.rightPaddle, this.ball);
        
        // Estado del juego
        this.gameState = {
            leftScore: 0,
            rightScore: 0
        };
        
        // Estado de las teclas
        this.keys = {
            w: false, s: false, d: false, f: false,
            up: false, down: false, left: false, right: false
        };
    }
    
    setupEventListeners() {
        // Eventos de teclado
        window.addEventListener('keydown', (e) => this.handleKeyDown(e));
        window.addEventListener('keyup', (e) => this.handleKeyUp(e));
        
        // Eventos de botones
        document.getElementById('one-player').addEventListener('click', () => this.startGame('one-player'));
        document.getElementById('two-player').addEventListener('click', () => this.startGame('two-player'));
        document.getElementById('restart').addEventListener('click', () => this.restartGame());
        document.getElementById('main-menu-btn').addEventListener('click', () => this.showMainMenu());
        
        // Evento de redimensionamiento
        window.addEventListener('resize', () => this.resizeCanvas());
    }
    
    handleKeyDown(e) {
        const key = e.key.toLowerCase();
        if (this.keys.hasOwnProperty(key)) {
            this.keys[key] = true;
        }
    }
    
    handleKeyUp(e) {
        const key = e.key.toLowerCase();
        if (this.keys.hasOwnProperty(key)) {
            this.keys[key] = false;
        }
    }
    
    startGame(mode) {
        this.gameMode = mode;
        this.rightPaddle.isAI = (mode === 'one-player');
        
        this.mainMenu.style.display = 'none';
        this.gameOverMenu.style.display = 'none';
        this.gameRunning = true;
        
        this.resetGame();
        
        // Iniciar bucle del juego
        this.lastTime = performance.now();
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        this.gameLoop();
    }
    
    resetGame() {
        this.gameState.leftScore = 0;
        this.gameState.rightScore = 0;
        
        this.leftPaddle.reset();
        this.rightPaddle.reset();
        this.ball.reset();
        
        this.projectileSystem.clear();
        this.particleSystem.clear();
    }
    
    restartGame() {
        this.resetGame();
        this.startGame(this.gameMode);
    }
    
    showMainMenu() {
        this.gameRunning = false;
        this.gameOverMenu.style.display = 'none';
        this.mainMenu.style.display = 'flex';
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
    }
    
    endGame(winner) {
        this.gameRunning = false;
        this.gameOverMenu.style.display = 'flex';
        
        if (winner === 'left') {
            this.winnerText.textContent = this.gameMode === 'one-player' ? '¡GANASTE!' : '¡JUGADOR 1 GANA!';
        } else {
            this.winnerText.textContent = this.gameMode === 'one-player' ? '¡PERDISTE!' : '¡JUGADOR 2 GANA!';
        }
    }
    
    update(deltaTime) {
        // Actualizar controles de jugadores
        this.updatePlayerControls(deltaTime);
        
        // Actualizar IA si es necesario
        if (this.rightPaddle.isAI) {
            this.ai.update(deltaTime);
        }
        
        // Actualizar pelota
        this.ball.update(deltaTime);
        
        // Verificar colisiones
        this.checkCollisions();
        
        // Actualizar sistemas
        this.projectileSystem.update(deltaTime);
        this.particleSystem.update(deltaTime);
        
        // Verificar fin del juego
        this.checkGameEnd();
    }
    
    updatePlayerControls(deltaTime) {
        // Jugador 1 (izquierda)
        if (this.keys.w && this.leftPaddle.y > 0) {
            this.leftPaddle.y -= this.leftPaddle.speed * deltaTime;
        }
        if (this.keys.s && this.leftPaddle.y + this.leftPaddle.height < GAME_CONFIG.HEIGHT) {
            this.leftPaddle.y += this.leftPaddle.speed * deltaTime;
        }
        
        // Jugador 2 (derecha) - solo si no es IA
        if (!this.rightPaddle.isAI) {
            if (this.keys.up && this.rightPaddle.y > 0) {
                this.rightPaddle.y -= this.rightPaddle.speed * deltaTime;
            }
            if (this.keys.down && this.rightPaddle.y + this.rightPaddle.height < GAME_CONFIG.HEIGHT) {
                this.rightPaddle.y += this.rightPaddle.speed * deltaTime;
            }
        }
        
        // Disparos
        if (this.keys.d && this.leftPaddle.canShoot()) {
            this.projectileSystem.fireProjectile('left', this.leftPaddle);
        }
        if (this.keys.left && this.rightPaddle.canShoot() && !this.rightPaddle.isAI) {
            this.projectileSystem.fireProjectile('right', this.rightPaddle);
        }
        
        // Ráfagas
        if (this.keys.f && this.leftPaddle.canBurst()) {
            this.projectileSystem.fireBurst('left', this.leftPaddle);
        }
        if (this.keys.right && this.rightPaddle.canBurst() && !this.rightPaddle.isAI) {
            this.projectileSystem.fireBurst('right', this.rightPaddle);
        }
    }
    
    checkCollisions() {
        // Colisiones de la pelota con raquetas
        this.ball.checkPaddleCollision(this.leftPaddle, this.particleSystem);
        this.ball.checkPaddleCollision(this.rightPaddle, this.particleSystem);
        
        // Colisiones de proyectiles con raquetas
        this.projectileSystem.checkCollisions(this.leftPaddle, this.rightPaddle, this.particleSystem);
        
        // Verificar puntos
        if (this.ball.x + this.ball.size < 0) {
            this.gameState.rightScore++;
            this.particleSystem.createExplosion(0, this.ball.y, 20);
            this.ball.reset();
        }
        if (this.ball.x > GAME_CONFIG.WIDTH) {
            this.gameState.leftScore++;
            this.particleSystem.createExplosion(GAME_CONFIG.WIDTH, this.ball.y, 20);
            this.ball.reset();
        }
    }
    
    checkGameEnd() {
        // Verificar fin por puntuación
        if (this.gameState.rightScore >= GAME_CONFIG.MAX_SCORE) {
            this.endGame('right');
        }
        if (this.gameState.leftScore >= GAME_CONFIG.MAX_SCORE) {
            this.endGame('left');
        }
        
        // Verificar fin por salud
        if (this.leftPaddle.health <= 0) {
            this.endGame('right');
        }
        if (this.rightPaddle.health <= 0) {
            this.endGame('left');
        }
    }
    
    draw() {
        // Limpiar canvas
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, GAME_CONFIG.WIDTH, GAME_CONFIG.HEIGHT);
        
        // Dibujar línea central
        this.drawCenterLine();
        
        // Dibujar puntuaciones
        this.drawScores();
        
        // Dibujar componentes
        this.leftPaddle.draw(this.ctx);
        this.rightPaddle.draw(this.ctx);
        this.ball.draw(this.ctx);
        
        // Dibujar sistemas
        this.projectileSystem.draw(this.ctx);
        this.particleSystem.draw(this.ctx);
        
        // Dibujar información de controles
        this.drawControls();
    }
    
    drawCenterLine() {
        this.ctx.beginPath();
        this.ctx.setLineDash([10, 10]);
        this.ctx.moveTo(GAME_CONFIG.WIDTH / 2, 0);
        this.ctx.lineTo(GAME_CONFIG.WIDTH / 2, GAME_CONFIG.HEIGHT);
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        this.ctx.stroke();
        this.ctx.setLineDash([]);
    }
    
    drawScores() {
        this.ctx.font = '50px Arial';
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(this.gameState.leftScore.toString(), GAME_CONFIG.WIDTH / 4, 60);
        this.ctx.fillText(this.gameState.rightScore.toString(), (GAME_CONFIG.WIDTH / 4) * 3, 60);
    }
    
    drawControls() {
        this.ctx.font = '12px Arial';
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        this.ctx.textAlign = 'left';
        this.ctx.fillText("Disparo normal: D / ←", 10, GAME_CONFIG.HEIGHT - 40);
        this.ctx.fillText("Ráfaga: F / →", 10, GAME_CONFIG.HEIGHT - 25);
        this.ctx.fillText("Movimiento: W,S / ↑,↓", 10, GAME_CONFIG.HEIGHT - 10);
    }
    
    gameLoop() {
        if (!this.gameRunning) return;
        
        const currentTime = performance.now();
        const deltaTime = (currentTime - this.lastTime) / 1000;
        this.lastTime = currentTime;
        
        this.update(deltaTime);
        this.draw();
        
        this.animationId = requestAnimationFrame(() => this.gameLoop());
    }
    
    resizeCanvas() {
        const container = document.querySelector('.game-container');
        const containerWidth = container.clientWidth;
        const containerHeight = container.clientHeight;
        
        GAME_CONFIG.WIDTH = containerWidth;
        GAME_CONFIG.HEIGHT = containerHeight;
        
        this.canvas.width = GAME_CONFIG.WIDTH;
        this.canvas.height = GAME_CONFIG.HEIGHT;
        
        // Ajustar posiciones si el juego está corriendo
        if (this.gameRunning) {
            this.leftPaddle.x = 20;
            this.leftPaddle.y = GAME_CONFIG.HEIGHT / 2 - this.leftPaddle.height / 2;
            this.rightPaddle.x = GAME_CONFIG.WIDTH - 20 - this.rightPaddle.width;
            this.rightPaddle.y = GAME_CONFIG.HEIGHT / 2 - this.rightPaddle.height / 2;
            this.ball.reset();
        }
    }
} 