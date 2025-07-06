# PONG DEATHMATCH - IND 474

Un juego de Pong moderno con mecánicas de disparo y combate, desarrollado en HTML5 Canvas y JavaScript.

## Características

- **Modo 1 Jugador**: Juega contra una IA inteligente
- **Modo 2 Jugadores**: Juega con un amigo en la misma pantalla
- **Sistema de Disparos**: Dispara proyectiles para dañar al oponente
- **Ráfagas**: Dispara múltiples proyectiles de una vez
- **Sistema de Salud**: Las raquetas tienen salud y pueden ser destruidas
- **Efectos Visuales**: Partículas y efectos visuales dinámicos
- **Controles Intuitivos**: Controles fáciles de usar
- **Soporte Móvil**: Controles táctiles optimizados para dispositivos móviles
- **Responsive Design**: Se adapta automáticamente a diferentes tamaños de pantalla

## Controles

### Desktop
#### Jugador 1 (Izquierda)
- **W/S**: Mover raqueta arriba/abajo
- **D**: Disparar proyectil
- **F**: Disparar ráfaga (5 proyectiles)

#### Jugador 2 (Derecha)
- **↑/↓**: Mover raqueta arriba/abajo
- **←**: Disparar proyectil
- **→**: Disparar ráfaga (5 proyectiles)

### Móvil
- **Controles táctiles** en la parte inferior de la pantalla
- **Botones de movimiento**: ↑/↓ para cada jugador
- **Botón de disparo**: 🔥 para proyectil normal
- **Botón de ráfaga**: 💥 para disparo múltiple
- **Disparo largo**: Mantén presionado el botón de disparo para ráfaga

## Estructura del Proyecto

```
PONG_DEATHMATCH/
├── index.html                 # Versión original (todo en un archivo)
├── index-refactored.html      # Versión refactorizada (archivos separados)
├── css/
│   └── style.css             # Estilos CSS
├── js/
│   ├── config.js             # Configuración del juego
│   ├── utils.js              # Utilidades y helpers
│   ├── paddle.js             # Lógica de las raquetas
│   ├── ball.js               # Lógica de la pelota
│   ├── projectile.js         # Sistema de proyectiles
│   ├── particles.js          # Sistema de partículas
│   ├── ai.js                 # Inteligencia artificial
│   ├── game.js               # Lógica principal del juego
│   └── main.js               # Punto de entrada
└── README.md                 # Este archivo
```

## Cómo Jugar

### Opción 1: Archivo Único (Actual)
1. Abre `index.html` en tu navegador
2. ¡Listo para jugar!

### Opción 2: Versión Refactorizada
1. Abre `index-refactored.html` en tu navegador
2. ¡Listo para jugar!

## Despliegue en GitHub Pages

### Para la versión actual (archivo único):
1. Sube `index.html` a tu repositorio de GitHub
2. Ve a Settings > Pages
3. Selecciona "Deploy from a branch"
4. Elige la rama principal
5. ¡Tu juego estará disponible en `https://tu-usuario.github.io/tu-repositorio/`

### Para la versión refactorizada:
1. Sube todos los archivos a tu repositorio de GitHub
2. Ve a Settings > Pages
3. Selecciona "Deploy from a branch"
4. Elige la rama principal
5. ¡Tu juego estará disponible en `https://tu-usuario.github.io/tu-repositorio/`

## Ventajas de la Versión Refactorizada

### Mejor Organización
- Cada archivo tiene una responsabilidad específica
- Código más fácil de mantener y entender
- Separación clara entre lógica, estilos y configuración

### Mejor Rendimiento
- Los navegadores pueden cachear archivos individuales
- Carga más rápida en visitas posteriores
- Mejor compresión de archivos

### Facilita la Colaboración
- Múltiples desarrolladores pueden trabajar en diferentes archivos
- Menos conflictos de merge
- Código más modular y reutilizable

### Mejor Debugging
- Errores más fáciles de localizar
- Console logs más específicos
- Mejor experiencia de desarrollo



## Objetivos del Juego

- **Victoria por Puntuación**: Llega a 5 puntos
- **Victoria por Destrucción**: Reduce la salud del oponente a 0
- **La salud se reduce**: Cada proyectil hace 10 puntos de daño
- **Cooldowns**: Los disparos tienen tiempos de recarga
- **Ráfagas**: Dispara 5 proyectiles de una vez (cooldown más largo)

## Tecnologías Utilizadas

- **HTML5**: Estructura del juego
- **CSS3**: Estilos y animaciones
- **JavaScript ES6+**: Lógica del juego
- **Canvas API**: Renderizado gráfico
- **GitHub Pages**: Hosting gratuito

## Notas de Desarrollo

- El juego es completamente responsive
- Funciona en todos los navegadores modernos
- **Soporte completo para dispositivos móviles**
- **Controles táctiles optimizados**
- **Detección automática de orientación**
- No requiere dependencias externas
- Código optimizado para rendimiento

## Contribuciones

¡Las contribuciones son bienvenidas! Si quieres mejorar el juego:

1. Fork el repositorio
2. Crea una rama para tu feature
3. Haz tus cambios
4. Envía un Pull Request

## Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo LICENSE para más detalles.

---

¡Disfruta jugando PONG DEATHMATCH! 