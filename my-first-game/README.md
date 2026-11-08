# ⚡ NEON KOMBAT: CYBER ARENA (ISWD823)

> **«Domina el Pulso. Quiebra el Algoritmo. ¡ENTRA AL CYBER-DOJO AHORA!»**

[![Engine](https://img.shields.io/badge/Engine-Phaser%204.0.0-00f0ff?style=for-the-badge&logo=javascript)](https://phaser.io/)
[![Landing Page](https://img.shields.io/badge/Landing%20Page-Astro%207.4.7%20%2B%20Tailwind%20v4-ff2a85?style=for-the-badge&logo=astro)](https://2026b-sof-jueg-gr3.github.io/rocha-jahir-jueg-gr3/)
[![Itch.io](https://img.shields.io/badge/Itch.io-HTML5%20Release-fa5c5c?style=for-the-badge&logo=itch.io)](https://jahirkrox13.itch.io/neon-kombat)
[![CI/CD](https://img.shields.io/badge/GameOps-GitHub%20Actions%20%2B%20Butler%20CLI-06d6a0?style=for-the-badge&logo=githubactions)](https://github.com/2026B-Sof-Jueg-Gr3/rocha-jahir-jueg-gr3/actions)
[![License](https://img.shields.io/badge/License-MIT-ffb703?style=for-the-badge)](https://opensource.org/licenses/MIT)

Documentación técnica, de diseño y de cumplimiento normativo del videojuego **NEON KOMBAT: CYBER ARENA**, desarrollado con **Phaser 4.0.0** para la asignatura de **Desarrollo de Juegos Interactivos (ISWD823)** por **Jahir Rocha**.

---

## 🏗️ Radiografía Técnica del Proyecto

| Capa / Módulo | Stack e Implementación Real |
| :--- | :--- |
| **Motor del Videojuego (`my-first-game/`)** | **Phaser 4.0.0** (JavaScript ES6+ modular), físicas **Arcade Physics** (`gravedad Y: 1550`) y resolución panorámica nativa de `960×540 px` (`Phaser.Scale.FIT`). |
| **Renderizado y Animación** | **100% Gráficos y Animaciones Procedimentales** (`Phaser.GameObjects.Graphics`, `Container`, `Tweens`, `Particles`). Cajas de colisión (*hurtbox* y *hitbox*) calculadas dinámicamente en tiempo real con visualizador de depuración integrado (`Tecla H`). |
| **Motor de Audio (`GestorSonido`)** | **100% Síntesis de Audio Nativa con Web Audio API** (`AudioContext`, osciladores `sine`, `square`, `sawtooth`, `triangle` y buffers de ruido blanco con filtros pasa-banda). **Cero archivos `.mp3`/`.wav` externos**. |
| **Escaparate Digital (`landing-page/`)** | **Astro 7.4.7 + Tailwind CSS v4** (`@tailwindcss/vite`), diseñado bajo estética *Cyberpunk / Synthwave Nocturno* con previsualización táctica del HUD, modal jugable embebido y conversión directa hacia el canvas. |
| **Pipeline CI/CD y GameOps (`.github/workflows/deploy.yml`)** | **GitHub Actions** disparado en cada `push` a `main`, con dos *jobs* paralelos: compilación y despliegue oficial en **GitHub Pages** (`actions/deploy-pages@v4`) y publicación automatizada en **Itch.io** (`jahirkrox13/neon-kombat:html5`) mediante **Butler CLI**. |

---

## 🧭 Fase 1: Ingeniería del Propósito (Narrativa, Mecánicas e Identidad)

### 1. 🎯 Logline (Premisa Comercial de Impacto)
En la cima del último Cyber-Dojo de Neo-Kyoto en el año 2096, encarna a **KAI**, un artista marcial biónico que debe derrotar al mejor de tres asaltos de 60 segundos a **VEX**, el implacable ejecutor algorítmico de la corporación *Aethelgard*. Domina cada *frame* de impacto, bloquea con precisión milimétrica y sobrecarga tu núcleo de plasma para desatar la **Onda Neón** antes de que tu código vital sea purgado de la arena.

### 2. 🌐 Lore (El Universo de la Cyber Arena — Neo-Kyoto, 2096)
En el año **2096**, el honor marcial ya no se mide con acero ni sangre, sino en ciclos de reloj y descargas de fotones sobre la **Cyber Arena**: un santuario flotante suspendido entre los megabloques holográficos de **Neo-Kyoto** bajo el resplandor eterno de un sol sintético. La megacorporación **Aethelgard** ha declarado obsoletos los estilos de combate humanos y busca clausurar el último reducto de disciplina tradicional mediante **VEX**, un androide táctico de frecuencia carmesí (`#ff2a54`) cuya red neuronal calcula distancias, intercepta trayectorias y adapta su agresividad en milisegundos para demostrar la supremacía del algoritmo sobre el instinto humano.

El jugador toma el control de **KAI**, el último heredero del estilo *Cian-Ryu* (`#00f0ff`), un luchador cibernético que sincronizó un exoesqueleto resonante directamente a sus reflejos nerviosos para defender el santuario. Las leyes del **Torneo Cyber-Dojo** son absolutas: cada duelo se disputa al mejor de tres rounds (`ROUNDS_PARA_GANAR: 2`) dentro de una ventana crítica de **60 segundos de sincronización neuronal** y confinado por las barreras magnéticas del tatami (`LIMITE_IZQ: 65`, `LIMITE_DER: 895`). Nadie puede huir; únicamente el **K.O.** directo al vaciar los `100 HP` del oponente o la superioridad vital al expirar el reloj (`TIME`) deciden el destino del dojo.

Dentro de la Cyber Arena, el combate alimenta un ciclo termodinámico de energía: conectar impactos limpios (`+20%`), resistir embates con el escudo fotónico en guardia (`+10%`) e incluso absorber daño directo (`+15%`) recargan la **Barra de Energía Especial** de KAI. Al alcanzar el **`100%` de sobrecarga**, su núcleo despliega un aura dorada pulsante (`#ffd600`) que desbloquea la técnica secreta del santuario: la **Onda Neón**, un proyectil de plasma concentrado capaz de atravesar la arena y quebrar la coraza algorítmica de VEX.

### 3. ⚙️ Resonancia Lúdica (Mecánica Justificando el Aprendizaje)
El diseño de sistemas en `my-first-game/game.js` evita cualquier disonancia ludonarrativa haciendo que el dominio mecánico del jugador represente directamente el despertar marcial de KAI frente a la máquina:

| Mecánica Implementada en `game.js` | Parámetros Técnicos del Motor | Resonancia con la Curva de Aprendizaje y el Lore |
| :--- | :--- | :--- |
| **Fases de Ataque (*Startup / Active / Recovery*)** | **Puñetazo (`J`):** `65 / 95 / 145 ms` (`6` daño, alcance `48 px`)<br>**Patada (`K`):** `115 / 125 / 210 ms` (`10` daño, alcance `66 px`)<br>**Onda Neón (`L`):** `140 / 110 / 240 ms` (`15` daño) | Cada técnica exige compromiso temporal. El jugador aprende que lanzar patadas pesadas al vacío deja a KAI expuesto durante `210 ms` de recuperación (*whiff punish*), obligándolo a pensar como un maestro marcial que mide la distancia antes de ejecutar. |
| **Hit-Stop, Knockback y Ventana de Combos** | `HITSTOP_GOLPE_MS: 62 ms`<br>`HITSTOP_ESPECIAL_MS: 88 ms`<br>`COMBO_VENTANA_MS: 1850 ms` | La micro-congelación de físicas (*hit-stop*) al conectar un golpe brinda retroalimentación cinética inmediata y abre una fracción de segundo para encadenar combos dentro de la ventana de `1.85 s`, recompensando el ritmo y la precisión sobre el *button mashing*. |
| **Bloqueo Defensivo en Suelo y Control de Espacio** | `FACTOR_DANIO_BLOQUEO: 0.20` (`-80%` daño)<br>`GRAVEDAD_Y: 1550`<br>`SEPARACION_MIN: 56 px` | El escudo fotónico (`S` / `↓`) requiere tener los pies anclados al tatami (`enElSuelo()`). Saltar compulsivamente impide bloquear en el aire, enseñando al jugador el valor del posicionamiento terrestre (*footsies*) y la lectura de las ofensivas de VEX. |
| **Gestión de Barra de Energía y Proyectil *Onda Neón*** | Carga por golpe (`+20`), bloqueo (`+10`), daño recibido (`+15`). Requiere `100%` de carga (`ENERGIA_MAX: 100`) | Transforma la defensa paciente y el intercambio táctico en potencia ofensiva. El jugador aprende a administrar su barra como un recurso estratégico para castigar a VEX a distancia o cerrar un round crítico. |
| **Escalado de la IA de VEX (3 Protocolos)** | **Fácil:** reacción `480 ms`, bloqueo `14%`<br>**Normal:** reacción `285 ms`, bloqueo `40%`<br>**Difícil:** reacción `155 ms`, bloqueo `72%` | La máquina de estados de VEX incrementa su velocidad de lectura y tasa de guardia en cada dificultad. Superar el protocolo *Difícil* materializa el triunfo de los reflejos humanos sobre la predicción algorítmica de *Aethelgard*. |

### 4. 🔥 Identidad del Juego
* **Pilar de Diseño Central (*Core Pillar*):** **«Precisión Táctica Arcade 100% Procedimental»** — Combate 1 vs 1 de respuesta inmediata, lectura clara de *frame data* y alto impacto audiovisual generado íntegramente mediante código matemático sin depender de archivos multimedia externos.
* **Tono Narrativo:** *Arcade Retro-Cyberpunk Marcial* — Eléctrico, competitivo, honorable y cargado de adrenalina.
* **Paleta Visual Neón (Alto Contraste Semántico):**
  * **Noche Abisal Neo-Kyoto (`#090514` / `#1a1025`):** Fondo profundo que maximiza la legibilidad de siluetas y proyectiles.
  * **Cian Eléctrico (`#00f0ff` / `#0066ff`):** Identidad cromática de **KAI**, sus estelas de impacto y la *Onda Neón*.
  * **Carmesí Neón (`#ff2a54` / `#ff7b00`):** Identidad cromática del androide **VEX** y alertas de peligro algorítmico.
  * **Dorado Sobrecarga (`#ffd600` / `#ffb703`):** Indicador visual de barra de energía al `100%`, *hitboxes* activas y drenaje de vida fantasma (*ghost health*).
* **Tagline Comercial (CTA):**
  > ⚡ **«Domina el Pulso. Quiebra el Algoritmo. ¡JUGAR AHORA EN EL CYBER-DOJO!»**

---

## 🛡️ Fase 2: Estructura de Cumplimiento (Legalidad, IP y Privacidad)

### 1. 🔞 Clasificación de Audiencia (ESRB)
* **Categoría Asignada:** **ESRB E10+ (*Everyone 10+ / Todos mayores de 10 años*)** — Descriptor: *Fantasy Violence (Violencia de Fantasía Estilizada)*.
* **Justificación Técnica de Intensidad Visual:**
  1. **Ausencia Total de Sangre o Gore:** Los combatientes (`KAI` y `VEX`) son siluetas biónicas abstractas renderizadas mediante geometría vectorial (`fillRoundedRect`, `fillTriangle`, `fillCircle`). No existen texturas orgánicas, sangre, desmembramientos ni violencia explícita.
  2. **Efectos de Impacto Basados en Luz y Plasma:** Los golpes se comunican visualmente mediante destellos blancos de `150 ms` (`flashBlanco`), anillos de choque expansivos y partículas de neón con mezcla aditiva (`blendMode: "ADD"`). Al ocurrir un **K.O.**, el oponente simplemente rota `90°` sobre la lona con una interpolación suave (`Bounce.easeOut`).
  3. **Control de Intensidad Fotosensible:** El efecto de sacudida de cámara (`cameras.main.shake` entre `70 ms` y `360 ms` con intensidad controlada de `0.003` a `0.018`) y los fundidos entre escenas (`fadeIn`/`fadeOut` de `300 ms`) están calibrados para ofrecer contundencia arcade sin destellos estroboscópicos riesgosos.

### 2. ©️ Propiedad Intelectual y Auditoría de Assets
* **Licencia del Proyecto:** Todo el código fuente del videojuego (`my-first-game/`), del escaparate digital (`landing-page/`) y de los flujos de automatización (`.github/workflows/`) se distribuye bajo la licencia de código abierto **MIT License** (Copyright © 2026 **Jahir Rocha**).
* **Declaración de Transparencia Multimedia (100% Procedural / Zero External Assets):**
  Se certifica mediante auditoría de código que **NEON KOMBAT: CYBER ARENA prescinde al 100% de hojas de sprites (*spritesheets*), imágenes (`.png`, `.jpg`, `.svg`) o pistas de audio (`.mp3`, `.ogg`, `.wav`) de terceros**:
  * **Gráficos Vectoriales Procedimentales:** Los cuerpos articulados de los luchadores, el horizonte *synthwave* con sol segmentado, los rascacielos con ventanas iluminadas, las partículas (`tex_particula`) y el HUD se dibujan dinámicamente en tiempo de ejecución mediante la API `Phaser.GameObjects.Graphics`.
  * **Síntesis de Audio Nativa:** La clase `GestorSonido` sintetiza en tiempo real todos los efectos acústicos (golpes, bloqueos, salto, disparo de plasma, campana de round y fanfarria de victoria) modulando frecuencias y envolventes de ganancia directamente sobre el `AudioContext` de la **Web Audio API**.

| Componente / Librería | Tipo de Recurso | Autor / Titular | Licencia | Estado de Cumplimiento |
| :--- | :--- | :--- | :--- | :--- |
| **Phaser `4.0.0`** (`phaser.min.js`) | Motor 2D WebGL / Canvas | Photon Storm Ltd. (Richard Davey) | **MIT License** | ✅ Compatible y atribuido (vía CDN jsDelivr). |
| **Astro `7.4.7` + Tailwind CSS `4.1.0`** | Framework Web del Escaparate Digital | Astro Technology Co. / Tailwind Labs | **MIT License** | ✅ Compatible y atribuido en `landing-page/`. |
| **Arte Vectorial, Escenarios y Animaciones** | Gráficos Procedimentales en Código | **Jahir Rocha** | **MIT License** | ✅ 100% Autoría propia (cero assets externos). |
| **Motor Acústico (`GestorSonido`)** | Síntesis Matemática Web Audio API | **Jahir Rocha** | **MIT License** | ✅ 100% Autoría propia (cero samples externos). |

### 3. 🔒 Privacidad y Manejo de Datos Locales
* **Ejecución 100% del Lado del Cliente (*Client-Side Only*):**
  Tanto el videojuego como su Landing Page se ejecutan íntegramente en el navegador web del usuario sin requerir servidores de backend ni bases de datos.
* **Almacenamiento Puramente en Memoria Volátil:**
  El estado de la partida (selección de dificultad `facil` / `normal` / `dificil`, preferencia de silencio de audio, marcadores de rounds y métricas de daño/combos) reside únicamente en la **memoria RAM temporal** del contexto de ejecución de JavaScript mientras la pestaña permanece abierta y se destruye por completo al cerrarla.
* **Cero Recolección, Cookies o Telemetría:**
  El software **no recolecta datos personales**, no instala cookies de rastreo, no persiste identificadores en `localStorage` ni `IndexedDB`, y **no exfiltra telemetría ni información de uso hacia servidores externos**.

---

## 🚀 Fase 3 y 4: Arquitectura del Escaparate Digital y Canalización CI/CD

### 1. 🌐 Fase 3: El Escaparate Digital (`landing-page/`)
La carpeta [`../landing-page/`](../landing-page/) aloja la aplicación promocional construida con **Astro 7.4.7** y **Tailwind CSS v4**, diseñada como la antesala inmersiva del Cyber-Dojo:
* **Coherencia Estética Total:** Comparte exactamente la paleta cromática (`#070814`, `#00f0ff`, `#ff2a85`, `#ffb703`), efectos *scanlines* CRT y atmósfera *synthwave* del motor de juego en Phaser.
* **Conversión Directa y Modal Interactivo:** Incluye llamadas a la acción (**«JUGAR AHORA»**) que enlazan sin fricción hacia el canvas desplegado en `/rocha-jahir-jueg-gr3/my-first-game/`, además de un **Modal de Combate Embebido** que permite disputar partidas directamente dentro de la propia Landing Page.
* **Documentación Interactiva:** Presenta visualmente las tarjetas del *Lore*, la tabla técnica de *Frame Data* (`J`, `K`, `L`), la matriz de *Resonancia Lúdica* y el bloque de auditoría legal (**ESRB E10+**, **MIT License** y **Privacidad Client-Side**).

### 2. ⚙️ Fase 4: Automatización DevOps — Misión Legendaria (`.github/workflows/deploy.yml`)
El flujo de integración y despliegue continuo definido en [`../.github/workflows/deploy.yml`](../.github/workflows/deploy.yml) automatiza el ciclo de *release* completo en cada `push` a la rama `main` mediante dos trabajos (*jobs*) paralelos:

1. **Job 1 (`deploy-github-pages`) — Compilación Unificada de Astro + Phaser en GitHub Pages:**
   * Configura **Node.js 22**, instala dependencias dentro de `./landing-page` (`npm ci`) y ejecuta `npm run build` para generar el sitio estático en `./landing-page/dist/`.
   * Ejecuta la fusión de artefactos copiando íntegramente `./my-first-game/*` dentro de `./landing-page/dist/my-first-game/`, garantizando que la Landing Page se sirva en la raíz (`/rocha-jahir-jueg-gr3/`) y el juego permanezca operativo en `/rocha-jahir-jueg-gr3/my-first-game/`.
   * Empaqueta y publica el artefacto oficial con `actions/upload-pages-artifact@v3` y `actions/deploy-pages@v4`.
2. **Job 2 (`deploy-itchio`) — Distribución Continua hacia Itch.io con Butler CLI:**
   * Descarga e instala la última versión oficial de **Itch.io Butler CLI** en el runner `ubuntu-latest`.
   * Se autentica de forma segura mediante el secreto de repositorio `${{ secrets.BUTLER_API_KEY }}`.
   * Publica el contenido de `./my-first-game` directamente hacia el proyecto **`jahirkrox13/neon-kombat`** en el canal **`html5`**, etiquetando cada lanzamiento con versión semántica automática (`1.0.<run_number>-<short_sha>`).

---

## 🕹️ Controles de Combate

| Tecla | Acción en la Cyber Arena |
| :--- | :--- |
| **`A` / `D`** o **`←` / `→`** | Desplazamiento táctico horizontal (`280 px/s`) |
| **`W`** o **`↑`** | Salto de evasión / aproximación aérea (`-650 px/s`) |
| **`S`** o **`↓`** | **Bloqueo con Escudo Fotónico** (en el suelo, reduce el daño recibido un **80%**) |
| **`J`** | **Puñetazo Rápido** (`6 PTS` de daño, `65 ms` startup, ideal a corta distancia) |
| **`K`** | **Patada Pesada** (`10 PTS` de daño, `115 ms` startup, gran alcance y *knockback*) |
| **`L`** | **Especial: Onda Neón** (`15 PTS` de daño, proyectil de plasma al tener **100% de energía**) |
| **`P`** o **`ESC`** | Pausar / Reanudar combate |
| **`H`** | Mostrar / Ocultar visor técnico de *Hurtboxes* (verde) y *Hitboxes* (dorado) en tiempo real |
| **`M`** | Activar / Silenciar el sintetizador Web Audio API |

---

## 🏆 Sección Final de Entrega — Hitos Cumplidos

> [!IMPORTANT]
> **Enlaces Oficiales Operativos para Evaluación Docente (ISWD823):**

| # | Hito de Ingeniería y Distribución | Plataforma | Enlace Directo Operativo |
| :---: | :--- | :--- | :--- |
| **1** | 🌐 **Escaparate Digital (Landing Page + Juego)** | **GitHub Pages** (Astro + Tailwind CSS) | 🔗 **[https://2026b-sof-jueg-gr3.github.io/rocha-jahir-jueg-gr3/](https://2026b-sof-jueg-gr3.github.io/rocha-jahir-jueg-gr3/)**<br>*(Canvas directo: [ `/my-first-game/` ](https://2026b-sof-jueg-gr3.github.io/rocha-jahir-jueg-gr3/my-first-game/))* |
| **2** | 🎮 **Juego Comercial Publicado (Canal HTML5)** | **Itch.io** (`jahirkrox13/neon-kombat`) | 🔗 **[https://jahirkrox13.itch.io/neon-kombat](https://jahirkrox13.itch.io/neon-kombat)** |
| **3** | ⚙️ **Pipeline CI/CD (GameOps) y Código Fuente** | **GitHub Repository & Actions** | 🔗 **[https://github.com/2026B-Sof-Jueg-Gr3/rocha-jahir-jueg-gr3](https://github.com/2026B-Sof-Jueg-Gr3/rocha-jahir-jueg-gr3)** |
