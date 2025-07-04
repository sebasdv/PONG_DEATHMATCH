// Configuración del juego
const GAME_CONFIG = {
    // Dimensiones del juego
    WIDTH: 800,
    HEIGHT: 500,
    
    // Configuración de raquetas
    PADDLE: {
        WIDTH: 15,
        HEIGHT: 100,
        SPEED: 400,
        MAX_COOLDOWN: 0.8,
        MAX_BURST_COOLDOWN: 4.0
    },
    
    // Configuración de la pelota
    BALL: {
        SIZE: 20,
        SPEED: 300
    },
    
    // Configuración de proyectiles
    PROJECTILE: {
        SPEED: 400,
        SIZE: 8
    },
    
    // Configuración de partículas
    PARTICLE: {
        DEFAULT_COUNT: 10,
        DEFAULT_LIFE: 0.5
    },
    
    // Puntuación
    MAX_SCORE: 5,
    
    // Salud inicial
    INITIAL_HEALTH: 100,
    
    // Daño por proyectil
    PROJECTILE_DAMAGE: 10
};

// Configuración de controles
const CONTROLS = {
    PLAYER1: {
        UP: 'w',
        DOWN: 's',
        SHOOT: 'd',
        BURST: 'f'
    },
    PLAYER2: {
        UP: 'arrowup',
        DOWN: 'arrowdown',
        SHOOT: 'arrowleft',
        BURST: 'arrowright'
    }
}; 