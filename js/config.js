// Configuración del juego
const GAME_CONFIG = {
    // Dimensiones del juego
    WIDTH: 800,
    HEIGHT: 500,
    
    // Configuración de raquetas
    PADDLE: {
        WIDTH: 15,
        HEIGHT: 100,
        SPEED: 500, // Aumentado para mejor respuesta
        MAX_COOLDOWN: 0.6, // Reducido para más acción
        MAX_BURST_COOLDOWN: 3.0 // Reducido para más acción
    },
    
    // Configuración de la pelota
    BALL: {
        SIZE: 12, // Reducido de 20 a 12 para mejor proporción
        SPEED: 350 // Aumentado para más dinamismo
    },
    
    // Configuración de proyectiles
    PROJECTILE: {
        SPEED: 450, // Aumentado para mejor respuesta
        SIZE: 8
    },
    
    // Configuración de partículas
    PARTICLE: {
        DEFAULT_COUNT: 15, // Aumentado para mejor efecto visual
        DEFAULT_LIFE: 0.8 // Aumentado para partículas más duraderas
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