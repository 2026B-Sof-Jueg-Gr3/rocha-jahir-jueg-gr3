# Mi Juego Phaser

Proyecto base de un juego 2D desarrollado con Phaser 3, pensado como punto de partida para futuras funcionalidades, niveles, enemigos, mecánicas y mejoras de gameplay.

## Descripción general

Este proyecto incluye una estructura sencilla para crear un juego en navegador con JavaScript. Actualmente ofrece una escena básica con:

- fondo cuadriculado
- personaje controlado por teclado
- movimiento con flechas o WASD
- visualización de posición y velocidad en tiempo real
- base reutilizable para ampliar mecánicas del juego

## Objetivo del proyecto

Servir como plantilla inicial para:

- agregar enemigos o NPCs
- implementar colisiones
- crear niveles y mapas
- añadir cámara, puntaje y vidas
- integrar sonidos y efectos visuales
- desarrollar sistemas de combate, obstáculos o progresión

## Tecnologías utilizadas

- HTML5
- JavaScript
- Phaser 3
- Navegador moderno

## Requisitos

Para ejecutar el proyecto necesitas:

- un navegador web moderno
- acceso a internet para cargar Phaser desde CDN
- editor de código opcional para modificar el juego

## Cómo ejecutar

### Opción 1: abrir directamente

1. Abre la carpeta del proyecto.
2. Haz doble clic en `index.html`.
3. El juego se cargará en el navegador.

### Opción 2: usar un servidor local

```bash
python -m http.server 8000
```

Luego abre esta URL en tu navegador:

```text
http://localhost:8000
```

## Controles

- Flechas del teclado: mover al personaje
- W, A, S, D: mover al personaje

## Funcionalidades actuales

- movimiento del personaje en dos dimensiones
- límite del mundo
- renderizado de un fondo visual
- texto de información dinámica en pantalla

## Funcionalidades previstas

El proyecto está preparado para evolucionar con:

- enemigos y IA
- sistema de puntos y vidas
- menús de inicio y fin de juego
- niveles progresivos
- efectos de sonido
- animaciones y sprites personalizados
- mejoras de interfaz de usuario

## Estructura del proyecto

```text
my-first-game/
├── index.html
├── game.js
├── README.md
└── assets/ (futuras imágenes, sonidos o recursos)
```

## Notas de desarrollo

Este repositorio funciona como base de prototipo y puede ampliarse fácilmente según las necesidades del juego. La lógica principal está en `game.js`, mientras que `index.html` solo carga la escena y la librería de Phaser.

## Autor

Proyecto académico desarrollado para la asignatura ISWD823.
