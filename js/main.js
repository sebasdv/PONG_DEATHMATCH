// Punto de entrada principal del juego
document.addEventListener('DOMContentLoaded', () => {
    // Inicializar el juego cuando el DOM esté listo
    const game = new Game();
    
    // Hacer el juego disponible globalmente para debugging
    window.game = game;
}); 