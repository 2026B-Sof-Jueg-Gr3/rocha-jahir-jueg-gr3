# ⚡ NEON KOMBAT: Cyber Arena (ISWD823)

Juego de peleas **1 vs 1 (Jugador vs CPU)** estilo arcade inspirado en *Mortal Kombat* y *The King of Fighters*, desarrollado íntegramente con **JavaScript puro y Phaser 3.80.1**.

Todos los gráficos, animaciones de extremidades, escenarios, partículas y efectos de sonido están generados **100% por código** (`Phaser.GameObjects.Graphics`, `Container`, `Tweens`, `Particles` y `Web Audio API`), sin depender de imágenes ni archivos de audio externos.

## 🌐 Jugar en línea

👉 **[Jugar NEON KOMBAT: Cyber Arena en GitHub Pages](https://TU-USUARIO.github.io/TU-REPOSITORIO/)**
*(Reemplaza este enlace con la URL pública de tu GitHub Pages)*

## 🎮 Características principales

- **Formato al mejor de 3 rounds** (60 segundos por round, 100 puntos de vida por luchador).
- **Sistema de combate con 3 fases por ataque**: preparación (*startup*), golpe activo (*active*) y recuperación (*recovery*).
- **Game Feel Arcade**: *hit-stop* (~60 ms de congelación por impacto), retroceso (*knockback*), parpadeo blanco, chispas de impacto, números de daño flotantes, contador de combos y sacudida de cámara.
- **Inteligencia Artificial adaptable**: máquina de estados con 3 niveles de dificultad (**Fácil**, **Normal** y **Difícil**).
- **HUD completo**: barras de vida con "vida fantasma", indicadores de rounds ganados, temporizador central y barra de energía especial brillante.
- **Audio sintetizado en tiempo real** mediante Web Audio API (con opción de silenciar con `M`).

## 🕹️ Controles

| Tecla | Acción |
| :--- | :--- |
| **A / D** o **← / →** | Moverse a izquierda / derecha |
| **W** o **↑** | Saltar |
| **S** o **↓** | Bloquear (en el suelo, reduce el daño un 80%) |
| **J** | Puñetazo rápido (6 de daño) |
| **K** | Patada de mayor alcance (10 de daño) |
| **L** | Ataque Especial: Proyectil de energía (15 de daño, requiere barra al 100%) |
| **P** o **ESC** | Pausar / Reanudar partida |
| **M** | Activar / Silenciar efectos de sonido |
| **ENTER** | Iniciar partida / Reintentar |

## 📁 Estructura del proyecto

```text
my-first-game/
├── index.html   # Carga Phaser 3.80.1 desde CDN y ejecuta game.js
├── game.js      # Lógica completa del juego (MenuScene, FightScene, ResultScene, Fighter, Audio)
└── README.md    # Documentación del proyecto
```

## 🚀 Cómo probar localmente con Live Server (VS Code)

1. Abre la carpeta del proyecto en **Visual Studio Code**.
2. Instala la extensión **Live Server** (de Ritwick Dey) si aún no la tienes.
3. Haz clic derecho sobre `index.html` y selecciona **"Open with Live Server"** (o haz clic en el botón **Go Live** en la barra inferior).
4. El juego se abrirá automáticamente en tu navegador (por ejemplo, en `http://127.0.0.1:5500/`).
