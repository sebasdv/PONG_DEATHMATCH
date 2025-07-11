

// Clase Paddle (Raqueta)
class Paddle {
    constructor(x, y, side) {
        this.x = x;
        this.y = y;
        this.width = GAME_CONFIG.PADDLE.WIDTH;
        this.height = GAME_CONFIG.PADDLE.HEIGHT;
        this.speed = GAME_CONFIG.PADDLE.SPEED;
        this.side = side;
        this.health = GAME_CONFIG.INITIAL_HEALTH;
        this.isAI = false;
        
        // Cooldowns para disparos
        this.shootCooldown = 0;
        this.burstCooldown = 0;
    }
    
    reset() {
        this.health = GAME_CONFIG.INITIAL_HEALTH;
        this.shootCooldown = 0;
        this.burstCooldown = 0;
    }
    
    canShoot() {
        return this.shootCooldown <= 0;
    }
    
    canBurst() {
        return this.burstCooldown <= 0;
    }
    
    update(deltaTime) {
        // Reducir cooldowns con mejor precisión
        if (this.shootCooldown > 0) {
            this.shootCooldown -= deltaTime;
        }
        if (this.burstCooldown > 0) {
            this.burstCooldown -= deltaTime;
        }
        
        // Asegurar que los cooldowns no sean negativos
        this.shootCooldown = Math.max(0, this.shootCooldown);
        this.burstCooldown = Math.max(0, this.burstCooldown);
    }
    
    draw(ctx) {
        // Dibujar raqueta
        ctx.fillStyle = this.health > 0 ? 'white' : 'red';
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // Dibujar barra de salud
        const healthBarWidth = this.width;
        const healthBarHeight = 5;
        const healthPercentage = this.health / GAME_CONFIG.INITIAL_HEALTH;
        
        ctx.fillStyle = 'red';
        ctx.fillRect(this.x, this.y - 10, healthBarWidth, healthBarHeight);
        ctx.fillStyle = 'green';
        ctx.fillRect(this.x, this.y - 10, healthBarWidth * healthPercentage, healthBarHeight);
    }
}

// Clase Ball (Pelota)
class Ball {
    constructor() {
        this.reset();
    }
    
    reset() {
        this.x = GAME_CONFIG.WIDTH / 2;
        this.y = GAME_CONFIG.HEIGHT / 2;
        this.size = GAME_CONFIG.BALL.SIZE;
        this.speed = GAME_CONFIG.BALL.SPEED;
        this.vx = this.speed * (Math.random() > 0.5 ? 1 : -1);
        this.vy = (Math.random() - 0.5) * this.speed * 0.5;
    }
    
    update(deltaTime) {
        // Aplicar velocidad con física mejorada
        this.x += this.vx * deltaTime;
        this.y += this.vy * deltaTime;
        
        // Colisión con paredes superior e inferior con mejor respuesta
        if (this.y <= this.size) {
            this.y = this.size;
            this.vy = Math.abs(this.vy);
        } else if (this.y >= GAME_CONFIG.HEIGHT - this.size) {
            this.y = GAME_CONFIG.HEIGHT - this.size;
            this.vy = -Math.abs(this.vy);
        }
    }
    
    checkPaddleCollision(paddle, particleSystem) {
        if (this.x < paddle.x + paddle.width && 
            this.x + this.size > paddle.x &&
            this.y < paddle.y + paddle.height &&
            this.y + this.size > paddle.y) {
            
            // Determinar dirección de rebote
            if (this.x < GAME_CONFIG.WIDTH / 2) {
                this.vx = Math.abs(this.vx);
            } else {
                this.vx = -Math.abs(this.vx);
            }
            
            // Ajustar velocidad vertical basada en dónde golpeó la raqueta
            const hitPoint = (this.y - paddle.y) / paddle.height;
            this.vy = (hitPoint - 0.5) * this.speed;
            
            // Crear partículas
            if (particleSystem) {
                particleSystem.createExplosion(this.x, this.y, 5);
            }
        }
    }
    
    draw(ctx) {
        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
}

// Clase ProjectileSystem (Sistema de Proyectiles)
class ProjectileSystem {
    constructor() {
        this.projectiles = [];
    }
    
    clear() {
        this.projectiles = [];
    }
    
    fireProjectile(side, paddle) {
        if (!paddle.canShoot()) return;
        
        const projectile = {
            x: side === 'left' ? paddle.x + paddle.width : paddle.x,
            y: paddle.y + paddle.height / 2,
            vx: side === 'left' ? GAME_CONFIG.PROJECTILE.SPEED : -GAME_CONFIG.PROJECTILE.SPEED,
            vy: 0,
            size: GAME_CONFIG.PROJECTILE.SIZE
        };
        
        // Debug: información del proyectil
        console.log(`Disparo: lado=${side}, x=${projectile.x}, vx=${projectile.vx}, paddle.x=${paddle.x}`);
        
        this.projectiles.push(projectile);
        paddle.shootCooldown = GAME_CONFIG.PADDLE.MAX_COOLDOWN;
    }
    
    fireBurst(side, paddle) {
        if (!paddle.canBurst()) return;
        
        for (let i = 0; i < 5; i++) {
            const projectile = {
                x: side === 'left' ? paddle.x + paddle.width : paddle.x,
                y: paddle.y + 20 + (i * 15),
                vx: side === 'left' ? GAME_CONFIG.PROJECTILE.SPEED : -GAME_CONFIG.PROJECTILE.SPEED,
                vy: (Math.random() - 0.5) * 100,
                size: GAME_CONFIG.PROJECTILE.SIZE
            };
            this.projectiles.push(projectile);
        }
        
        paddle.burstCooldown = GAME_CONFIG.PADDLE.MAX_BURST_COOLDOWN;
    }
    
    update(deltaTime) {
        this.projectiles = this.projectiles.filter(proj => {
            proj.x += proj.vx * deltaTime;
            proj.y += proj.vy * deltaTime;
            
            // Crear partículas de estela
            if (window.game && window.game.particleSystem) {
                window.game.particleSystem.createTrail(proj.x, proj.y, proj.vx, proj.vy);
            }
            
            // Eliminar proyectiles fuera de pantalla
            return proj.x > 0 && proj.x < GAME_CONFIG.WIDTH && 
                   proj.y > 0 && proj.y < GAME_CONFIG.HEIGHT;
        });
    }
    
    checkCollisions(leftPaddle, rightPaddle, particleSystem) {
        this.projectiles.forEach(proj => {
            // Colisión con raqueta izquierda
            if (proj.x < leftPaddle.x + leftPaddle.width &&
                proj.x + proj.size > leftPaddle.x &&
                proj.y < leftPaddle.y + leftPaddle.height &&
                proj.y + proj.size > leftPaddle.y) {
                
                leftPaddle.health -= GAME_CONFIG.PROJECTILE_DAMAGE;
                if (particleSystem) {
                    particleSystem.createExplosion(proj.x, proj.y, 12, 'hit');
                }
                proj.x = -100; // Marcar para eliminación
            }
            
            // Colisión con raqueta derecha
            if (proj.x < rightPaddle.x + rightPaddle.width &&
                proj.x + proj.size > rightPaddle.x &&
                proj.y < rightPaddle.y + rightPaddle.height &&
                proj.y + proj.size > rightPaddle.y) {
                
                rightPaddle.health -= GAME_CONFIG.PROJECTILE_DAMAGE;
                if (particleSystem) {
                    particleSystem.createExplosion(proj.x, proj.y, 12, 'hit');
                }
                proj.x = -100; // Marcar para eliminación
            }
        });
        
        // Eliminar proyectiles marcados
        this.projectiles = this.projectiles.filter(proj => proj.x > -50);
    }
    
    draw(ctx) {
        ctx.fillStyle = 'red';
        this.projectiles.forEach(proj => {
            ctx.beginPath();
            ctx.arc(proj.x, proj.y, proj.size, 0, Math.PI * 2);
            ctx.fill();
        });
    }
}

// Clase ParticleSystem (Sistema de Partículas Mejorado)
class ParticleSystem {
    constructor() {
        this.particles = [];
        this.maxParticles = 200; // Límite para rendimiento
    }
    
    clear() {
        this.particles = [];
    }
    
    createExplosion(x, y, count = 15, type = 'normal') {
        // Limitar partículas para rendimiento
        if (this.particles.length > this.maxParticles) {
            this.particles = this.particles.slice(-this.maxParticles / 2);
        }
        
        for (let i = 0; i < count; i++) {
            const angle = (Math.PI * 2 * i) / count;
            const speed = 150 + Math.random() * 100;
            
            this.particles.push({
                x: x + (Math.random() - 0.5) * 10,
                y: y + (Math.random() - 0.5) * 10,
                vx: Math.cos(angle) * speed + (Math.random() - 0.5) * 50,
                vy: Math.sin(angle) * speed + (Math.random() - 0.5) * 50,
                life: 0.8 + Math.random() * 0.4,
                maxLife: 0.8 + Math.random() * 0.4,
                size: 2 + Math.random() * 3,
                color: type === 'hit' ? '#ff4444' : '#ffaa55',
                gravity: 300,
                fade: true
            });
        }
    }
    
    createTrail(x, y, vx, vy) {
        // Crear partículas de estela para proyectiles
        for (let i = 0; i < 3; i++) {
            this.particles.push({
                x: x + (Math.random() - 0.5) * 5,
                y: y + (Math.random() - 0.5) * 5,
                vx: vx * 0.1 + (Math.random() - 0.5) * 20,
                vy: vy * 0.1 + (Math.random() - 0.5) * 20,
                life: 0.3 + Math.random() * 0.2,
                maxLife: 0.3 + Math.random() * 0.2,
                size: 1 + Math.random() * 2,
                color: '#ff6666',
                gravity: 0,
                fade: true
            });
        }
    }
    
    update(deltaTime) {
        this.particles = this.particles.filter(particle => {
            // Aplicar gravedad
            particle.vy += particle.gravity * deltaTime;
            
            // Actualizar posición
            particle.x += particle.vx * deltaTime;
            particle.y += particle.vy * deltaTime;
            
            // Reducir vida
            particle.life -= deltaTime;
            
            // Reducir velocidad por fricción
            particle.vx *= 0.98;
            particle.vy *= 0.98;
            
            return particle.life > 0;
        });
    }
    
    draw(ctx) {
        this.particles.forEach(particle => {
            const alpha = particle.life / particle.maxLife;
            const size = particle.size * alpha;
            
            // Crear gradiente para partículas
            const gradient = ctx.createRadialGradient(
                particle.x, particle.y, 0,
                particle.x, particle.y, size
            );
            
            if (particle.fade) {
                // Convertir color hex a rgba
                const hex = particle.color.replace('#', '');
                const r = parseInt(hex.substr(0, 2), 16);
                const g = parseInt(hex.substr(2, 2), 16);
                const b = parseInt(hex.substr(4, 2), 16);
                
                gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, 1)`);
                gradient.addColorStop(0.5, `rgba(${r}, ${g}, ${b}, ${alpha})`);
                gradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);
            } else {
                gradient.addColorStop(0, particle.color);
                gradient.addColorStop(1, particle.color);
            }
            
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, size, 0, Math.PI * 2);
            ctx.fill();
        });
    }
}

// Clase AI (Inteligencia Artificial)
class AI {
    constructor(paddle, ball) {
        this.paddle = paddle;
        this.ball = ball;
        this.difficulty = 0.8; // 0 = fácil, 1 = difícil
    }
    
    update(deltaTime) {
        if (!this.paddle.isAI) return;
        
        // Predicción simple de la posición de la pelota
        const targetY = this.ball.y;
        const currentY = this.paddle.y + this.paddle.height / 2;
        
        // Mover hacia la pelota con cierta dificultad
        if (Math.random() < this.difficulty) {
            if (targetY < currentY - 10) {
                this.paddle.y -= this.paddle.speed * deltaTime;
            } else if (targetY > currentY + 10) {
                this.paddle.y += this.paddle.speed * deltaTime;
            }
        }
        
        // Mantener la raqueta dentro de los límites
        if (this.paddle.y < 0) this.paddle.y = 0;
        if (this.paddle.y + this.paddle.height > GAME_CONFIG.HEIGHT) {
            this.paddle.y = GAME_CONFIG.HEIGHT - this.paddle.height;
        }
        
        // Disparar ocasionalmente
        if (Math.random() < 0.01 && this.paddle.canShoot()) {
            // La lógica de disparo se maneja en el sistema de proyectiles
        }
    }
}

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
        
        // Detectar dispositivo móvil
        this.isMobile = this.detectMobile();
        
        // Configurar canvas
        this.resizeCanvas();
        
        // Inicializar componentes
        this.initializeComponents();
        this.setupEventListeners();
        
        // Configurar controles móviles
        this.setupMobileControls();
        
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
        
        // Eventos de orientación para móviles
        window.addEventListener('orientationchange', () => this.handleOrientationChange());
        window.addEventListener('resize', () => this.handleOrientationChange());
    }
    
    handleKeyDown(e) {
        const key = e.key.toLowerCase();
        // Mapear teclas de flecha a nombres más simples
        const keyMap = {
            'arrowup': 'up',
            'arrowdown': 'down',
            'arrowleft': 'left',
            'arrowright': 'right'
        };
        
        const mappedKey = keyMap[key] || key;
        
        if (this.keys.hasOwnProperty(mappedKey)) {
            this.keys[mappedKey] = true;
            // Prevenir comportamiento por defecto para teclas del juego
            if (['w', 's', 'd', 'f', 'up', 'down', 'left', 'right'].includes(mappedKey)) {
                e.preventDefault();
            }
        }
    }
    
    handleKeyUp(e) {
        const key = e.key.toLowerCase();
        // Mapear teclas de flecha a nombres más simples
        const keyMap = {
            'arrowup': 'up',
            'arrowdown': 'down',
            'arrowleft': 'left',
            'arrowright': 'right'
        };
        
        const mappedKey = keyMap[key] || key;
        
        if (this.keys.hasOwnProperty(mappedKey)) {
            this.keys[mappedKey] = false;
        }
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
        
        // Ocultar controles táctiles
        document.getElementById('touch-controls').style.display = 'none';
        
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
        // Limitar deltaTime para evitar saltos grandes
        deltaTime = Math.min(deltaTime, 1/30); // Máximo 30 FPS equivalente
        
        // Actualizar raquetas
        this.leftPaddle.update(deltaTime);
        this.rightPaddle.update(deltaTime);
        
        // Actualizar controles de jugadores
        this.updatePlayerControls(deltaTime);
        
        // Actualizar IA si es necesario
        if (this.rightPaddle.isAI) {
            this.ai.update(deltaTime);
        }
        
        // Actualizar pelota con física mejorada
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
        if (this.keys.right && this.rightPaddle.canShoot() && !this.rightPaddle.isAI) {
            this.projectileSystem.fireProjectile('right', this.rightPaddle);
        }
        
        // Ráfagas
        if (this.keys.f && this.leftPaddle.canBurst()) {
            this.projectileSystem.fireBurst('left', this.leftPaddle);
        }
        if (this.keys.left && this.rightPaddle.canBurst() && !this.rightPaddle.isAI) {
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
        this.ctx.fillText("Disparo normal: D / →", 10, GAME_CONFIG.HEIGHT - 40);
        this.ctx.fillText("Ráfaga: F / ←", 10, GAME_CONFIG.HEIGHT - 25);
        this.ctx.fillText("Movimiento: W,S / ↑,↓", 10, GAME_CONFIG.HEIGHT - 10);
        
        // Información de depuración
        this.ctx.fillStyle = 'rgba(255, 255, 0, 0.7)';
        this.ctx.fillText(`Modo: ${this.gameMode}`, 10, 20);
        this.ctx.fillText(`IA: ${this.rightPaddle.isAI ? 'ON' : 'OFF'}`, 10, 35);
        this.ctx.fillText(`J2 UP: ${this.keys.up}`, 10, 50);
        this.ctx.fillText(`J2 DOWN: ${this.keys.down}`, 10, 65);
        this.ctx.fillText(`J1 X: ${Math.round(this.leftPaddle.x)}`, 10, 80);
        this.ctx.fillText(`J2 X: ${Math.round(this.rightPaddle.x)}`, 10, 95);
        this.ctx.fillText(`Proyectiles: ${this.projectileSystem.projectiles.length}`, 10, 110);
    }
    
    gameLoop() {
        if (!this.gameRunning) return;
        
        const currentTime = performance.now();
        const deltaTime = (currentTime - this.lastTime) / 1000;
        this.lastTime = currentTime;
        
        // Actualizar lógica del juego
        this.update(deltaTime);
        
        // Dibujar frame
        this.draw();
        
        // Programar siguiente frame
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
    
    // Métodos para dispositivos móviles
    detectMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
               window.innerWidth <= 768;
    }
    
    setupMobileControls() {
        if (!this.isMobile) return;
        
        // Mostrar controles táctiles cuando el juego esté corriendo
        const touchControls = document.getElementById('touch-controls');
        
        // Eventos para botones táctiles
        document.querySelectorAll('.touch-controls button').forEach(button => {
            const action = button.dataset.action;
            const burstAction = button.dataset.burstAction;
            
            // Eventos táctiles
            button.addEventListener('touchstart', (e) => {
                e.preventDefault();
                this.keys[action] = true;
                
                // Para disparos, usar temporizador para ráfagas
                if (action === 'd' || action === 'right') {
                    this.touchStartTime = Date.now();
                }
            });
            
            button.addEventListener('touchend', (e) => {
                e.preventDefault();
                this.keys[action] = false;
                
                // Verificar si fue un disparo largo para ráfaga
                if ((action === 'd' || action === 'right') && this.touchStartTime) {
                    const touchDuration = Date.now() - this.touchStartTime;
                    if (touchDuration > 500) {
                        // Disparo largo = ráfaga
                        this.keys[burstAction] = true;
                        setTimeout(() => {
                            this.keys[burstAction] = false;
                        }, 100);
                    }
                    this.touchStartTime = null;
                }
            });
            
            // Eventos de mouse para desarrollo
            button.addEventListener('mousedown', (e) => {
                e.preventDefault();
                this.keys[action] = true;
            });
            
            button.addEventListener('mouseup', (e) => {
                e.preventDefault();
                this.keys[action] = false;
            });
        });
    }
    
    handleOrientationChange() {
        // Esperar un poco para que la orientación cambie
        setTimeout(() => {
            this.resizeCanvas();
            this.updateOrientationWarning();
        }, 100);
    }
    
    updateOrientationWarning() {
        const warning = document.getElementById('orientation-warning');
        const isPortrait = window.innerHeight > window.innerWidth;
        const isMobile = this.isMobile;
        
        if (isMobile && isPortrait) {
            warning.style.display = 'flex';
        } else {
            warning.style.display = 'none';
        }
    }
    
    startGame(mode) {
        this.gameMode = mode;
        this.rightPaddle.isAI = (mode === 'one-player');
        
        // Debug: verificar configuración
        console.log(`Modo de juego: ${mode}`);
        console.log(`IA activada: ${this.rightPaddle.isAI}`);
        
        this.mainMenu.style.display = 'none';
        this.gameOverMenu.style.display = 'none';
        this.gameRunning = true;
        
        // Mostrar controles táctiles en móviles
        if (this.isMobile) {
            document.getElementById('touch-controls').style.display = 'flex';
        }
        
        this.resetGame();
        
        // Iniciar bucle del juego
        this.lastTime = performance.now();
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        this.gameLoop();
    }
    
    showMainMenu() {
        this.gameRunning = false;
        this.gameOverMenu.style.display = 'none';
        this.mainMenu.style.display = 'flex';
        
        // Ocultar controles táctiles
        document.getElementById('touch-controls').style.display = 'none';
        
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
    }
} 