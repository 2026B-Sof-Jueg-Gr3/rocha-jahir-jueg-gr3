# ⚡ NEON KOMBAT: Cyber Arena (ISWD823)

> **«Domina el Pulso. Quiebra el Algoritmo. ¡ENTRA AL CYBER-DOJO AHORA!»**

Juego de peleas **1 vs 1 (Jugador vs CPU)** estilo arcade inspirado en *Mortal Kombat* y *The King of Fighters*, desarrollado íntegramente con **JavaScript (ES6+) y Phaser 4.0.0**.

Todos los gráficos vectoriales, animaciones de extremidades, escenarios multicapa, partículas luminosas y efectos de sonido están generados **100% por código** (`Phaser.GameObjects.Graphics`, `Container`, `Tweens`, `Particles` y `Web Audio API`), sin depender de imágenes ni archivos de audio externos.

## 🌐 Jugar en línea

👉 **[⚡ ¡PELEAR AHORA! — Jugar NEON KOMBAT: Cyber Arena en GitHub Pages](https://2026b-sof-jueg-gr3.github.io/rocha-jahir-jueg-gr3/my-first-game/)**

---

## 🔍 Radiografía Técnica Extraída del Código (`game.js` e `index.html`)

| Componente | Detalle Técnico Implementado en el Proyecto |
| :--- | :--- |
| **Título Oficial** | `NEON KOMBAT: Cyber Arena - ISWD823` |
| **Motor y Versión** | **Phaser 4.0.0** (`phaser@4.0.0` vía CDN jsDelivr) con motor de físicas **Arcade Physics** (`gravedad Y: 1550`) y escalado `Phaser.Scale.FIT` (`960×540 px`). |
| **Estética y Paleta de Color** | **Cyberpunk / Synthwave Nocturno 100% Procedimental**. Fondo abisal (`#090514` / `#1a1025`), luchador jugador **KAI** en Cian Eléctrico (`#00f0ff` / `#0066ff`), luchador CPU **VEX** en Carmesí Neón (`#ff2a54` / `#ff7b00`), acentos de sobrecarga en Dorado (`#ffd600`) y vida fantasma en Ámbar (`#ffb703`). |
| **Arquitectura de Escenas** | 3 escenas modulares: **`MenuScene`** (título animado, selector de dificultad y panel de controles), **`FightScene`** (arena de combate, HUD arcade, motor de impactos, IA y menú de pausa) y **`ResultScene`** (veredicto de victoria/derrota y panel de estadísticas). |
| **Mecánicas Nucleares** | Movimiento lateral (`280 px/s`), salto (`-650 px/s`), bloqueo en suelo (`-80%` daño recibido), empuje físico entre cuerpos (*pushbox*), sistema de ataques en 3 fases (*startup*, *active*, *recovery*) para **Puñetazo** (`6` daño), **Patada** (`10` daño) y proyectil **Onda Neón** (`15` daño al llenar el `100%` de energía), *hit-stop* (`62 ms` / `88 ms`), ventana de combos (`1850 ms`) y modo depuración de *hitboxes/hurtboxes* (`Tecla H`). |
| **Condición de Victoria / Derrota** | Combate al **mejor de 3 rounds** (`ROUNDS_PARA_GANAR: 2`), con `100 HP` por combatiente y `60 segundos` por asalto. Se gana cada round por **K.O.** (reducir la vida rival a `0`) o por **Decisión de Tiempo (`TIME`)** al tener mayor vitalidad restante cuando el reloj llega a `0`. |
| **Assets y Librerías** | **Cero archivos multimedia externos**. Texturas base (`tex_pixel`, `tex_cuerpo`, `tex_particula`) generadas en memoria RAM y sintetizador de audio en tiempo real (`GestorSonido`) construido sobre la **Web Audio API** nativa del navegador. |

---

## 🧭 Fase 1: Ingeniería del Propósito (Narrativa e Identidad)

### 1. 🎯 Logline (Premisa comercial de impacto)
En la cima del último Cyber-Dojo de Neo-Kyoto, encarna a **KAI**, un artista marcial biónico que debe derrotar al mejor de tres asaltos de 60 segundos a **VEX**, el implacable ejecutor algorítmico de la red central. Domina cada *frame* de impacto, bloquea con precisión milimétrica y sobrecarga tu núcleo de plasma para desatar la *Onda Neón* antes de que tu código vital sea purgado.

### 2. 🌐 Lore (Reglas del universo lúdico)
En el año 2096, el honor marcial ya no se mide con acero ni sangre, sino en ciclos de reloj y descargas de fotones sobre la **Cyber Arena**: un santuario suspendido entre los rascacielos de Neo-Kyoto bajo el resplandor eterno de un sol sintético. La megacorporación *Aethelgard* ha declarado obsoletos a los artistas marciales humanos, instaurando a **VEX**, un androide de combate de frecuencia carmesí (`#ff2a54`) cuya red neuronal calcula distancias, intercepta trayectorias y adapta su agresividad en tiempo real para erradicar cualquier rastro de imperfección humana.

Tú controlas a **KAI**, el último maestro del estilo *Cian-Ryu* (`#00f0ff`), un luchador que integró un exoesqueleto resonante a su propio sistema nervioso para demostrar que la intuición humana supera al cálculo frío de la máquina. Las reglas del **Torneo Cyber-Dojo** son inquebrantables: cada combate se disputa al mejor de tres rounds bajo una ventana estricta de **60 segundos de sincronización neuronal**. Nadie puede escapar de los límites magnéticos de la plataforma (`LIMITE_IZQ: 65`, `LIMITE_DER: 895`); solo el K.O. directo o la superioridad vital al agotarse el cronómetro determinan quién prevalece.

En este universo, cada intercambio físico genera resonancia energética: conectar golpes (`+20%`), mantener una guardia firme con el escudo fotónico (`+10%`) e incluso resistir el castigo enemigo (`+15%`) alimentan tu **Barra de Energía Especial**. Al alcanzar el `100%` de sobrecarga, el exoesqueleto de KAI despliega un aura pulsante que habilita la técnica definitiva del dojo: la **Onda Neón**, un proyectil de plasma concentrado capaz de quebrar la defensa algorítmica de VEX de un solo impacto.

### 3. ⚙️ Resonancia Lúdica (Mecánica justificando el aprendizaje)
Todas las mecánicas programadas en `my-first-game/game.js` están diseñadas para que el aprendizaje técnico del jugador equivalga a la maestría marcial de KAI dentro de la ficción, eliminando la disonancia ludonarrativa:

* **Física Pesada y Control del Espacio (*Footsies*):** La gravedad elevada (`1550`) y la separación física de cuerpos (`SEPARACION_MIN: 56`) otorgan peso real al exoesqueleto de ambos luchadores. Dado que el bloqueo (`S` / `↓`) solo puede activarse con los pies anclados al suelo (`enElSuelo()`), saltar a destiempo deja a KAI completamente expuesto ante un contraataque, enseñando al jugador a medir la distancia antes de avanzar.
* **Compromiso de *Frame Data* (`startup` → `active` → `recovery`):** Cada ataque en `CONFIG_JUEGO.ATAQUES` exige disciplina táctica. El **Puñetazo (`J`)** es un golpe rápido (`65 ms` de preparación) ideal para interrumpir a corta distancia, mientras que la **Patada (`K`)** ofrece mayor alcance y retroceso (`knockback: 295`), pero penaliza el fallo con `210 ms` de recuperación. El jugador aprende rápidamente que golpear al aire sin lectura previa abre una brecha crítica en su guardia.
* **Gestión de Riesgo/Recompensa y Sobrecarga (`Onda Neón`):** La defensa activa reduce el daño en un `80%` (`FACTOR_DANIO_BLOQUEO: 0.2`) y amortigua el retroceso. Aprender a alternar entre defensa sólida, cadenas de combos dentro de la ventana de `1850 ms` y la descarga oportuna del proyectil especial (`Tecla L`) refleja la filosofía del *Cyber-Dojo*: transformar la presión del rival en energía ofensiva.
* **Escalado de la IA y Evolución del Jugador:** Los tres protocolos de **VEX** (**Fácil**, **Normal** y **Difícil**) reducen el intervalo de decisión de la máquina de estados desde `480 ms` hasta `155 ms`, incrementando su probabilidad de bloqueo (`14%` a `72%`) y su velocidad de desplazamiento. Superar el modo Difícil o conquistar la revancha desde `ResultScene` representa la victoria definitiva del reflejo humano frente a la predicción artificial.

### 4. 🔥 Identidad
* **Pilar de Diseño Central (*Core Pillar*):** **«Precisión Táctica Arcade 100% Procedimental»** — Combate 1 vs 1 de respuesta inmediata y alto impacto sensorial (*hit-stop*, sacudida de cámara, partículas aditivas y síntesis de audio en vivo) construido íntegramente mediante algoritmos sin un solo recurso externo.
* **Tono Narrativo:** *Cyber-Martial Arcade* — Competitivo, eléctrico, ágil y desafiante; fusiona la tensión de los torneos de artes marciales clásicos con la vanguardia tecnológica del *cyberpunk*.
* **Atmósfera Visual:** **Dualidad Neón en Alto Contraste**. Siluetas geométricas articuladas que combaten bajo un horizonte nocturno *synthwave*, donde los destellos cian (`#00f0ff`), carmesí (`#ff2a54`) y dorado (`#ffd600`) guían de forma intuitiva la lectura de *hitboxes*, escudos y barras de energía.
* **Tagline de Conversión (CTA):**
  > ⚡ **«¡PELEAR AHORA! — Entra al Cyber-Dojo y Quiebra el Algoritmo»**

---

## 🛡️ Fase 2: Estructura de Cumplimiento (Legalidad y Clasificación)

### 1. 🔞 Clasificación de Audiencia (ESRB)
* **Categoría Asignada:** **ESRB E10+ (*Everyone 10+ / Todos mayores de 10 años*)** — *Descriptor: Violencia de Fantasía Leve ( Fantasy Violence )*.
* **Análisis Técnico de Intensidad Visual (`game.js`):**
  * **Representación de los combatientes:** Los personajes (`KAI` y `VEX`) son siluetas cibernéticas abstractas construidas mediante primitivas geométricas (`fillRoundedRect`, `fillTriangle`, `fillCircle`). No existe representación de anatomía humana realista, sangre, desmembramiento ni violencia gráfica (*gore*).
  * **Efectos de impacto y derrota:** Los golpes se representan mediante destellos blancos de `150 ms` (`flashBlanco`), ondas circulares expansivas, partículas luminosas con mezcla aditiva (`blendMode: "ADD"`) y números de daño flotantes. Al producirse el K.O., el luchador gira `90°` con una animación suave (`Bounce.easeOut`) sin efectos viscerales.
  * **Seguridad Fotosensible:** Las sacudidas de cámara (`shake` de `70 ms` a `360 ms` con baja intensidad de `0.003` a `0.018`) y las transiciones de escena (`fadeIn`/`fadeOut` de `300 ms` a `420 ms`) están acotadas y no generan parpadeos estroboscópicos de pantalla completa.
* **Justificación Narrativa y Comercial:**
  > *NEON KOMBAT: Cyber Arena* enmarca su acción dentro de un torneo deportivo cyber-marcial regulado donde dos exoesqueletos biónicos compiten mediante energía fotónica y pulsos de plasma sintético. La intensidad visual y sonora ofrece toda la adrenalina de un salón recreativo clásico manteniendo una experiencia 100% limpia, segura y apta para audiencias juveniles y generales a partir de los 10 años.

### 2. ©️ Propiedad Intelectual (Auditoría y Atribución)
* **Licencia del Código Fuente:** Todo el código fuente desarrollado en este repositorio se distribuye bajo la **Licencia MIT (*MIT License*)**, permitiendo su uso académico, modificación y distribución con atribución al autor (**Jahir Rocha**).
* **Auditoría y Tabla de Atribuciones de Recursos y Librerías:**

| Recurso / Componente | Tipo | Autor / Proveedor | Licencia | Uso en `index.html` y `game.js` |
| :--- | :--- | :--- | :--- | :--- |
| **Phaser 4.0.0** (`phaser.min.js`) | Motor de Videojuegos 2D (WebGL / Canvas) | Photon Storm Ltd. (Richard Davey) | **MIT License** | Renderizado, bucle de juego, escenas (`Scene`), físicas Arcade (`ArcadePhysics`), `Tweens` y sistema de partículas vía CDN jsDelivr. |
| **Gráficos y Sprites (`Fighter`, Escenarios, HUD)** | Arte Vectorial Procedimental | **Jahir Rocha** (Autoría propia en código) | **MIT License** | Generados dinámicamente en tiempo de ejecución con `Phaser.GameObjects.Graphics` y `generateTexture()`. Cero imágenes externas en uso. |
| **Efectos de Sonido (`GestorSonido`)** | Audio Sintetizado en Tiempo Real | **Jahir Rocha** (Autoría propia en código) | **MIT License** | Síntesis matemática de ondas (`sine`, `square`, `sawtooth`, `triangle`) y ruido blanco filtrado mediante la API estándar **Web Audio API** (W3C). |
| **Tipografías (`Impact`, `Segoe UI`, `Arial Black`, `sans-serif`)** | Fuentes del Sistema (*System Fonts*) | Nativas del Sistema Operativo / Navegador | Uso estándar en cliente | Renderizado de textos del HUD, anuncios de round (`ROUND`, `FIGHT!`, `K.O.`) y menús sin redistribución de archivos `.ttf`/`.woff`. |

### 3. 🔒 Privacidad (Manejo de Datos Locales)
* **Cláusula Técnica de Privacidad (*100% Client-Side Execution*):**
  > **NEON KOMBAT: Cyber Arena** se ejecuta íntegramente del lado del cliente (*100% Client-Side*) dentro del entorno aislado (*sandbox*) del navegador web del usuario.
  > 1. **Manejo Efímero del Estado:** Toda la información de la sesión —incluyendo la dificultad seleccionada (`facil`, `normal`, `dificil`), el estado de silencio de audio (`SONIDO.silenciado`), los contadores de rounds y las estadísticas de combate (`golpesJugador`, `danoJugador`, `comboMaxJugador`)— se gestiona exclusivamente en la **memoria RAM volátil** de JavaScript y se transmite internamente entre las escenas de Phaser (`MenuScene` → `FightScene` → `ResultScene`). Al cerrar o recargar la pestaña, todos los datos de sesión se eliminan automáticamente.
  > 2. **Cero Recolección ni Exfiltración de Datos:** El juego **no utiliza cookies de rastreo**, no escribe datos sensibles en `localStorage` ni `IndexedDB`, no solicita permisos de cámara, micrófono ni geolocalización, y **no realiza peticiones de red ni telemetría hacia servidores externos** (más allá de la carga inicial estática de la librería Phaser desde el CDN público `cdn.jsdelivr.net`). Ningún dato personal o métrica de comportamiento del jugador es recolectado, almacenado ni compartido con terceros.

---

## 🕹️ Controles del Juego

| Tecla | Acción en el Cyber-Dojo |
| :--- | :--- |
| **A / D** o **← / →** | Moverse a izquierda / derecha (`280 px/s`) |
| **W** o **↑** | Saltar (`-650 px/s`) |
| **S** o **↓** | Bloquear con escudo energético (solo en el suelo, reduce el daño un **80%**) |
| **J** | Puñetazo rápido (`6` de daño, corto alcance, `65 ms` startup) |
| **K** | Patada pesada (`10` de daño, largo alcance, `115 ms` startup) |
| **L** | **Ataque Especial — Onda Neón** (`15` de daño a distancia, requiere barra al **100%**) |
| **P** o **ESC** | Pausar / Reanudar partida (o volver al menú en pantalla de resultados) |
| **H** | Alternar visualización en vivo de cajas de colisión (*Hurtboxes* y *Hitboxes*) |
| **M** | Activar / Silenciar sintetizador de sonido |
| **ENTER / ESPACIO** | Iniciar combate / Reintentar partida |

---

## 📁 Estructura del Proyecto

```text
my-first-game/
├── index.html   # Carga Phaser 4.0.0 desde CDN y ejecuta game.js en contenedor responsivo
├── game.js      # Código fuente completo (GestorSonido, Fighter, MenuScene, FightScene, ResultScene)
└── README.md    # Documentación oficial de pre-producción (Fase 1 y Fase 2) y guía técnica
```

## 🚀 Cómo probar localmente con Live Server (VS Code)

1. Abre la carpeta del proyecto en **Visual Studio Code**.
2. Instala la extensión **Live Server** (de Ritwick Dey) si aún no la tienes.
3. Haz clic derecho sobre `my-first-game/index.html` y selecciona **"Open with Live Server"** (o haz clic en **Go Live** en la barra inferior).
4. El juego se abrirá automáticamente en tu navegador (por ejemplo, en `http://127.0.0.1:5500/my-first-game/`).
