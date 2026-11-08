# 🎮 Desarrollo de Juegos Interactivos (ISWD823) — Jahir Rocha

Repositorio oficial de proyectos de desarrollo de videojuegos web interactivos construidos con **JavaScript (ES6+)** y **Phaser 4.0.0**.

---

## ⚡ Proyecto Principal: *NEON KOMBAT: Cyber Arena* (`my-first-game/`)

> **«Domina el Pulso. Quiebra el Algoritmo. ¡ENTRA AL CYBER-DOJO AHORA!»**

👉 **[⚡ ¡PELEAR AHORA! — Jugar en línea en GitHub Pages](https://2026b-sof-jueg-gr3.github.io/rocha-jahir-jueg-gr3/my-first-game/)**  
📄 **[Ver documentación detallada en `my-first-game/README.md`](./my-first-game/README.md)**

---

## 🔍 Resumen Técnico Extraído de `my-first-game/game.js` e `index.html`

- **Título:** `NEON KOMBAT: Cyber Arena - ISWD823`
- **Motor y Librerías:** **Phaser 4.0.0** (`https://cdn.jsdelivr.net/npm/phaser@4.0.0/dist/phaser.min.js`), **Arcade Physics** (`gravedad Y: 1550`) y **Web Audio API** nativa.
- **Estética Visual y Paleta:** *Cyberpunk / Synthwave Nocturno* (`960×540 px`) generado **100% por código procedimental** (`Phaser.GameObjects.Graphics`, `Container`, `Tweens`, `Particles`). Contraste cromático entre fondo nocturno (`#090514`), **KAI** en Cian Eléctrico (`#00f0ff`), **VEX (CPU)** en Carmesí Neón (`#ff2a54`) y energía sobrecargada en Dorado (`#ffd600`).
- **Escenas Implementadas:** `MenuScene` (menú principal y selector de dificultad), `FightScene` (combate 1 vs 1, HUD con vida fantasma, IA con máquina de estados y pausa) y `ResultScene` (resultados, estadísticas de combate y flujo de revancha/menú).
- **Mecánicas y Victoria/Derrota:** Duelo 1 vs 1 al mejor de 3 rounds (`60 s` por asalto, `100 HP`). Incluye desplazamiento lateral, salto, bloqueo con escudo en suelo (`-80%` daño), ataques con *frame data* en 3 fases (*startup*, *active*, *recovery*) para Puñetazo (`J`), Patada (`K`) y proyectil especial *Onda Neón* (`L`), *hit-stop*, combos y victoria por **K.O.** o por **Tiempo (`TIME`)**.

---

## 🧭 Fase 1: Ingeniería del Propósito (Narrativa e Identidad)

### 1. 🎯 Logline (Premisa comercial de impacto)
En la cima del último Cyber-Dojo de Neo-Kyoto, encarna a **KAI**, un artista marcial biónico que debe derrotar al mejor de tres asaltos de 60 segundos a **VEX**, el implacable ejecutor algorítmico de la red central. Domina cada *frame* de impacto, bloquea con precisión milimétrica y sobrecarga tu núcleo de plasma para desatar la *Onda Neón* antes de que tu código vital sea purgado.

### 2. 🌐 Lore (Reglas del universo lúdico)
En el año 2096, el honor marcial ya no se mide con acero ni sangre, sino en ciclos de reloj y descargas de fotones sobre la **Cyber Arena**: un santuario suspendido entre los rascacielos de Neo-Kyoto bajo el resplandor eterno de un sol sintético. La megacorporación *Aethelgard* ha declarado obsoletos a los artistas marciales humanos, instaurando a **VEX**, un androide de combate de frecuencia carmesí (`#ff2a54`) cuya red neuronal calcula distancias, intercepta trayectorias y adapta su agresividad en tiempo real para erradicar cualquier rastro de imperfección humana.

Tú controlas a **KAI**, el último maestro del estilo *Cian-Ryu* (`#00f0ff`), un luchador que integró un exoesqueleto resonante a su propio sistema nervioso para demostrar que la intuición humana supera al cálculo frío de la máquina. Las reglas del **Torneo Cyber-Dojo** son inquebrantables: cada combate se disputa al mejor de tres rounds bajo una ventana estricta de **60 segundos de sincronización neuronal**. Nadie puede escapar de los límites magnéticos de la plataforma (`LIMITE_IZQ: 65`, `LIMITE_DER: 895`); solo el K.O. directo o la superioridad vital al agotarse el cronómetro determinan quién prevalece.

En este universo, cada intercambio físico genera resonancia energética: conectar golpes (`+20%`), mantener una guardia firme con el escudo fotónico (`+10%`) e incluso resistir el castigo enemigo (`+15%`) alimentan tu **Barra de Energía Especial**. Al alcanzar el `100%` de sobrecarga, el exoesqueleto de KAI despliega un aura pulsante que habilita la técnica definitiva del dojo: la **Onda Neón**, un proyectil de plasma concentrado capaz de quebrar la defensa algorítmica de VEX de un solo impacto.

### 3. ⚙️ Resonancia Lúdica (Mecánica justificando el aprendizaje)
* **Física Pesada y Control del Espacio (*Footsies*):** La gravedad elevada (`1550`) y la colisión entre cuerpos (`SEPARACION_MIN: 56`) otorgan peso real al exoesqueleto. Como el bloqueo (`S` / `↓`) exige estar en el suelo (`enElSuelo()`), saltar sin cálculo deja a KAI vulnerable en el aire, obligando al jugador a dominar el posicionamiento.
* **Compromiso de *Frame Data* (`startup` → `active` → `recovery`):** El **Puñetazo (`J`)** es veloz (`65 ms` de preparación) y seguro a corta distancia, mientras que la **Patada (`K`)** tiene mayor alcance y empuje (`knockback: 295`) pero exige `210 ms` de recuperación. El jugador aprende que golpear al vacío sin lectura previa castiga la impulsividad.
* **Defensa Activa y Ciclo de Sobrecarga:** Bloquear en el suelo reduce un `80%` el daño recibido y carga energía especial, enseñando a convertir la defensa paciente y las cadenas de combos (`1850 ms` de ventana) en el disparo estratégico de la **Onda Neón (`L`)**.
* **Escalado de la IA y Superación:** Los tres niveles de **VEX** (**Fácil**, **Normal** y **Difícil**) reducen el tiempo de reacción de la CPU de `480 ms` a `155 ms`. Mejorar tus reflejos y lectura de combate en el teclado refleja directamente la evolución de KAI superando al algoritmo.

### 4. 🔥 Identidad
* **Pilar de Diseño Central (*Core Pillar*):** **«Precisión Táctica Arcade 100% Procedimental»** — Combate 1 vs 1 de respuesta inmediata y alto impacto sensorial (*hit-stop*, sacudida de cámara, partículas aditivas y síntesis de audio en vivo) construido íntegramente mediante código sin recursos externos.
* **Tono Narrativo:** *Cyber-Martial Arcade* — Competitivo, eléctrico, ágil y desafiante.
* **Atmósfera Visual:** **Dualidad Neón en Alto Contraste** (`#00f0ff` vs `#ff2a54` sobre `#090514`), donde cada destello cromático comunica estados de ataque, guardia o sobrecarga.
* **Tagline de Conversión (CTA):** ⚡ **«¡PELEAR AHORA! — Entra al Cyber-Dojo y Quiebra el Algoritmo»**

---

## 🛡️ Fase 2: Estructura de Cumplimiento (Legalidad y Clasificación)

### 1. 🔞 Clasificación de Audiencia (ESRB)
* **Categoría Asignada:** **ESRB E10+ (*Everyone 10+ / Todos mayores de 10 años*)** — *Violencia de Fantasía Leve (Fantasy Violence)*.
* **Análisis de Intensidad Visual (`my-first-game/game.js`):**
  Los luchadores son siluetas cibernéticas vectoriales construidas con primitivas geométricas (`Graphics`). Los impactos emplean chispas de neón aditivas (`blendMode: "ADD"`), ondas expansivas y breves sacudidas de cámara (`70 ms` a `360 ms`), sin sangre, lenguaje inapropiado ni violencia explícita.
* **Justificación Creativa:**
  El combate representa un duelo deportivo de artes marciales biónicas con energía de plasma en una arena virtual, ofreciendo emoción arcade competitiva apta para todo público mayor de 10 años.

### 2. ©️ Propiedad Intelectual (Auditoría y Atribución)
* **Licencia del Proyecto:** Código fuente distribuido bajo **MIT License** (Copyright © 2026 Jahir Rocha).
* **Tabla de Atribuciones:**

| Recurso / Componente | Tipo | Autor / Proveedor | Licencia | Uso en el Proyecto |
| :--- | :--- | :--- | :--- | :--- |
| **Phaser 4.0.0** (`phaser.min.js`) | Motor de Videojuegos Web 2D | Photon Storm Ltd. (Richard Davey) | **MIT License** | Motor gráfico, escenas, físicas Arcade, `Tweens` y partículas cargado desde CDN jsDelivr. |
| **Arte Vectorial (`Fighter`, Arena, HUD)** | Gráficos Procedimentales | **Jahir Rocha** | **MIT License** | Creados 100% por código mediante `Phaser.GameObjects.Graphics` en `my-first-game/game.js`. |
| **Sintetizador (`GestorSonido`)** | Audio Procedimental | **Jahir Rocha** | **MIT License** | Generado en tiempo real con osciladores y filtros de la **Web Audio API** estándar. |
| **Fuentes (`Impact`, `Segoe UI`, `sans-serif`)** | Fuentes del Sistema | Sistema Operativo / Navegador | Estándar en cliente | Tipografías para HUD, títulos y menús sin redistribución de archivos de fuentes externos. |

### 3. 🔒 Privacidad (Manejo de Datos Locales)
* **Ejecución 100% en Cliente (*Client-Side Only*):**
  El videojuego se ejecuta íntegramente en el navegador web del usuario. El estado de la partida (dificultad elegida, configuración de silencio, marcadores de rounds y estadísticas de combate) vive únicamente en la **memoria RAM temporal** durante la sesión activa entre las escenas de Phaser y se destruye al cerrar la pestaña. El proyecto **no utiliza cookies**, no almacena ni rastrea información personal en `localStorage`, y **no exfiltra ni envía telemetría o datos del usuario a servidores externos**.

---

## 📂 Estructura General del Repositorio

```text
rocha-jahir-jueg-gr3/
├── README.md                # Documentación general del repositorio (Fase 1 y Fase 2)
├── landing-page/            # Directorio para la Landing Page comercial del proyecto
└── my-first-game/           # Videojuego NEON KOMBAT: Cyber Arena (Phaser 4.0.0)
    ├── index.html           # Punto de entrada HTML5 y carga de Phaser 4.0.0 vía CDN
    ├── game.js              # Lógica completa del juego, gráficos procedimentales y Web Audio
    └── README.md            # Documentación técnica y de diseño del videojuego
```
