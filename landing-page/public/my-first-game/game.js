/**
 * ============================================================================
 * NEON KOMBAT: CYBER ARENA - ISWD823
 * Juego de peleas 1 vs 1 (Jugador vs CPU) en Phaser 4.0.0
 * 100% gráficos procedimentales y audio sintetizado (CERO assets externos)
 * ============================================================================
 */

// ============================================================================
// 1. CONSTANTES DE CONFIGURACIÓN Y BALANCE
// ============================================================================
const CONFIG_JUEGO = {
  ANCHO: 960,
  ALTO: 540,
  SUELO_Y: 456,
  GRAVEDAD: 1550,
  LIMITE_IZQ: 65,
  LIMITE_DER: 895,
  SEPARACION_MIN: 56,

  // Dimensiones físicas del cuerpo (hurtbox)
  ANCHO_CUERPO: 46,
  ALTO_CUERPO: 110,

  // Modo de depuración visual de cajas de colisión (alternable con tecla H)
  DEBUG_HITBOXES: false,

  // Reglas del combate
  VIDA_MAX: 100,
  ENERGIA_MAX: 100,
  TIEMPO_ROUND: 60,
  ROUNDS_PARA_GANAR: 2,

  // Movimiento y defensa
  VELOCIDAD_CAMINAR: 280,
  FUERZA_SALTO: -650,
  FACTOR_DANIO_BLOQUEO: 0.2, // Reduce el daño un 80%

  // Sensación de impacto (Game Feel)
  HIT_STOP_MS: 62,
  HIT_STOP_ESPECIAL_MS: 88,
  VENTANA_COMBO_MS: 1850,
  VELOCIDAD_VIDA_FANTASMA: 28, // Puntos por segundo que baja la barra fantasma

  // Ganancia de energía especial
  ENERGIA_AL_GOLPEAR: 20,
  ENERGIA_AL_BLOQUEAR: 10,
  ENERGIA_AL_RECIBIR: 15,

  // Datos de ataques (tiempos en milisegundos)
  ATAQUES: {
    punch: {
      tipo: "punch",
      nombre: "PUÑETAZO",
      dano: 6,
      startup: 65,
      active: 95,
      recovery: 145,
      alcanceX: 48,
      offsetY: -76,
      anchoHitbox: 54,
      altoHitbox: 32,
      knockback: 185,
      hitstun: 230,
    },
    kick: {
      tipo: "kick",
      nombre: "PATADA",
      dano: 10,
      startup: 115,
      active: 125,
      recovery: 210,
      alcanceX: 66,
      offsetY: -56,
      anchoHitbox: 72,
      altoHitbox: 38,
      knockback: 295,
      hitstun: 320,
    },
    special: {
      tipo: "special",
      nombre: "ONDA NEÓN",
      dano: 15,
      startup: 140,
      active: 110,
      recovery: 240,
      velocidadProyectil: 590,
      anchoProyectil: 34,
      altoProyectil: 28,
      knockback: 390,
      hitstun: 410,
    },
  },

  // Parámetros de IA por dificultad
  DIFICULTADES: {
    facil: {
      id: "facil",
      nombre: "FÁCIL",
      intervaloDecision: 480,
      probBloqueo: 0.14,
      agresividad: 0.36,
      probAtaque: 0.34,
      probEspecial: 0.45,
      factorVelocidad: 0.84,
      colorHex: "#00e676",
      colorNum: 0x00e676,
      descripcion: "CPU paciente y predecible. Ideal para practicar.",
    },
    normal: {
      id: "normal",
      nombre: "NORMAL",
      intervaloDecision: 270,
      probBloqueo: 0.44,
      agresividad: 0.64,
      probAtaque: 0.62,
      probEspecial: 0.75,
      factorVelocidad: 1.0,
      colorHex: "#00f0ff",
      colorNum: 0x00f0ff,
      descripcion: "Duelo equilibrado con buenos reflejos.",
    },
    dificil: {
      id: "dificil",
      nombre: "DIFÍCIL",
      intervaloDecision: 155,
      probBloqueo: 0.72,
      agresividad: 0.86,
      probAtaque: 0.84,
      probEspecial: 0.92,
      factorVelocidad: 1.12,
      colorHex: "#ff2a54",
      colorNum: 0xff2a54,
      descripcion: "IA intensa y táctica. ¡Un verdadero reto!",
    },
  },
};

// ============================================================================
// 2. SINTETIZADOR DE SONIDO (Web Audio API - Cero archivos externos)
// ============================================================================
class GestorSonido {
  constructor() {
    this.ctx = null;
    this.silenciado = false;
  }

  iniciar() {
    try {
      if (!this.ctx) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx) {
          this.ctx = new AudioCtx();
        }
      }
      if (this.ctx && this.ctx.state === "suspended") {
        this.ctx.resume();
      }
    } catch (e) {
      // Ignorar si el navegador restringe Web Audio
    }
  }

  alternarSilencio() {
    this.silenciado = !this.silenciado;
    return this.silenciado;
  }

  reproducirTono(frecuenciaIni, frecuenciaFin, duracion, tipo = "sine", volumen = 0.12) {
    if (this.silenciado) return;
    this.iniciar();
    if (!this.ctx) return;

    try {
      const ahora = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = tipo;
      osc.frequency.setValueAtTime(frecuenciaIni, ahora);
      osc.frequency.exponentialRampToValueAtTime(Math.max(20, frecuenciaFin), ahora + duracion);

      gain.gain.setValueAtTime(volumen, ahora);
      gain.gain.exponentialRampToValueAtTime(0.001, ahora + duracion);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(ahora);
      osc.stop(ahora + duracion);
    } catch (e) {
      // Silenciar errores de contexto de audio
    }
  }

  reproducirRuido(duracion = 0.08, volumen = 0.14, frecuenciaFiltro = 900) {
    if (this.silenciado) return;
    this.iniciar();
    if (!this.ctx) return;

    try {
      const ahora = this.ctx.currentTime;
      const tamanoBuffer = Math.floor(this.ctx.sampleRate * duracion);
      const buffer = this.ctx.createBuffer(1, tamanoBuffer, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < tamanoBuffer; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const ruido = this.ctx.createBufferSource();
      ruido.buffer = buffer;

      const filtro = this.ctx.createBiquadFilter();
      filtro.type = "bandpass";
      filtro.frequency.setValueAtTime(frecuenciaFiltro, ahora);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(volumen, ahora);
      gain.gain.exponentialRampToValueAtTime(0.001, ahora + duracion);

      ruido.connect(filtro);
      filtro.connect(gain);
      gain.connect(this.ctx.destination);

      ruido.start(ahora);
      ruido.stop(ahora + duracion);
    } catch (e) {
      // Silenciar errores
    }
  }

  uiMover() {
    this.reproducirTono(420, 580, 0.05, "triangle", 0.08);
  }

  uiConfirmar() {
    this.reproducirTono(520, 880, 0.14, "square", 0.1);
  }

  salto() {
    this.reproducirTono(180, 420, 0.12, "sine", 0.08);
  }

  ataqueAire(esPatada = false) {
    this.reproducirRuido(esPatada ? 0.11 : 0.07, 0.08, esPatada ? 500 : 850);
  }

  impacto(tipo = "punch") {
    if (tipo === "block") {
      this.reproducirTono(780, 320, 0.08, "square", 0.11);
      return;
    }
    if (tipo === "punch") {
      this.reproducirTono(170, 55, 0.1, "triangle", 0.18);
      this.reproducirRuido(0.07, 0.15, 950);
    } else if (tipo === "kick") {
      this.reproducirTono(130, 40, 0.15, "sawtooth", 0.2);
      this.reproducirRuido(0.11, 0.2, 650);
    } else if (tipo === "special") {
      this.reproducirTono(240, 35, 0.24, "sawtooth", 0.24);
      this.reproducirRuido(0.18, 0.24, 480);
    }
  }

  lanzarEspecial() {
    this.reproducirTono(320, 960, 0.18, "sawtooth", 0.14);
    this.reproducirTono(640, 220, 0.22, "sine", 0.12);
  }

  anuncioRound() {
    this.reproducirTono(330, 440, 0.16, "triangle", 0.12);
  }

  anuncioFight() {
    this.reproducirTono(440, 880, 0.24, "sawtooth", 0.15);
  }

  anuncioKO() {
    this.reproducirTono(190, 32, 0.45, "sawtooth", 0.25);
    this.reproducirRuido(0.32, 0.22, 320);
  }
}

const SONIDO = new GestorSonido();

// ============================================================================
// 3. GENERADOR DE TEXTURAS PROCEDIMENTALES COMPARTIDAS
// ============================================================================
function asegurarTexturasBase(scene) {
  if (!scene.textures.exists("tex_pixel")) {
    const g = scene.make.graphics({ add: false });
    g.fillStyle(0xffffff, 1);
    g.fillRect(0, 0, 4, 4);
    g.generateTexture("tex_pixel", 4, 4);
    g.destroy();
  }

  // Textura del tamaño exacto del cuerpo (46x110) para que physBox, body y pies coincidan
  if (!scene.textures.exists("tex_cuerpo")) {
    const g = scene.make.graphics({ add: false });
    g.fillStyle(0xffffff, 1);
    g.fillRect(0, 0, CONFIG_JUEGO.ANCHO_CUERPO, CONFIG_JUEGO.ALTO_CUERPO);
    g.generateTexture("tex_cuerpo", CONFIG_JUEGO.ANCHO_CUERPO, CONFIG_JUEGO.ALTO_CUERPO);
    g.destroy();
  }

  if (!scene.textures.exists("tex_particula")) {
    const g = scene.make.graphics({ add: false });
    g.fillStyle(0xffffff, 0.25);
    g.fillCircle(8, 8, 8);
    g.fillStyle(0xffffff, 0.6);
    g.fillCircle(8, 8, 5);
    g.fillStyle(0xffffff, 1);
    g.fillCircle(8, 8, 2.5);
    g.generateTexture("tex_particula", 16, 16);
    g.destroy();
  }
}

function transicionarAEscena(scene, destino, datos = {}, duracionMs = 320) {
  let ejecutado = false;
  const cambiar = () => {
    if (ejecutado) return;
    ejecutado = true;
    if (scene && scene.scene) {
      scene.scene.start(destino, datos);
    }
  };

  const cam = scene && scene.cameras ? scene.cameras.main : null;
  if (!cam) {
    cambiar();
    return;
  }

  if (cam.fadeEffect) {
    cam.fadeEffect.reset();
  }

  cam.once("camerafadeoutcomplete", cambiar);
  cam.fadeOut(duracionMs, 0, 0, 0);

  // Respaldo de seguridad por si el evento de cámara no se dispara
  setTimeout(cambiar, duracionMs + 100);
}

// ============================================================================
// 4. CLASE REUTILIZABLE DE LUCHADOR (JUGADOR Y CPU)
// ============================================================================
class Fighter {
  constructor(scene, config) {
    this.scene = scene;
    this.nombre = config.nombre;
    this.esCPU = Boolean(config.esCPU);
    this.colorPrimario = config.colorPrimario;
    this.colorSecundario = config.colorSecundario;
    this.direccion = config.direccionInicial || 1; // 1 = derecha, -1 = izquierda

    // Estadísticas de combate
    this.vida = CONFIG_JUEGO.VIDA_MAX;
    this.energia = 0;

    // Estados del luchador
    this.bloqueando = false;
    this.atacando = false;
    this.tipoAtaque = null;
    this.faseAtaque = null; // 'startup' | 'active' | 'recovery'
    this.tiempoFaseMs = 0;
    this.ataqueYaGolpeo = false;
    this.proyectilDisparado = false;
    this.aturdidoMs = 0;
    this.derrotado = false;
    this.tiempoCaminata = 0;

    // 1. Sombra proyectada exactamente debajo de los pies en el suelo
    this.sombra = scene.add.ellipse(config.x, CONFIG_JUEGO.SUELO_Y + 3, 62, 14, 0x000000, 0.55);
    this.sombra.setDepth(5);

    // 2. Caja física invisible con textura 46x110 y origin (0.5, 1) en los pies
    this.physBox = scene.physics.add.sprite(config.x, config.y, "tex_cuerpo");
    this.physBox.setOrigin(0.5, 1);
    this.physBox.setVisible(false);
    this.physBox.body.setSize(CONFIG_JUEGO.ANCHO_CUERPO, CONFIG_JUEGO.ALTO_CUERPO, false);
    this.physBox.body.setOffset(0, 0);
    this.physBox.setCollideWorldBounds(true);
    this.physBox.body.setMaxVelocity(700, 950);

    // 3. Hitbox geométrica de ataque separada del cuerpo (sin cuerpo físico innecesario)
    this.attackHitbox = new Phaser.Geom.Rectangle(0, 0, 0, 0);
    this.hitboxAtaqueActiva = false;

    // 4. Contenedor visual del personaje y sus extremidades
    this.visual = scene.add.container(config.x, config.y);
    this.visual.setDepth(10);
    this.construirCuerpoVisual();
    this.iniciarTweenRespiracion();
  }

  get x() {
    return this.physBox.x;
  }

  set x(valor) {
    this.physBox.x = valor;
    this.visual.x = valor;
  }

  get y() {
    return this.physBox.y;
  }

  enElSuelo() {
    return this.physBox.body.blocked.down || this.physBox.body.touching.down;
  }

  // Hurtbox exacta basada en las coordenadas reales del body físico
  obtenerHurtbox() {
    const b = this.physBox.body;
    return new Phaser.Geom.Rectangle(b.x, b.y, b.width, b.height);
  }

  obtenerHitboxAtaque() {
    return this.attackHitbox;
  }

  actualizarPosicionHitboxAtaque() {
    if (!this.atacando || this.faseAtaque !== "active" || !this.tipoAtaque) {
      this.hitboxAtaqueActiva = false;
      return;
    }

    const datos = CONFIG_JUEGO.ATAQUES[this.tipoAtaque];
    if (!datos || !datos.alcanceX) {
      this.hitboxAtaqueActiva = false;
      return;
    }

    const centroX = this.physBox.x + this.direccion * datos.alcanceX;
    const centroY = this.physBox.y + datos.offsetY;
    this.attackHitbox.setTo(
      centroX - datos.anchoHitbox / 2,
      centroY - datos.altoHitbox / 2,
      datos.anchoHitbox,
      datos.altoHitbox
    );
    this.hitboxAtaqueActiva = true;
  }

  construirCuerpoVisual() {
    const c1 = this.colorPrimario;
    const c2 = this.colorSecundario;

    // Aura de energía cuando la barra especial está al 100%
    this.auraEspecial = this.scene.add.graphics();
    this.auraEspecial.lineStyle(2.5, c1, 0.75);
    this.auraEspecial.strokeEllipse(0, -56, 68, 122);
    this.auraEspecial.fillStyle(c1, 0.12);
    this.auraEspecial.fillEllipse(0, -56, 64, 118);
    this.auraEspecial.setVisible(false);

    // Brazo trasero
    this.brazoTrasero = this.scene.add.graphics();
    this.brazoTrasero.setPosition(-8, -82);
    this.brazoTrasero.fillStyle(0x141824, 1);
    this.brazoTrasero.lineStyle(2, c2, 0.8);
    this.brazoTrasero.fillRoundedRect(-5, 0, 12, 28, 4);
    this.brazoTrasero.strokeRoundedRect(-5, 0, 12, 28, 4);
    this.brazoTrasero.fillStyle(c2, 1);
    this.brazoTrasero.fillCircle(2, 28, 6);

    // Pierna trasera
    this.piernaTrasera = this.scene.add.graphics();
    this.piernaTrasera.setPosition(-7, -44);
    this.piernaTrasera.fillStyle(0x121521, 1);
    this.piernaTrasera.lineStyle(2, c2, 0.85);
    this.piernaTrasera.fillRoundedRect(-6, 0, 13, 42, 4);
    this.piernaTrasera.strokeRoundedRect(-6, 0, 13, 42, 4);
    this.piernaTrasera.fillStyle(c2, 1);
    this.piernaTrasera.fillRoundedRect(-4, 36, 16, 8, 3);

    // Torso (Gi / Armadura cibernética)
    this.torso = this.scene.add.graphics();
    this.torso.setPosition(0, -68);
    this.torso.fillStyle(0x16192b, 1);
    this.torso.lineStyle(2.5, c1, 1);
    this.torso.fillRoundedRect(-16, -24, 32, 46, 6);
    this.torso.strokeRoundedRect(-16, -24, 32, 46, 6);
    // Pechera y cinturón neón
    this.torso.fillStyle(c1, 0.25);
    this.torso.fillTriangle(-12, -20, 12, -20, 0, 6);
    this.torso.fillStyle(c1, 1);
    this.torso.fillCircle(0, -8, 4.5);
    this.torso.fillStyle(c2, 1);
    this.torso.fillRect(-17, 12, 34, 6);

    // Cabeza con visor neón y cinta de combate
    this.cabeza = this.scene.add.graphics();
    this.cabeza.setPosition(0, -102);
    // Cinta ondeando detrás
    this.cabeza.fillStyle(c1, 0.9);
    this.cabeza.fillTriangle(-10, -4, -30, -10, -26, 2);
    this.cabeza.fillTriangle(-10, -2, -28, 4, -22, 10);
    // Casco / Cabeza
    this.cabeza.fillStyle(0x181c30, 1);
    this.cabeza.lineStyle(2.5, c1, 1);
    this.cabeza.fillRoundedRect(-12, -13, 24, 24, 7);
    this.cabeza.strokeRoundedRect(-12, -13, 24, 24, 7);
    // Visor brillante mirando al frente (+X)
    this.cabeza.fillStyle(c1, 1);
    this.cabeza.fillRoundedRect(0, -6, 11, 6, 2);
    this.cabeza.fillStyle(0xffffff, 0.9);
    this.cabeza.fillRect(3, -5, 6, 2);

    // Pierna delantera
    this.piernaDelantera = this.scene.add.graphics();
    this.piernaDelantera.setPosition(7, -44);
    this.piernaDelantera.fillStyle(0x181c30, 1);
    this.piernaDelantera.lineStyle(2.5, c1, 1);
    this.piernaDelantera.fillRoundedRect(-6, 0, 13, 42, 4);
    this.piernaDelantera.strokeRoundedRect(-6, 0, 13, 42, 4);
    this.piernaDelantera.fillStyle(c1, 1);
    this.piernaDelantera.fillRoundedRect(-4, 36, 17, 8, 3);

    // Brazo delantero
    this.brazoDelantero = this.scene.add.graphics();
    this.brazoDelantero.setPosition(8, -82);
    this.brazoDelantero.fillStyle(0x1b2038, 1);
    this.brazoDelantero.lineStyle(2.5, c1, 1);
    this.brazoDelantero.fillRoundedRect(-5, 0, 12, 28, 4);
    this.brazoDelantero.strokeRoundedRect(-5, 0, 12, 28, 4);
    // Guantelete brillante
    this.brazoDelantero.fillStyle(c1, 1);
    this.brazoDelantero.fillCircle(2, 28, 7);
    this.brazoDelantero.fillStyle(0xffffff, 0.8);
    this.brazoDelantero.fillCircle(3, 28, 3);

    // Efecto visual de estela de ataque (activo durante el golpe)
    this.estelaAtaque = this.scene.add.graphics();
    this.estelaAtaque.setVisible(false);

    // Escudo energético al bloquear
    this.escudoVisual = this.scene.add.graphics();
    this.escudoVisual.lineStyle(3.5, c1, 0.95);
    this.escudoVisual.fillStyle(c1, 0.22);
    this.escudoVisual.fillRoundedRect(12, -104, 16, 86, 8);
    this.escudoVisual.strokeRoundedRect(12, -104, 16, 86, 8);
    this.escudoVisual.setVisible(false);

    // Silueta blanca para parpadeo al recibir daño
    this.flashBlanco = this.scene.add.graphics();
    this.flashBlanco.fillStyle(0xffffff, 0.95);
    this.flashBlanco.fillRoundedRect(-16, -115, 34, 112, 10);
    this.flashBlanco.setAlpha(0);

    this.visual.add([
      this.auraEspecial,
      this.brazoTrasero,
      this.piernaTrasera,
      this.torso,
      this.cabeza,
      this.piernaDelantera,
      this.brazoDelantero,
      this.estelaAtaque,
      this.escudoVisual,
      this.flashBlanco,
    ]);
  }

  iniciarTweenRespiracion() {
    if (this.tweenRespiracion) {
      this.tweenRespiracion.stop();
      this.tweenRespiracion = null;
    }
    this.torso.setPosition(0, -68);
    this.cabeza.setPosition(0, -102);

    this.tweenRespiracion = this.scene.tweens.add({
      targets: [this.torso, this.cabeza],
      y: "+=2.5",
      duration: 550,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });
  }

  detenerTweensExtremidades() {
    this.scene.tweens.killTweensOf([
      this.brazoDelantero,
      this.brazoTrasero,
      this.piernaDelantera,
      this.piernaTrasera,
      this.visual,
    ]);
  }

  restaurarPosturaBase() {
    this.torso.setRotation(0);
    this.cabeza.setRotation(0);
    this.brazoDelantero.setPosition(8, -82).setRotation(-0.35);
    this.brazoTrasero.setPosition(-8, -82).setRotation(0.25);
    this.piernaDelantera.setPosition(7, -44).setRotation(0);
    this.piernaTrasera.setPosition(-7, -44).setRotation(0);
    this.estelaAtaque.clear().setVisible(false);

    if (!this.tweenRespiracion || !this.tweenRespiracion.isPlaying()) {
      this.iniciarTweenRespiracion();
    }
  }

  iniciarAtaque(tipo) {
    if (this.atacando || this.aturdidoMs > 0 || this.bloqueando || this.derrotado) return false;
    if (tipo === "special" && this.energia < CONFIG_JUEGO.ENERGIA_MAX) return false;

    const datos = CONFIG_JUEGO.ATAQUES[tipo];
    if (!datos) return false;

    if (tipo === "special") {
      this.energia = 0;
    }

    this.atacando = true;
    this.tipoAtaque = tipo;
    this.faseAtaque = "startup";
    this.tiempoFaseMs = datos.startup;
    this.ataqueYaGolpeo = false;
    this.proyectilDisparado = false;
    this.hitboxAtaqueActiva = false;
    this.bloqueando = false;
    this.escudoVisual.setVisible(false);

    // Si está en el suelo, frena el desplazamiento para dar peso al golpe
    if (this.enElSuelo()) {
      this.physBox.setVelocityX(0);
    }

    SONIDO.ataqueAire(tipo === "kick");

    // Animaciones de preparación (startup) con Tweens solo en extremidades (sin matar la respiración)
    this.scene.tweens.killTweensOf([this.brazoDelantero, this.brazoTrasero, this.piernaDelantera]);
    if (tipo === "punch") {
      this.scene.tweens.add({
        targets: this.brazoDelantero,
        x: -4,
        y: -80,
        rotation: -0.9,
        duration: datos.startup,
        ease: "Quad.easeOut",
      });
    } else if (tipo === "kick") {
      this.scene.tweens.add({
        targets: this.piernaDelantera,
        x: 4,
        y: -52,
        rotation: -0.7,
        duration: datos.startup,
        ease: "Quad.easeOut",
      });
    } else if (tipo === "special") {
      this.scene.tweens.add({
        targets: [this.brazoDelantero, this.brazoTrasero],
        x: -6,
        rotation: -1.1,
        duration: datos.startup,
        ease: "Back.easeOut",
      });
    }

    return true;
  }

  entrarFaseActiva() {
    const datos = CONFIG_JUEGO.ATAQUES[this.tipoAtaque];
    this.faseAtaque = "active";
    this.tiempoFaseMs = datos.active;

    this.estelaAtaque.clear();
    this.estelaAtaque.setVisible(true);

    if (this.tipoAtaque === "punch") {
      // Posicionar hitbox en el mismo instante en que entra en fase activa
      this.actualizarPosicionHitboxAtaque();

      this.scene.tweens.add({
        targets: this.brazoDelantero,
        x: 28,
        y: -78,
        rotation: -1.55,
        duration: Math.min(55, datos.active),
        ease: "Expo.easeOut",
      });
      this.torso.setRotation(0.14);

      this.estelaAtaque.fillStyle(this.colorPrimario, 0.55);
      this.estelaAtaque.fillRoundedRect(16, -84, 38, 14, 6);
      this.estelaAtaque.fillStyle(0xffffff, 0.85);
      this.estelaAtaque.fillCircle(50, -77, 8);
    } else if (this.tipoAtaque === "kick") {
      // Posicionar hitbox en el mismo instante en que entra en fase activa
      this.actualizarPosicionHitboxAtaque();

      this.scene.tweens.add({
        targets: this.piernaDelantera,
        x: 24,
        y: -52,
        rotation: -1.48,
        duration: Math.min(65, datos.active),
        ease: "Expo.easeOut",
      });
      this.torso.setRotation(-0.18);

      this.estelaAtaque.lineStyle(5, this.colorPrimario, 0.8);
      this.estelaAtaque.strokeRect(20, -64, 48, 16);
      this.estelaAtaque.fillStyle(0xffffff, 0.75);
      this.estelaAtaque.fillRoundedRect(24, -62, 44, 12, 5);
    } else if (this.tipoAtaque === "special") {
      this.hitboxAtaqueActiva = false;

      this.scene.tweens.add({
        targets: [this.brazoDelantero, this.brazoTrasero],
        x: 22,
        y: -76,
        rotation: -1.55,
        duration: 60,
        ease: "Expo.easeOut",
      });
      this.torso.setRotation(0.2);

      this.estelaAtaque.fillStyle(this.colorPrimario, 0.85);
      this.estelaAtaque.fillCircle(36, -72, 16);
      this.estelaAtaque.fillStyle(0xffffff, 0.95);
      this.estelaAtaque.fillCircle(36, -72, 9);

      if (!this.proyectilDisparado) {
        this.proyectilDisparado = true;
        this.scene.dispararProyectilEspecial(this);
      }
    }
  }

  entrarFaseRecuperacion() {
    const datos = CONFIG_JUEGO.ATAQUES[this.tipoAtaque];
    this.faseAtaque = "recovery";
    this.tiempoFaseMs = datos.recovery;
    this.hitboxAtaqueActiva = false;
    this.estelaAtaque.clear().setVisible(false);

    // Regreso suave de las extremidades a la postura de guardia
    this.scene.tweens.add({
      targets: this.brazoDelantero,
      x: 8,
      y: -82,
      rotation: -0.35,
      duration: datos.recovery,
      ease: "Sine.easeInOut",
    });
    this.scene.tweens.add({
      targets: this.brazoTrasero,
      x: -8,
      y: -82,
      rotation: 0.25,
      duration: datos.recovery,
      ease: "Sine.easeInOut",
    });
    this.scene.tweens.add({
      targets: this.piernaDelantera,
      x: 7,
      y: -44,
      rotation: 0,
      duration: datos.recovery,
      ease: "Sine.easeInOut",
    });
    this.torso.setRotation(0);
  }

  cancelarAtaque() {
    this.atacando = false;
    this.tipoAtaque = null;
    this.faseAtaque = null;
    this.tiempoFaseMs = 0;
    this.hitboxAtaqueActiva = false;
    this.estelaAtaque.clear().setVisible(false);
    this.detenerTweensExtremidades();
    this.restaurarPosturaBase();
  }

  recibirImpacto(danoBase, knockbackX, hitstunMs, direccionImpacto) {
    if (this.derrotado) return { danoReal: 0, bloqueado: false };

    const bloqueado = this.bloqueando && this.enElSuelo();
    const danoReal = bloqueado
      ? Math.max(1, Math.round(danoBase * CONFIG_JUEGO.FACTOR_DANIO_BLOQUEO))
      : danoBase;

    this.vida = Math.max(0, this.vida - danoReal);

    // Ganancia de energía al recibir golpe
    const ganancia = bloqueado
      ? CONFIG_JUEGO.ENERGIA_AL_BLOQUEAR
      : CONFIG_JUEGO.ENERGIA_AL_RECIBIR;
    this.agregarEnergia(ganancia);

    if (bloqueado) {
      // Retroceso menor al bloquear
      this.physBox.setVelocityX(direccionImpacto * (knockbackX * 0.42));
      this.aturdidoMs = 95;
    } else {
      // Limpiar bloqueo e interrumpir cualquier ataque en curso
      this.bloqueando = false;
      this.escudoVisual.setVisible(false);
      this.cancelarAtaque();

      this.aturdidoMs = hitstunMs;
      this.physBox.setVelocityX(direccionImpacto * knockbackX);
      if (this.enElSuelo() && knockbackX > 300) {
        this.physBox.setVelocityY(-180);
      }

      // Inclinación hacia atrás por impacto
      this.torso.setRotation(-0.28);
      this.cabeza.setRotation(-0.25);

      // Parpadeo blanco del personaje con Tween
      this.flashBlanco.setAlpha(0.95);
      this.scene.tweens.killTweensOf(this.flashBlanco);
      this.scene.tweens.add({
        targets: this.flashBlanco,
        alpha: 0,
        duration: 150,
        ease: "Quad.easeOut",
      });
    }

    if (this.vida <= 0) {
      this.caerDerrotado(direccionImpacto);
    }

    return { danoReal, bloqueado };
  }

  caerDerrotado(direccionImpacto) {
    this.derrotado = true;
    this.bloqueando = false;
    this.escudoVisual.setVisible(false);
    this.auraEspecial.setVisible(false);
    this.cancelarAtaque();

    if (this.tweenRespiracion) {
      this.tweenRespiracion.stop();
      this.tweenRespiracion = null;
    }

    this.physBox.setVelocityX(direccionImpacto * 260);
    this.physBox.setVelocityY(-280);

    // Animación de caída al K.O. con Tween
    this.scene.tweens.add({
      targets: this.visual,
      rotation: -Math.PI / 2,
      duration: 420,
      ease: "Bounce.easeOut",
    });
  }

  agregarEnergia(cantidad) {
    if (this.derrotado) return;
    this.energia = Phaser.Math.Clamp(this.energia + cantidad, 0, CONFIG_JUEGO.ENERGIA_MAX);
  }

  reiniciarParaRound(x, direccion) {
    this.detenerTweensExtremidades();

    this.vida = CONFIG_JUEGO.VIDA_MAX;
    this.energia = 0;
    this.direccion = direccion;
    this.bloqueando = false;
    this.atacando = false;
    this.tipoAtaque = null;
    this.faseAtaque = null;
    this.tiempoFaseMs = 0;
    this.ataqueYaGolpeo = false;
    this.proyectilDisparado = false;
    this.hitboxAtaqueActiva = false;
    this.aturdidoMs = 0;
    this.derrotado = false;

    this.physBox.setPosition(x, CONFIG_JUEGO.SUELO_Y);
    this.physBox.setVelocity(0, 0);

    this.visual.setPosition(x, CONFIG_JUEGO.SUELO_Y);
    this.visual.setRotation(0);
    this.visual.scaleX = direccion;
    this.flashBlanco.setAlpha(0);
    this.escudoVisual.setVisible(false);

    this.iniciarTweenRespiracion();
    this.restaurarPosturaBase();
  }

  actualizar(delta, entrada, factorVelocidad = 1) {
    // 1. Sincronizar contenedor visual y sombra con la caja física
    this.visual.setPosition(this.physBox.x, this.physBox.y);
    if (!this.derrotado) {
      this.visual.scaleX = this.direccion;
    }

    const alturaVuelo = Math.max(0, CONFIG_JUEGO.SUELO_Y - this.physBox.y);
    const escalaSombra = Phaser.Math.Clamp(1 - alturaVuelo / 260, 0.35, 1);
    this.sombra.setPosition(this.physBox.x, CONFIG_JUEGO.SUELO_Y + 3);
    this.sombra.setScale(escalaSombra, escalaSombra);
    this.sombra.setAlpha(0.55 * escalaSombra);

    // Aura de energía especial llena
    if (this.energia >= CONFIG_JUEGO.ENERGIA_MAX && !this.derrotado) {
      this.auraEspecial.setVisible(true);
      this.auraEspecial.setAlpha(0.6 + Math.sin(this.scene.time.now * 0.012) * 0.35);
    } else {
      this.auraEspecial.setVisible(false);
    }

    if (this.derrotado) {
      this.hitboxAtaqueActiva = false;
      if (this.enElSuelo()) {
        this.physBox.setVelocityX(this.physBox.body.velocity.x * 0.88);
      }
      return;
    }

    // 2. Actualizar estado de aturdimiento (hitstun)
    if (this.aturdidoMs > 0) {
      this.aturdidoMs -= delta;
      this.physBox.setVelocityX(this.physBox.body.velocity.x * 0.9);
      if (this.aturdidoMs <= 0) {
        this.aturdidoMs = 0;
        this.bloqueando = false;
        this.escudoVisual.setVisible(false);
        this.restaurarPosturaBase();
      }
      return;
    }

    // 3. Actualizar fases de ataque (startup -> active -> recovery)
    if (this.atacando) {
      this.tiempoFaseMs -= delta;
      if (this.tiempoFaseMs <= 0) {
        if (this.faseAtaque === "startup") {
          this.entrarFaseActiva();
        } else if (this.faseAtaque === "active") {
          this.entrarFaseRecuperacion();
        } else {
          this.atacando = false;
          this.tipoAtaque = null;
          this.faseAtaque = null;
          this.hitboxAtaqueActiva = false;
          this.restaurarPosturaBase();
        }
      }

      if (this.atacando && this.faseAtaque === "active") {
        this.actualizarPosicionHitboxAtaque();
      }
      return;
    }

    // 4. Procesar bloqueo (solo en el suelo, impide atacar y moverse)
    if (entrada.bloquear && this.enElSuelo()) {
      this.bloqueando = true;
      this.physBox.setVelocityX(0);
      this.escudoVisual.setVisible(true);
      this.brazoDelantero.setPosition(12, -86).setRotation(-1.1);
      this.brazoTrasero.setPosition(6, -84).setRotation(-0.95);
      return;
    } else if (this.bloqueando) {
      this.bloqueando = false;
      this.escudoVisual.setVisible(false);
      this.restaurarPosturaBase();
    }

    // 5. Iniciar ataques si se presionó alguno
    if (entrada.especial && this.energia >= CONFIG_JUEGO.ENERGIA_MAX) {
      this.iniciarAtaque("special");
      return;
    }
    if (entrada.puno) {
      this.iniciarAtaque("punch");
      return;
    }
    if (entrada.patada) {
      this.iniciarAtaque("kick");
      return;
    }

    // 6. Movimiento horizontal y salto
    const velMax = CONFIG_JUEGO.VELOCIDAD_CAMINAR * factorVelocidad;
    if (entrada.izq) {
      this.physBox.setVelocityX(-velMax);
    } else if (entrada.der) {
      this.physBox.setVelocityX(velMax);
    } else {
      this.physBox.setVelocityX(0);
    }

    if (entrada.saltar && this.enElSuelo()) {
      this.physBox.setVelocityY(CONFIG_JUEGO.FUERZA_SALTO);
      SONIDO.salto();
    }

    // 7. Animación procedimental de caminar y saltar
    if (!this.enElSuelo()) {
      this.piernaDelantera.setRotation(-0.45);
      this.piernaTrasera.setRotation(0.35);
      this.brazoDelantero.setRotation(-0.65);
    } else if (Math.abs(this.physBox.body.velocity.x) > 10) {
      this.tiempoCaminata += delta * 0.014;
      const onda = Math.sin(this.tiempoCaminata);
      this.piernaDelantera.setRotation(onda * 0.45);
      this.piernaTrasera.setRotation(-onda * 0.45);
      this.brazoDelantero.setRotation(-0.35 - onda * 0.25);
      this.brazoTrasero.setRotation(0.25 + onda * 0.25);
    } else {
      this.piernaDelantera.setRotation(0);
      this.piernaTrasera.setRotation(0);
      this.brazoDelantero.setRotation(-0.35);
      this.brazoTrasero.setRotation(0.25);
    }
  }
}

// ============================================================================
// 5. ESCENA 1: MENÚ PRINCIPAL (MenuScene)
// ============================================================================
class MenuScene extends Phaser.Scene {
  constructor() {
    super("MenuScene");
  }

  init(data) {
    this.dificultadSeleccionada = (data && data.dificultad) || "normal";
    this.enTransicion = false;
  }

  create() {
    window.focus();
    this.input.on("pointerdown", () => {
      window.focus();
      SONIDO.iniciar();
    });

    this.events.once("shutdown", () => {
      if (this.input && this.input.keyboard) {
        this.input.keyboard.removeAllListeners();
      }
      if (this.time) {
        this.time.removeAllEvents();
      }
      if (this.tweens) {
        this.tweens.killAll();
      }
    });

    asegurarTexturasBase(this);
    if (this.cameras.main.fadeEffect) {
      this.cameras.main.fadeEffect.reset();
    }
    this.cameras.main.fadeIn(350, 0, 0, 0);

    this.dibujarFondoMenu();
    this.crearTituloAnimado();
    this.crearSelectorDificultad();
    this.crearPanelControles();
    this.crearBotonInicio();
    this.configurarTecladoMenu();
  }

  dibujarFondoMenu() {
    const { ANCHO, ALTO } = CONFIG_JUEGO;
    const g = this.add.graphics();

    // Cielo nocturno degradado cyberpunk
    g.fillGradientStyle(0x090514, 0x090514, 0x2b0f3a, 0x1a0b2e, 1);
    g.fillRect(0, 0, ANCHO, ALTO);

    // Sol sintético al horizonte
    g.fillStyle(0xff2a54, 0.22);
    g.fillCircle(ANCHO / 2, 260, 145);
    g.fillStyle(0xff7b00, 0.35);
    g.fillCircle(ANCHO / 2, 260, 105);

    // Silueta de rascacielos al fondo
    g.fillStyle(0x0d0818, 1);
    const edificios = [
      [0, 220, 90, 220],
      [85, 180, 75, 260],
      [155, 240, 80, 200],
      [230, 195, 65, 245],
      [660, 200, 75, 240],
      [730, 170, 85, 270],
      [810, 225, 70, 215],
      [875, 190, 90, 250],
    ];
    edificios.forEach(([x, y, w, h]) => g.fillRect(x, y, w, h));

    // Suelo con cuadrícula en perspectiva
    g.fillStyle(0x110920, 1);
    g.fillRect(0, 410, ANCHO, ALTO - 410);
    g.lineStyle(2, 0x00f0ff, 0.35);
    g.lineBetween(0, 410, ANCHO, 410);

    g.lineStyle(1, 0xff2a54, 0.22);
    for (let i = -6; i <= 6; i++) {
      g.lineBetween(ANCHO / 2 + i * 55, 410, ANCHO / 2 + i * 160, ALTO);
    }

    // Partículas ambientales flotantes
    this.add.particles(0, 0, "tex_particula", {
      x: { min: 0, max: ANCHO },
      y: { min: 60, max: ALTO - 40 },
      speedY: { min: -35, max: -12 },
      speedX: { min: -10, max: 10 },
      scale: { start: 0.45, end: 0 },
      alpha: { start: 0.65, end: 0 },
      tint: [0x00f0ff, 0xff2a54, 0xffd600],
      lifespan: 3200,
      frequency: 110,
      blendMode: "ADD",
    });
  }

  crearTituloAnimado() {
    const { ANCHO } = CONFIG_JUEGO;

    const subtituloSup = this.add
      .text(ANCHO / 2, 42, "⚡ TORNEO CYBER-DOJO 1 VS 1 ⚡", {
        fontFamily: "sans-serif",
        fontSize: "14px",
        fontStyle: "bold",
        color: "#00f0ff",
        letterSpacing: 4,
      })
      .setOrigin(0.5);

    const titulo = this.add
      .text(ANCHO / 2, 88, "NEON KOMBAT", {
        fontFamily: "Impact, Haettenschweiler, 'Arial Black', sans-serif",
        fontSize: "64px",
        fontStyle: "bold",
        color: "#ffffff",
        stroke: "#ff2a54",
        strokeThickness: 8,
        shadow: {
          offsetX: 0,
          offsetY: 0,
          color: "#00f0ff",
          blur: 18,
          stroke: true,
          fill: true,
        },
      })
      .setOrigin(0.5);

    this.tweens.add({
      targets: titulo,
      scaleX: 1.04,
      scaleY: 1.04,
      duration: 1200,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });

    this.tweens.add({
      targets: subtituloSup,
      alpha: 0.45,
      duration: 900,
      yoyo: true,
      repeat: -1,
    });
  }

  crearSelectorDificultad() {
    const { ANCHO } = CONFIG_JUEGO;

    this.add
      .text(ANCHO / 2, 152, "SELECCIONA DIFICULTAD DE LA CPU (← / → o CLIC)", {
        fontFamily: "sans-serif",
        fontSize: "14px",
        fontStyle: "bold",
        color: "#cbd5e1",
      })
      .setOrigin(0.5);

    this.botonesDificultad = {};
    const claves = ["facil", "normal", "dificil"];
    const espaciado = 210;

    claves.forEach((clave, idx) => {
      const conf = CONFIG_JUEGO.DIFICULTADES[clave];
      const x = ANCHO / 2 + (idx - 1) * espaciado;
      const y = 196;

      const caja = this.add
        .rectangle(x, y, 188, 46, 0x161224, 0.92)
        .setStrokeStyle(2.5, conf.colorNum, 0.8)
        .setInteractive({ useHandCursor: true });

      const texto = this.add
        .text(x, y, conf.nombre, {
          fontFamily: "sans-serif",
          fontSize: "18px",
          fontStyle: "bold",
          color: "#ffffff",
        })
        .setOrigin(0.5);

      caja.on("pointerdown", () => {
        SONIDO.uiMover();
        this.seleccionarDificultad(clave);
      });

      this.botonesDificultad[clave] = { caja, texto, conf };
    });

    this.textoDescDificultad = this.add
      .text(ANCHO / 2, 236, "", {
        fontFamily: "sans-serif",
        fontSize: "14px",
        color: "#94a3b8",
      })
      .setOrigin(0.5);

    this.seleccionarDificultad(this.dificultadSeleccionada);
  }

  seleccionarDificultad(clave) {
    this.dificultadSeleccionada = clave;
    Object.keys(this.botonesDificultad).forEach((k) => {
      const item = this.botonesDificultad[k];
      const activo = k === clave;
      item.caja.setFillStyle(activo ? item.conf.colorNum : 0x161224, activo ? 0.28 : 0.9);
      item.caja.setStrokeStyle(activo ? 3.5 : 1.5, item.conf.colorNum, activo ? 1 : 0.45);
      item.caja.setScale(activo ? 1.06 : 1.0);
      item.texto.setColor(activo ? item.conf.colorHex : "#94a3b8");
    });

    const actual = CONFIG_JUEGO.DIFICULTADES[clave];
    this.textoDescDificultad.setText(actual.descripcion);
    this.textoDescDificultad.setColor(actual.colorHex);
  }

  crearPanelControles() {
    const { ANCHO } = CONFIG_JUEGO;
    const panelY = 342;

    const fondo = this.add.rectangle(ANCHO / 2, panelY, 760, 156, 0x0e0b18, 0.88);
    fondo.setStrokeStyle(2, 0x334155, 0.9);

    this.add
      .text(ANCHO / 2, panelY - 58, "CONTROLES DEL JUGADOR", {
        fontFamily: "sans-serif",
        fontSize: "15px",
        fontStyle: "bold",
        color: "#00f0ff",
        letterSpacing: 2,
      })
      .setOrigin(0.5);

    const colIzqX = ANCHO / 2 - 340;
    const colDerX = ANCHO / 2 + 30;
    const estiloTexto = {
      fontFamily: "sans-serif",
      fontSize: "15px",
      color: "#f1f5f9",
      lineSpacing: 8,
    };

    const textoIzq = [
      "🏃  A / D  o  ← / →   :  Moverse",
      "🦘  W  o  ↑            :  Saltar",
      "🛡️  S  o  ↓            :  Bloquear (-80% daño)",
      "⏸️  P  o  ESC          :  Pausa  |  🔊 M : Sonido",
    ].join("\n");

    const textoDer = [
      "👊  Tecla J   :  Puñetazo rápido (6 daño)",
      "🦵  Tecla K   :  Patada larga (10 daño)",
      "☄️  Tecla L   :  Proyectil Especial (15 daño)",
      "⚡  Nota      :  Especial requiere barra al 100%",
    ].join("\n");

    this.add.text(colIzqX, panelY - 34, textoIzq, estiloTexto);
    this.add.text(colDerX, panelY - 34, textoDer, estiloTexto);
  }

  crearBotonInicio() {
    const { ANCHO } = CONFIG_JUEGO;
    const btnY = 476;

    const boton = this.add
      .rectangle(ANCHO / 2, btnY, 390, 54, 0xff2a54, 0.95)
      .setStrokeStyle(3, 0xffffff, 0.9)
      .setInteractive({ useHandCursor: true });

    const etiqueta = this.add
      .text(ANCHO / 2, btnY, "¡PELEAR AHORA!  [ ENTER ]", {
        fontFamily: "sans-serif",
        fontSize: "22px",
        fontStyle: "bold",
        color: "#ffffff",
      })
      .setOrigin(0.5);

    this.tweens.add({
      targets: [boton, etiqueta],
      scaleX: 1.04,
      scaleY: 1.04,
      duration: 650,
      yoyo: true,
      repeat: -1,
    });

    boton.on("pointerdown", () => this.iniciarCombate());
  }

  configurarTecladoMenu() {
    const orden = ["facil", "normal", "dificil"];

    this.input.keyboard.on("keydown-LEFT", () => {
      const idx = orden.indexOf(this.dificultadSeleccionada);
      const nuevo = orden[(idx - 1 + orden.length) % orden.length];
      SONIDO.uiMover();
      this.seleccionarDificultad(nuevo);
    });

    this.input.keyboard.on("keydown-RIGHT", () => {
      const idx = orden.indexOf(this.dificultadSeleccionada);
      const nuevo = orden[(idx + 1) % orden.length];
      SONIDO.uiMover();
      this.seleccionarDificultad(nuevo);
    });

    this.input.keyboard.on("keydown-A", () => {
      const idx = orden.indexOf(this.dificultadSeleccionada);
      const nuevo = orden[(idx - 1 + orden.length) % orden.length];
      SONIDO.uiMover();
      this.seleccionarDificultad(nuevo);
    });

    this.input.keyboard.on("keydown-D", () => {
      const idx = orden.indexOf(this.dificultadSeleccionada);
      const nuevo = orden[(idx + 1) % orden.length];
      SONIDO.uiMover();
      this.seleccionarDificultad(nuevo);
    });

    this.input.keyboard.on("keydown-ENTER", () => this.iniciarCombate());
    this.input.keyboard.on("keydown-SPACE", () => this.iniciarCombate());
    this.input.keyboard.on("keydown-M", () => SONIDO.alternarSilencio());
  }

  iniciarCombate() {
    if (this.enTransicion) return;
    this.enTransicion = true;
    SONIDO.uiConfirmar();

    transicionarAEscena(this, "FightScene", { dificultad: this.dificultadSeleccionada }, 320);
  }
}

// ============================================================================
// 6. ESCENA 2: LA PELEA (FightScene)
// ============================================================================
class FightScene extends Phaser.Scene {
  constructor() {
    super("FightScene");
  }

  init(data) {
    const claveDif = (data && data.dificultad) || "normal";
    this.confDificultad = CONFIG_JUEGO.DIFICULTADES[claveDif] || CONFIG_JUEGO.DIFICULTADES.normal;

    // Estado general de la partida (al mejor de 3 rounds)
    this.roundActual = 1;
    this.roundsJugador = 0;
    this.roundsCPU = 0;

    // Estadísticas acumuladas para ResultScene
    this.estadisticas = {
      golpesJugador: 0,
      golpesCPU: 0,
      danoJugador: 0,
      danoCPU: 0,
      comboMaxJugador: 0,
    };

    // Control de estado del round
    this.estadoRound = "intro"; // 'intro' | 'fighting' | 'round_over'
    this.tiempoRestante = CONFIG_JUEGO.TIEMPO_ROUND;
    this.acumuladorSegundo = 0;
    this.hitStopMs = 0;
    this.camaraLentaMs = 0;
    this.pausado = false;
    this.debugHitboxes = Boolean(CONFIG_JUEGO.DEBUG_HITBOXES);

    // Vida fantasma para el HUD
    this.vidaFantasmaJugador = CONFIG_JUEGO.VIDA_MAX;
    this.vidaFantasmaCPU = CONFIG_JUEGO.VIDA_MAX;

    // Contadores de combo
    this.comboJugador = { conteo: 0, timerMs: 0 };
    this.comboCPU = { conteo: 0, timerMs: 0 };

    // Estado de la IA
    this.iaEstado = "acercarse";
    this.iaTimerDecision = 0;
  }

  create() {
    window.focus();
    this.input.on("pointerdown", () => {
      window.focus();
      SONIDO.iniciar();
    });

    this.events.once("shutdown", () => {
      if (this.input && this.input.keyboard) {
        this.input.keyboard.removeAllListeners();
      }
      if (this.time) {
        this.time.removeAllEvents();
      }
      if (this.tweens) {
        this.tweens.killAll();
      }
      if (this.physics && this.physics.world) {
        this.physics.world.timeScale = 1;
        this.physics.world.resume();
      }
    });

    asegurarTexturasBase(this);
    if (this.cameras.main.fadeEffect) {
      this.cameras.main.fadeEffect.reset();
    }
    this.cameras.main.fadeIn(320, 0, 0, 0);

    // 1. Escenario multicapa con elementos animados
    this.crearEscenario();

    // 2. Plataforma de suelo física estática (borde superior exactamente en SUELO_Y)
    this.sueloFisico = this.add.rectangle(
      CONFIG_JUEGO.ANCHO / 2,
      CONFIG_JUEGO.SUELO_Y + 24,
      CONFIG_JUEGO.ANCHO,
      48,
      0x000000,
      0
    );
    this.physics.add.existing(this.sueloFisico, true);

    // 3. Crear ambos luchadores (reutilizando la clase Fighter)
    this.jugador = new Fighter(this, {
      x: 250,
      y: CONFIG_JUEGO.SUELO_Y,
      nombre: "KAI (TÚ)",
      esCPU: false,
      colorPrimario: 0x00f0ff,
      colorSecundario: 0x0066ff,
      direccionInicial: 1,
    });

    this.cpu = new Fighter(this, {
      x: 710,
      y: CONFIG_JUEGO.SUELO_Y,
      nombre: `VEX (CPU ${this.confDificultad.nombre})`,
      esCPU: true,
      colorPrimario: 0xff2a54,
      colorSecundario: 0xff7b00,
      direccionInicial: -1,
    });

    this.physics.add.collider(this.jugador.physBox, this.sueloFisico);
    this.physics.add.collider(this.cpu.physBox, this.sueloFisico);

    // 4. Emisores de chispas para los impactos (Jugador, CPU y Bloqueo)
    const crearEmisorChispas = (tintes) => {
      const emisor = this.add.particles(0, 0, "tex_particula", {
        speed: { min: 90, max: 340 },
        angle: { min: 0, max: 360 },
        scale: { start: 0.95, end: 0 },
        alpha: { start: 1, end: 0 },
        tint: tintes,
        lifespan: 340,
        blendMode: "ADD",
        emitting: false,
      });
      emisor.setDepth(25);
      return emisor;
    };

    this.emisorImpactoP1 = crearEmisorChispas([0x00f0ff, 0xffffff, 0x38bdf8]);
    this.emisorImpactoP2 = crearEmisorChispas([0xff2a54, 0xff7b00, 0xffffff]);
    this.emisorImpactoBloqueo = crearEmisorChispas([0x38bdf8, 0xffffff]);

    // Lista de proyectiles especiales activos
    this.proyectiles = [];

    // 5. Capa gráfica para el modo de depuración de hitboxes (Tecla H)
    this.graficosDebug = this.add.graphics().setDepth(55);

    // 6. Construir el HUD Arcade, el menú de pausa y controles
    this.crearHUD();
    this.crearMenuPausa();
    this.configurarControles();

    // 7. Iniciar el Round 1
    this.iniciarRound();
  }

  crearEscenario() {
    const { ANCHO, ALTO, SUELO_Y } = CONFIG_JUEGO;
    const g = this.add.graphics();

    // Cielo nocturno / atardecer neón en degradado
    g.fillGradientStyle(0x070410, 0x070410, 0x2c113c, 0x1e0c30, 1);
    g.fillRect(0, 0, ANCHO, SUELO_Y);

    // Gran luna / sol synthwave con halo brillante
    g.fillStyle(0xff2a54, 0.16);
    g.fillCircle(ANCHO / 2, 215, 155);
    g.fillStyle(0xff6d00, 0.28);
    g.fillCircle(ANCHO / 2, 215, 115);
    g.fillStyle(0xffd600, 0.42);
    g.fillCircle(ANCHO / 2, 215, 82);

    // Montañas lejanas en silueta
    g.fillStyle(0x120824, 1);
    g.fillTriangle(0, SUELO_Y, 180, 250, 390, SUELO_Y);
    g.fillTriangle(260, SUELO_Y, 480, 235, 700, SUELO_Y);
    g.fillTriangle(570, SUELO_Y, 790, 245, ANCHO, SUELO_Y);

    // Siluetas de edificios y templos cyber-dojo con ventanas iluminadas
    g.fillStyle(0x0b0616, 1);
    const siluetas = [
      [25, 255, 75, 201],
      [110, 285, 65, 171],
      [185, 240, 82, 216],
      [695, 248, 80, 208],
      [785, 280, 68, 176],
      [862, 235, 75, 221],
    ];
    siluetas.forEach(([x, y, w, h]) => {
      g.fillRect(x, y, w, h);
      g.fillStyle(0x00f0ff, 0.25);
      for (let wy = y + 14; wy < SUELO_Y - 25; wy += 22) {
        g.fillRect(x + 12, wy, 10, 8);
        g.fillRect(x + w - 24, wy, 10, 8);
      }
      g.fillStyle(0x0b0616, 1);
    });

    // Suelo con perspectiva y líneas de neón
    g.fillGradientStyle(0x160c28, 0x160c28, 0x07040d, 0x07040d, 1);
    g.fillRect(0, SUELO_Y, ANCHO, ALTO - SUELO_Y);

    // Líneas de perspectiva en el suelo
    g.lineStyle(1.5, 0x00f0ff, 0.22);
    for (let i = -7; i <= 7; i++) {
      g.lineBetween(ANCHO / 2 + i * 58, SUELO_Y, ANCHO / 2 + i * 145, ALTO);
    }
    g.lineStyle(1, 0xff2a54, 0.22);
    g.lineBetween(0, SUELO_Y + 22, ANCHO, SUELO_Y + 22);
    g.lineBetween(0, SUELO_Y + 50, ANCHO, SUELO_Y + 50);

    // Borde principal de la arena
    g.lineStyle(3.5, 0x00f0ff, 0.75);
    g.lineBetween(0, SUELO_Y, ANCHO, SUELO_Y);

    // Faroles de neón animados a los lados de la arena
    [70, ANCHO - 70].forEach((xFarol) => {
      g.fillStyle(0x1e1b2e, 1);
      g.fillRect(xFarol - 4, SUELO_Y - 135, 8, 135);
      const luz = this.add.circle(xFarol, SUELO_Y - 140, 14, 0xff2a54, 0.85);
      const halo = this.add.circle(xFarol, SUELO_Y - 140, 28, 0xff2a54, 0.22);
      this.tweens.add({
        targets: [luz, halo],
        alpha: "+=0.25",
        scale: 1.15,
        duration: 950,
        yoyo: true,
        repeat: -1,
      });
    });

    // Partículas ambientales flotantes en el escenario
    this.add.particles(0, 0, "tex_particula", {
      x: { min: 20, max: ANCHO - 20 },
      y: { min: 100, max: SUELO_Y },
      speedY: { min: -28, max: -10 },
      scale: { start: 0.38, end: 0 },
      alpha: { start: 0.5, end: 0 },
      tint: [0x00f0ff, 0xff2a54, 0xffd600],
      lifespan: 3000,
      frequency: 140,
      blendMode: "ADD",
    });
  }

  crearHUD() {
    const { ANCHO, ALTO } = CONFIG_JUEGO;
    this.anchoBarraVida = 350;
    this.altoBarraVida = 24;

    // --- Marco y Barras del Jugador (Izquierda) ---
    const p1X = 36;
    const barraY = 38;

    this.add
      .rectangle(p1X, barraY, this.anchoBarraVida + 6, this.altoBarraVida + 6, 0x090612, 0.9)
      .setOrigin(0, 0.5)
      .setStrokeStyle(2, 0x334155, 1)
      .setDepth(30);

    this.barraFantasmaP1 = this.add
      .rectangle(p1X + 3, barraY, this.anchoBarraVida, this.altoBarraVida, 0xffb703, 0.85)
      .setOrigin(0, 0.5)
      .setDepth(31);

    this.barraVidaP1 = this.add
      .rectangle(p1X + 3, barraY, this.anchoBarraVida, this.altoBarraVida, 0x00f0ff, 1)
      .setOrigin(0, 0.5)
      .setDepth(32);

    this.add
      .text(p1X, 16, this.jugador.nombre, {
        fontFamily: "sans-serif",
        fontSize: "15px",
        fontStyle: "bold",
        color: "#00f0ff",
        stroke: "#000000",
        strokeThickness: 4,
      })
      .setOrigin(0, 0.5)
      .setDepth(33);

    // --- Marco y Barras de la CPU (Derecha) ---
    const p2RightX = ANCHO - 36;

    this.add
      .rectangle(p2RightX, barraY, this.anchoBarraVida + 6, this.altoBarraVida + 6, 0x090612, 0.9)
      .setOrigin(1, 0.5)
      .setStrokeStyle(2, 0x334155, 1)
      .setDepth(30);

    this.barraFantasmaP2 = this.add
      .rectangle(p2RightX - 3, barraY, this.anchoBarraVida, this.altoBarraVida, 0xffb703, 0.85)
      .setOrigin(1, 0.5)
      .setDepth(31);

    this.barraVidaP2 = this.add
      .rectangle(p2RightX - 3, barraY, this.anchoBarraVida, this.altoBarraVida, 0xff2a54, 1)
      .setOrigin(1, 0.5)
      .setDepth(32);

    this.add
      .text(p2RightX, 16, this.cpu.nombre, {
        fontFamily: "sans-serif",
        fontSize: "15px",
        fontStyle: "bold",
        color: "#ff2a54",
        stroke: "#000000",
        strokeThickness: 4,
      })
      .setOrigin(1, 0.5)
      .setDepth(33);

    // --- Temporizador Central ---
    this.add
      .rectangle(ANCHO / 2, 40, 86, 56, 0x0e0a1a, 0.95)
      .setStrokeStyle(3, 0xffd600, 0.9)
      .setDepth(32);

    this.textoTimer = this.add
      .text(ANCHO / 2, 40, "60", {
        fontFamily: "Impact, 'Arial Black', sans-serif",
        fontSize: "36px",
        color: "#ffffff",
        stroke: "#000000",
        strokeThickness: 5,
      })
      .setOrigin(0.5)
      .setDepth(33);

    // --- Indicadores de Rounds Ganados ---
    this.iconosRoundP1 = [
      this.add.circle(p1X + 12, 66, 8, 0x1e293b, 1).setStrokeStyle(2, 0xffd600).setDepth(33),
      this.add.circle(p1X + 36, 66, 8, 0x1e293b, 1).setStrokeStyle(2, 0xffd600).setDepth(33),
    ];

    this.iconosRoundP2 = [
      this.add.circle(p2RightX - 12, 66, 8, 0x1e293b, 1).setStrokeStyle(2, 0xffd600).setDepth(33),
      this.add.circle(p2RightX - 36, 66, 8, 0x1e293b, 1).setStrokeStyle(2, 0xffd600).setDepth(33),
    ];

    // --- Barras de Energía Especial Abajo ---
    this.anchoBarraEnergia = 240;
    const energiaY = ALTO - 28;

    this.marcoEnergiaP1 = this.add
      .rectangle(p1X, energiaY, this.anchoBarraEnergia + 4, 16, 0x090612, 0.9)
      .setOrigin(0, 0.5)
      .setStrokeStyle(2, 0x00f0ff, 0.7)
      .setDepth(30);

    this.barraEnergiaP1 = this.add
      .rectangle(p1X + 2, energiaY, this.anchoBarraEnergia, 12, 0x00f0ff, 1)
      .setOrigin(0, 0.5)
      .setScale(0, 1)
      .setDepth(31);

    this.textoEnergiaP1 = this.add
      .text(p1X, energiaY - 17, "ENERGÍA ESPECIAL", {
        fontFamily: "sans-serif",
        fontSize: "12px",
        fontStyle: "bold",
        color: "#94a3b8",
        stroke: "#000000",
        strokeThickness: 3,
      })
      .setOrigin(0, 0.5)
      .setDepth(32);

    this.marcoEnergiaP2 = this.add
      .rectangle(p2RightX, energiaY, this.anchoBarraEnergia + 4, 16, 0x090612, 0.9)
      .setOrigin(1, 0.5)
      .setStrokeStyle(2, 0xff2a54, 0.7)
      .setDepth(30);

    this.barraEnergiaP2 = this.add
      .rectangle(p2RightX - 2, energiaY, this.anchoBarraEnergia, 12, 0xff2a54, 1)
      .setOrigin(1, 0.5)
      .setScale(0, 1)
      .setDepth(31);

    this.textoEnergiaP2 = this.add
      .text(p2RightX, energiaY - 17, "ENERGÍA CPU", {
        fontFamily: "sans-serif",
        fontSize: "12px",
        fontStyle: "bold",
        color: "#94a3b8",
        stroke: "#000000",
        strokeThickness: 3,
      })
      .setOrigin(1, 0.5)
      .setDepth(32);

    // Indicador de sonido, pausa y debug en el centro inferior
    this.textoEstadoAudio = this.add
      .text(ANCHO / 2, energiaY, this.obtenerTextoAudio(), {
        fontFamily: "sans-serif",
        fontSize: "12px",
        color: "#94a3b8",
      })
      .setOrigin(0.5)
      .setDepth(32);

    // --- Textos de Combo ---
    this.textoComboP1 = this.add
      .text(80, 120, "", {
        fontFamily: "Impact, 'Arial Black', sans-serif",
        fontSize: "30px",
        color: "#00f0ff",
        stroke: "#000000",
        strokeThickness: 6,
      })
      .setOrigin(0, 0.5)
      .setDepth(35)
      .setAlpha(0);

    this.textoComboP2 = this.add
      .text(ANCHO - 80, 120, "", {
        fontFamily: "Impact, 'Arial Black', sans-serif",
        fontSize: "30px",
        color: "#ff2a54",
        stroke: "#000000",
        strokeThickness: 6,
      })
      .setOrigin(1, 0.5)
      .setDepth(35)
      .setAlpha(0);

    // --- Anuncio Central ("ROUND 1", "FIGHT!", "K.O.") ---
    this.textoAnuncio = this.add
      .text(ANCHO / 2, ALTO / 2 - 35, "", {
        fontFamily: "Impact, 'Arial Black', sans-serif",
        fontSize: "74px",
        fontStyle: "bold",
        color: "#ffffff",
        stroke: "#ff2a54",
        strokeThickness: 10,
      })
      .setOrigin(0.5)
      .setDepth(45)
      .setAlpha(0);
  }

  obtenerTextoAudio() {
    const estadoSonido = SONIDO.silenciado ? "MUTE 🔇" : "ON 🔊";
    const estadoDebug = this.debugHitboxes ? "ON" : "OFF";
    return `[P/ESC] Pausa  |  [M] Audio: ${estadoSonido}  |  [H] Hitboxes: ${estadoDebug}`;
  }

  crearMenuPausa() {
    const { ANCHO, ALTO } = CONFIG_JUEGO;
    this.contenedorPausa = this.add.container(0, 0).setDepth(60).setVisible(false);

    const velo = this.add.rectangle(ANCHO / 2, ALTO / 2, ANCHO, ALTO, 0x05030a, 0.78);
    const panel = this.add
      .rectangle(ANCHO / 2, ALTO / 2, 420, 250, 0x130e24, 0.96)
      .setStrokeStyle(3, 0x00f0ff, 0.9);

    const titulo = this.add
      .text(ANCHO / 2, ALTO / 2 - 72, "JUEGO EN PAUSA", {
        fontFamily: "Impact, 'Arial Black', sans-serif",
        fontSize: "38px",
        color: "#00f0ff",
        stroke: "#000000",
        strokeThickness: 5,
      })
      .setOrigin(0.5);

    const instrucciones = this.add
      .text(
        ANCHO / 2,
        ALTO / 2 + 12,
        "Pulsa  [ P ]  o  [ ESC ]  para continuar\n\nPulsa  [ ENTER ]  para reiniciar pelea\n\nPulsa  [ Q ]  para volver al menú",
        {
          fontFamily: "sans-serif",
          fontSize: "17px",
          color: "#f8fafc",
          align: "center",
        }
      )
      .setOrigin(0.5);

    this.contenedorPausa.add([velo, panel, titulo, instrucciones]);
  }

  configurarControles() {
    this.cursors = this.input.keyboard.createCursorKeys();
    this.teclas = this.input.keyboard.addKeys({
      W: Phaser.Input.Keyboard.KeyCodes.W,
      A: Phaser.Input.Keyboard.KeyCodes.A,
      S: Phaser.Input.Keyboard.KeyCodes.S,
      D: Phaser.Input.Keyboard.KeyCodes.D,
      J: Phaser.Input.Keyboard.KeyCodes.J,
      K: Phaser.Input.Keyboard.KeyCodes.K,
      L: Phaser.Input.Keyboard.KeyCodes.L,
      P: Phaser.Input.Keyboard.KeyCodes.P,
      ESC: Phaser.Input.Keyboard.KeyCodes.ESC,
      M: Phaser.Input.Keyboard.KeyCodes.M,
      H: Phaser.Input.Keyboard.KeyCodes.H,
      Q: Phaser.Input.Keyboard.KeyCodes.Q,
      ENTER: Phaser.Input.Keyboard.KeyCodes.ENTER,
    });

    this.input.keyboard.on("keydown-P", () => this.alternarPausa());
    this.input.keyboard.on("keydown-ESC", () => this.alternarPausa());

    this.input.keyboard.on("keydown-M", () => {
      SONIDO.alternarSilencio();
      this.textoEstadoAudio.setText(this.obtenerTextoAudio());
    });

    this.input.keyboard.on("keydown-H", () => {
      this.debugHitboxes = !this.debugHitboxes;
      this.textoEstadoAudio.setText(this.obtenerTextoAudio());
      this.dibujarDebugHitboxes();
    });

    this.input.keyboard.on("keydown-Q", () => {
      if (this.pausado) {
        this.hitStopMs = 0;
        this.physics.world.timeScale = 1;
        this.physics.world.resume();
        this.tweens.resumeAll();
        this.scene.start("MenuScene", { dificultad: this.confDificultad.id });
      }
    });

    this.input.keyboard.on("keydown-ENTER", () => {
      if (this.pausado) {
        this.hitStopMs = 0;
        this.physics.world.timeScale = 1;
        this.physics.world.resume();
        this.tweens.resumeAll();
        this.scene.restart({ dificultad: this.confDificultad.id });
      }
    });
  }

  alternarPausa() {
    if (this.estadoRound !== "fighting") return;

    this.pausado = !this.pausado;
    this.contenedorPausa.setVisible(this.pausado);
    SONIDO.uiMover();

    if (this.pausado) {
      this.physics.world.pause();
      this.tweens.pauseAll();
    } else {
      if (this.hitStopMs <= 0) {
        this.physics.world.resume();
      }
      this.tweens.resumeAll();
    }
  }

  limpiarProyectiles() {
    for (let i = this.proyectiles.length - 1; i >= 0; i--) {
      this.proyectiles[i].destruir();
    }
    this.proyectiles = [];
  }

  consumirJustDownJugador() {
    Phaser.Input.Keyboard.JustDown(this.cursors.up);
    Phaser.Input.Keyboard.JustDown(this.teclas.W);
    Phaser.Input.Keyboard.JustDown(this.teclas.J);
    Phaser.Input.Keyboard.JustDown(this.teclas.K);
    Phaser.Input.Keyboard.JustDown(this.teclas.L);
  }

  // ==========================================================================
  // FLUJO DE ROUNDS Y ANUNCIOS
  // ==========================================================================
  iniciarRound() {
    this.estadoRound = "intro";
    this.tiempoRestante = CONFIG_JUEGO.TIEMPO_ROUND;
    this.acumuladorSegundo = 0;
    this.hitStopMs = 0;
    this.camaraLentaMs = 0;
    this.physics.world.timeScale = 1;
    this.physics.world.resume();

    // Limpiar proyectiles y combos previos
    this.limpiarProyectiles();
    this.reiniciarCombo(this.comboJugador, this.textoComboP1);
    this.reiniciarCombo(this.comboCPU, this.textoComboP2);

    // Reiniciar luchadores a sus posiciones iniciales
    this.jugador.reiniciarParaRound(250, 1);
    this.cpu.reiniciarParaRound(710, -1);

    this.vidaFantasmaJugador = CONFIG_JUEGO.VIDA_MAX;
    this.vidaFantasmaCPU = CONFIG_JUEGO.VIDA_MAX;
    this.textoTimer.setText(String(this.tiempoRestante)).setColor("#ffffff");

    // Secuencia animada: "ROUND X" -> "¡FIGHT!"
    this.mostrarTextoAnuncio(`ROUND ${this.roundActual}`, "#00f0ff", 900);
    SONIDO.anuncioRound();

    this.time.delayedCall(1050, () => {
      this.consumirJustDownJugador();
      this.mostrarTextoAnuncio("¡FIGHT!", "#ffd600", 650);
      SONIDO.anuncioFight();
      this.estadoRound = "fighting";
    });
  }

  mostrarTextoAnuncio(texto, colorBorde, duracionMs) {
    this.tweens.killTweensOf(this.textoAnuncio);
    this.textoAnuncio.setText(texto);
    this.textoAnuncio.setStroke(colorBorde, 10);
    this.textoAnuncio.setScale(0.35);
    this.textoAnuncio.setAlpha(1);

    this.tweens.add({
      targets: this.textoAnuncio,
      scaleX: 1,
      scaleY: 1,
      duration: 240,
      ease: "Back.easeOut",
      onComplete: () => {
        this.tweens.add({
          targets: this.textoAnuncio,
          alpha: 0,
          scaleX: 1.25,
          scaleY: 1.25,
          delay: Math.max(150, duracionMs - 380),
          duration: 200,
        });
      },
    });
  }

  finalizarRound(motivo) {
    if (this.estadoRound === "round_over") return;
    this.estadoRound = "round_over";

    // Cancelar hit-stop si estaba activo para no congelar la caída del K.O.
    this.hitStopMs = 0;
    this.physics.world.resume();

    // Destruir proyectiles restantes para que no golpeen ni queden desincronizados
    this.limpiarProyectiles();

    // Cámara lenta breve y dramática
    this.camaraLentaMs = 700;
    this.physics.world.timeScale = 3.2;

    if (motivo === "KO") {
      this.mostrarTextoAnuncio("¡K.O.!", "#ff2a54", 1500);
      this.cameras.main.shake(360, 0.018);
      SONIDO.anuncioKO();
    } else {
      this.mostrarTextoAnuncio("¡TIME!", "#ffd600", 1500);
      SONIDO.anuncioKO();
    }

    // Determinar ganador del round
    if (this.jugador.vida > this.cpu.vida) {
      this.roundsJugador++;
    } else if (this.cpu.vida > this.jugador.vida) {
      this.roundsCPU++;
    } else {
      // En caso de empate exacto de vida al acabar el tiempo, ambos reciben punto
      // a menos que estén en punto de partido, en cuyo caso se juega otro round.
      if (
        this.roundsJugador < CONFIG_JUEGO.ROUNDS_PARA_GANAR - 1 &&
        this.roundsCPU < CONFIG_JUEGO.ROUNDS_PARA_GANAR - 1
      ) {
        this.roundsJugador++;
        this.roundsCPU++;
      }
    }

    this.actualizarIconosRounds();

    this.time.delayedCall(2100, () => {
      this.physics.world.timeScale = 1;

      const finPartida =
        this.roundsJugador >= CONFIG_JUEGO.ROUNDS_PARA_GANAR ||
        this.roundsCPU >= CONFIG_JUEGO.ROUNDS_PARA_GANAR;

      if (finPartida) {
        const ganoJugador = this.roundsJugador > this.roundsCPU;
        transicionarAEscena(
          this,
          "ResultScene",
          {
            victoria: ganoJugador,
            roundsJugador: this.roundsJugador,
            roundsCPU: this.roundsCPU,
            estadisticas: this.estadisticas,
            dificultad: this.confDificultad.id,
          },
          420
        );
      } else {
        // Incrementar siempre el número de round cuando se juega un round nuevo
        this.roundActual++;
        this.iniciarRound();
      }
    });
  }

  actualizarIconosRounds() {
    for (let i = 0; i < 2; i++) {
      if (i < this.roundsJugador) {
        this.iconosRoundP1[i].setFillStyle(0xffd600, 1);
      }
      if (i < this.roundsCPU) {
        this.iconosRoundP2[i].setFillStyle(0xffd600, 1);
      }
    }
  }

  // ==========================================================================
  // ENTRADAS DEL JUGADOR Y MÁQUINA DE ESTADOS DE LA CPU
  // ==========================================================================
  obtenerEntradaJugador() {
    if (this.estadoRound !== "fighting") {
      // Consumir pulsaciones durante la intro o fin de round para que no queden guardadas
      this.consumirJustDownJugador();
      return {
        izq: false,
        der: false,
        saltar: false,
        bloquear: false,
        puno: false,
        patada: false,
        especial: false,
      };
    }

    return {
      izq: this.cursors.left.isDown || this.teclas.A.isDown,
      der: this.cursors.right.isDown || this.teclas.D.isDown,
      saltar:
        Phaser.Input.Keyboard.JustDown(this.cursors.up) ||
        Phaser.Input.Keyboard.JustDown(this.teclas.W),
      bloquear: this.cursors.down.isDown || this.teclas.S.isDown,
      puno: Phaser.Input.Keyboard.JustDown(this.teclas.J),
      patada: Phaser.Input.Keyboard.JustDown(this.teclas.K),
      especial: Phaser.Input.Keyboard.JustDown(this.teclas.L),
    };
  }

  obtenerEntradaCPU(delta) {
    const entrada = {
      izq: false,
      der: false,
      saltar: false,
      bloquear: false,
      puno: false,
      patada: false,
      especial: false,
    };

    if (this.estadoRound !== "fighting" || this.cpu.derrotado || this.jugador.derrotado) {
      return entrada;
    }

    const dx = this.jugador.x - this.cpu.x;
    const distancia = Math.abs(dx);
    const dirHaciaJugador = dx >= 0 ? 1 : -1;
    const dif = this.confDificultad;

    // Verificar si hay un proyectil del jugador acercándose a la CPU
    const proyectilPeligroso = this.proyectiles.some(
      (p) => p.atacante === this.jugador && Math.abs(p.x - this.cpu.x) < 165
    );

    // Reacción defensiva inmediata cuando el jugador ataca de cerca o lanza proyectil
    this.iaTimerDecision -= delta;
    if (this.iaTimerDecision <= 0) {
      // Intervalo con ligera variación aleatoria para no ser predecible
      this.iaTimerDecision = dif.intervaloDecision * Phaser.Math.FloatBetween(0.75, 1.3);

      // 1. Reaccionar a ataque cercano o proyectil
      if ((this.jugador.atacando && distancia < 135) || proyectilPeligroso) {
        if (Math.random() < dif.probBloqueo) {
          this.iaEstado = "bloquear";
        } else if (proyectilPeligroso && Math.random() < 0.45) {
          this.iaEstado = "saltar";
          entrada.saltar = true;
        }
      }
      // 2. Lanzar ataque especial si tiene la barra llena y buena línea de tiro
      else if (
        this.cpu.energia >= CONFIG_JUEGO.ENERGIA_MAX &&
        distancia > 130 &&
        Math.random() < dif.probEspecial
      ) {
        this.iaEstado = "especial";
        entrada.especial = true;
      }
      // 3. A corta distancia: atacar, bloquear o retroceder tácticamente
      else if (distancia <= 105) {
        const r = Math.random();
        if (r < dif.probAtaque) {
          this.iaEstado = "atacar";
          if (distancia < 72 && Math.random() < 0.58) {
            entrada.puno = true;
          } else {
            entrada.patada = true;
          }
        } else if (r < dif.probAtaque + 0.18) {
          this.iaEstado = "retroceder";
        } else {
          this.iaEstado = "bloquear";
        }
      }
      // 4. A media o larga distancia: acercarse, saltar o esperar
      else {
        const r = Math.random();
        if (r < dif.agresividad) {
          this.iaEstado = "acercarse";
          if (distancia > 210 && Math.random() < 0.16) {
            entrada.saltar = true;
          }
        } else if (r < dif.agresividad + 0.14) {
          this.iaEstado = "retroceder";
        } else {
          this.iaEstado = "esperar";
        }
      }
    }

    // Traducir el estado continuo de la máquina de estados a teclas virtuales
    if (this.iaEstado === "acercarse") {
      if (dirHaciaJugador > 0) entrada.der = true;
      else entrada.izq = true;
    } else if (this.iaEstado === "retroceder") {
      if (dirHaciaJugador > 0) entrada.izq = true;
      else entrada.der = true;
    } else if (this.iaEstado === "bloquear") {
      entrada.bloquear = true;
    }

    return entrada;
  }

  // ==========================================================================
  // PROYECTILES, COLISIONES, HIT-STOP Y EFECTOS DE COMBATE
  // ==========================================================================
  dispararProyectilEspecial(atacante) {
    if (this.estadoRound !== "fighting") return;

    SONIDO.lanzarEspecial();

    const dir = atacante.direccion;
    const startX = atacante.x + dir * 48;
    const startY = atacante.y - 72;
    const color = atacante.colorPrimario;
    const anchoP = CONFIG_JUEGO.ATAQUES.special.anchoProyectil;
    const altoP = CONFIG_JUEGO.ATAQUES.special.altoProyectil;

    const contenedor = this.add.container(startX, startY).setDepth(20);
    const g = this.add.graphics();
    // Estela y núcleo del proyectil de plasma
    g.fillStyle(color, 0.35);
    g.fillEllipse(-dir * 12, 0, 54, 28);
    g.fillStyle(color, 0.9);
    g.fillCircle(0, 0, 14);
    g.fillStyle(0xffffff, 1);
    g.fillCircle(dir * 3, 0, 7);
    contenedor.add(g);

    const hitbox = this.add.rectangle(startX, startY, anchoP, altoP, 0xffffff, 0);
    this.physics.add.existing(hitbox);
    hitbox.body.allowGravity = false;
    hitbox.body.setSize(anchoP, altoP);
    hitbox.body.setVelocityX(dir * CONFIG_JUEGO.ATAQUES.special.velocidadProyectil);

    const objProyectil = {
      atacante,
      contenedor,
      hitbox,
      color,
      activo: true,
      get x() {
        return hitbox.x;
      },
      get y() {
        return hitbox.y;
      },
      obtenerHitbox: () => {
        const b = hitbox.body;
        return new Phaser.Geom.Rectangle(b.x, b.y, b.width, b.height);
      },
      destruir: () => {
        if (!objProyectil.activo) return;
        objProyectil.activo = false;
        contenedor.destroy();
        hitbox.destroy();
      },
    };

    this.proyectiles.push(objProyectil);
  }

  verificarImpactos() {
    if (this.estadoRound !== "fighting") return;

    // 1. Ataques cuerpo a cuerpo del Jugador hacia la CPU
    this.procesarChequeoMelee(this.jugador, this.cpu);
    if (this.estadoRound !== "fighting") return;

    // 2. Ataques cuerpo a cuerpo de la CPU hacia el Jugador
    this.procesarChequeoMelee(this.cpu, this.jugador);
    if (this.estadoRound !== "fighting") return;

    // 3. Actualizar y verificar colisión de proyectiles especiales
    for (let i = this.proyectiles.length - 1; i >= 0; i--) {
      if (this.estadoRound !== "fighting") break;

      const p = this.proyectiles[i];
      if (!p.activo) {
        this.proyectiles.splice(i, 1);
        continue;
      }

      p.contenedor.setPosition(p.hitbox.x, p.hitbox.y);

      // Si sale de la pantalla, destruir
      if (p.x < -40 || p.x > CONFIG_JUEGO.ANCHO + 40) {
        p.destruir();
        this.proyectiles.splice(i, 1);
        continue;
      }

      const defensor = p.atacante === this.jugador ? this.cpu : this.jugador;
      if (
        !defensor.derrotado &&
        Phaser.Geom.Intersects.RectangleToRectangle(
          p.obtenerHitbox(),
          defensor.obtenerHurtbox()
        )
      ) {
        const datos = CONFIG_JUEGO.ATAQUES.special;
        const dirImpacto = p.atacante.x <= defensor.x ? 1 : -1;
        const hitX = p.x;
        const hitY = p.y;
        p.destruir();
        this.proyectiles.splice(i, 1);

        this.aplicarImpactoConfirmado(
          p.atacante,
          defensor,
          datos,
          hitX,
          hitY,
          dirImpacto,
          true
        );
      }
    }
  }

  procesarChequeoMelee(atacante, defensor) {
    if (
      this.estadoRound !== "fighting" ||
      !atacante.atacando ||
      atacante.faseAtaque !== "active" ||
      atacante.ataqueYaGolpeo ||
      !atacante.hitboxAtaqueActiva ||
      defensor.derrotado
    ) {
      return;
    }

    const rectAtaque = atacante.obtenerHitboxAtaque();
    const rectDefensor = defensor.obtenerHurtbox();

    if (Phaser.Geom.Intersects.RectangleToRectangle(rectAtaque, rectDefensor)) {
      atacante.ataqueYaGolpeo = true;
      const datos = CONFIG_JUEGO.ATAQUES[atacante.tipoAtaque];
      const dirImpacto = atacante.x <= defensor.x ? 1 : -1;
      const impactoX = (rectAtaque.centerX + rectDefensor.centerX) / 2;
      const impactoY = rectAtaque.centerY;

      this.aplicarImpactoConfirmado(
        atacante,
        defensor,
        datos,
        impactoX,
        impactoY,
        dirImpacto,
        false
      );
    }
  }

  aplicarImpactoConfirmado(atacante, defensor, datosAtaque, x, y, dirImpacto, esEspecial) {
    if (this.estadoRound !== "fighting") return;

    const resultado = defensor.recibirImpacto(
      datosAtaque.dano,
      datosAtaque.knockback,
      datosAtaque.hitstun,
      dirImpacto
    );

    // Si es un golpe normal, llena la barra de energía del atacante
    if (!esEspecial) {
      atacante.agregarEnergia(
        resultado.bloqueado
          ? CONFIG_JUEGO.ENERGIA_AL_BLOQUEAR
          : CONFIG_JUEGO.ENERGIA_AL_GOLPEAR
      );
    }

    // Registrar estadísticas y combos si no fue bloqueado; reiniciar combo del defensor
    const esJugadorAtacante = atacante === this.jugador;
    if (!resultado.bloqueado) {
      if (esJugadorAtacante) {
        this.estadisticas.golpesJugador++;
        this.estadisticas.danoJugador += resultado.danoReal;
        this.registrarGolpeCombo(this.comboJugador, this.textoComboP1, true);
        this.reiniciarCombo(this.comboCPU, this.textoComboP2);
      } else {
        this.estadisticas.golpesCPU++;
        this.estadisticas.danoCPU += resultado.danoReal;
        this.registrarGolpeCombo(this.comboCPU, this.textoComboP2, false);
        this.reiniciarCombo(this.comboJugador, this.textoComboP1);
      }
    }

    // Sonido del impacto
    SONIDO.impacto(resultado.bloqueado ? "block" : datosAtaque.tipo);

    // Sacudida de cámara
    if (resultado.bloqueado) {
      this.cameras.main.shake(70, 0.003);
    } else if (esEspecial) {
      this.cameras.main.shake(210, 0.013);
    } else {
      this.cameras.main.shake(110, datosAtaque.tipo === "kick" ? 0.007 : 0.0045);
    }

    // Chispas y partículas en el punto de impacto
    const colorChispa = resultado.bloqueado ? 0x38bdf8 : atacante.colorPrimario;
    const emisorElegido = resultado.bloqueado
      ? this.emisorImpactoBloqueo
      : esJugadorAtacante
      ? this.emisorImpactoP1
      : this.emisorImpactoP2;
    emisorElegido.explode(esEspecial ? 26 : 15, x, y);

    // Onda expansiva circular en el punto de impacto
    const onda = this.add
      .circle(x, y, 12, colorChispa, 0)
      .setStrokeStyle(3, 0xffffff, 0.9)
      .setDepth(26);
    const escalaFinal = esEspecial ? 4.2 : 2.6;
    this.tweens.add({
      targets: onda,
      scaleX: escalaFinal,
      scaleY: escalaFinal,
      alpha: 0,
      duration: 210,
      onComplete: () => onda.destroy(),
    });

    // Número de daño flotante
    this.mostrarNumeroDano(x, y - 18, resultado.danoReal, resultado.bloqueado, atacante.colorPrimario);

    // Verificar K.O. inmediato (sin activar hit-stop si el round termina)
    if (defensor.vida <= 0 && this.estadoRound === "fighting") {
      this.finalizarRound("KO");
      return;
    }

    // Hit-stop (~60 ms congelando la acción para dar peso al golpe)
    const duracionHitStop = esEspecial
      ? CONFIG_JUEGO.HIT_STOP_ESPECIAL_MS
      : CONFIG_JUEGO.HIT_STOP_MS;
    this.activarHitStop(duracionHitStop);
  }

  activarHitStop(ms) {
    this.hitStopMs = Math.max(this.hitStopMs, ms);
    this.physics.world.pause();
  }

  mostrarNumeroDano(x, y, dano, bloqueado, colorNum) {
    const textoStr = bloqueado ? `-${dano} BLOQUEO` : `-${dano}`;
    const colorHex = bloqueado ? "#7dd3fc" : colorNum === 0x00f0ff ? "#00f0ff" : "#ff6b8b";

    const txt = this.add
      .text(x, y, textoStr, {
        fontFamily: "Impact, 'Arial Black', sans-serif",
        fontSize: bloqueado ? "18px" : "26px",
        color: colorHex,
        stroke: "#000000",
        strokeThickness: 5,
      })
      .setOrigin(0.5)
      .setDepth(40);

    this.tweens.add({
      targets: txt,
      y: y - 48,
      alpha: 0,
      scaleX: 1.18,
      scaleY: 1.18,
      duration: 620,
      ease: "Cubic.easeOut",
      onComplete: () => txt.destroy(),
    });
  }

  registrarGolpeCombo(datosCombo, objetoTexto, esJugador) {
    datosCombo.conteo++;
    datosCombo.timerMs = CONFIG_JUEGO.VENTANA_COMBO_MS;

    if (esJugador && datosCombo.conteo > this.estadisticas.comboMaxJugador) {
      this.estadisticas.comboMaxJugador = datosCombo.conteo;
    }

    if (datosCombo.conteo >= 2) {
      objetoTexto.setText(`¡${datosCombo.conteo} HITS!`);
      objetoTexto.setAlpha(1);
      objetoTexto.setScale(1.35);
      this.tweens.killTweensOf(objetoTexto);
      this.tweens.add({
        targets: objetoTexto,
        scaleX: 1,
        scaleY: 1,
        duration: 180,
        ease: "Back.easeOut",
      });
    }
  }

  reiniciarCombo(datosCombo, objetoTexto) {
    datosCombo.conteo = 0;
    datosCombo.timerMs = 0;
    this.tweens.killTweensOf(objetoTexto);
    objetoTexto.setAlpha(0);
  }

  actualizarCombos(delta) {
    [
      [this.comboJugador, this.textoComboP1],
      [this.comboCPU, this.textoComboP2],
    ].forEach(([combo, texto]) => {
      if (combo.conteo > 0) {
        combo.timerMs -= delta;
        if (combo.timerMs <= 0) {
          this.reiniciarCombo(combo, texto);
        }
      }
    });
  }

  // ==========================================================================
  // MODO DE DEPURACIÓN DE CAJAS DE COLISIÓN (TECLA H)
  // ==========================================================================
  dibujarDebugHitboxes() {
    this.graficosDebug.clear();
    if (!this.debugHitboxes) return;

    // 1. Hurtboxes de ambos luchadores en VERDE
    this.graficosDebug.lineStyle(2, 0x00ff66, 0.95);
    this.graficosDebug.fillStyle(0x00ff66, 0.15);
    [this.jugador, this.cpu].forEach((luchador) => {
      const hurt = luchador.obtenerHurtbox();
      this.graficosDebug.fillRectShape(hurt);
      this.graficosDebug.strokeRectShape(hurt);
    });

    // 2. Hitboxes de ataque activas en ROJO
    this.graficosDebug.lineStyle(2.5, 0xff1744, 1);
    this.graficosDebug.fillStyle(0xff1744, 0.3);
    [this.jugador, this.cpu].forEach((luchador) => {
      if (luchador.atacando && luchador.faseAtaque === "active" && luchador.hitboxAtaqueActiva) {
        const hit = luchador.obtenerHitboxAtaque();
        this.graficosDebug.fillRectShape(hit);
        this.graficosDebug.strokeRectShape(hit);
      }
    });

    // 3. Hitboxes de proyectiles en AMARILLO
    this.graficosDebug.lineStyle(2, 0xffea00, 1);
    this.graficosDebug.fillStyle(0xffea00, 0.28);
    this.proyectiles.forEach((p) => {
      if (p.activo) {
        const rectP = p.obtenerHitbox();
        this.graficosDebug.fillRectShape(rectP);
        this.graficosDebug.strokeRectShape(rectP);
      }
    });
  }

  // ==========================================================================
  // ORIENTACIÓN AUTOMÁTICA Y SEPARACIÓN DE CUERPOS (PUSHBOX)
  // ==========================================================================
  resolverPosicionYDirecciones() {
    // 1. Siempre se miran el uno al otro (excepto si alguno cayó derrotado)
    if (!this.jugador.derrotado && !this.cpu.derrotado) {
      if (this.jugador.x < this.cpu.x) {
        this.jugador.direccion = 1;
        this.cpu.direccion = -1;
      } else {
        this.jugador.direccion = -1;
        this.cpu.direccion = 1;
      }
    }

    // 2. Evitar que los luchadores se atraviesen (colisión horizontal de cuerpos)
    const diffY = Math.abs(this.jugador.y - this.cpu.y);
    const diffX = this.jugador.x - this.cpu.x;
    const distH = Math.abs(diffX);

    if (diffY < 92 && distH < CONFIG_JUEGO.SEPARACION_MIN) {
      const empuje = (CONFIG_JUEGO.SEPARACION_MIN - distH) / 2;
      if (diffX < 0 || (diffX === 0 && this.jugador.direccion === 1)) {
        this.jugador.x -= empuje;
        this.cpu.x += empuje;
      } else {
        this.jugador.x += empuje;
        this.cpu.x -= empuje;
      }
    }

    // 3. Mantener siempre dentro de los límites de la arena
    this.jugador.x = Phaser.Math.Clamp(
      this.jugador.x,
      CONFIG_JUEGO.LIMITE_IZQ,
      CONFIG_JUEGO.LIMITE_DER
    );
    this.cpu.x = Phaser.Math.Clamp(
      this.cpu.x,
      CONFIG_JUEGO.LIMITE_IZQ,
      CONFIG_JUEGO.LIMITE_DER
    );
  }

  // ==========================================================================
  // ACTUALIZACIÓN DEL HUD (VIDA REAL, VIDA FANTASMA Y ENERGÍA)
  // ==========================================================================
  actualizarHUD(delta) {
    const dtSeg = delta / 1000;

    // Suavizado de la "vida fantasma" detrás de la vida real
    if (this.vidaFantasmaJugador > this.jugador.vida) {
      this.vidaFantasmaJugador = Math.max(
        this.jugador.vida,
        this.vidaFantasmaJugador - CONFIG_JUEGO.VELOCIDAD_VIDA_FANTASMA * dtSeg
      );
    } else {
      this.vidaFantasmaJugador = this.jugador.vida;
    }

    if (this.vidaFantasmaCPU > this.cpu.vida) {
      this.vidaFantasmaCPU = Math.max(
        this.cpu.vida,
        this.vidaFantasmaCPU - CONFIG_JUEGO.VELOCIDAD_VIDA_FANTASMA * dtSeg
      );
    } else {
      this.vidaFantasmaCPU = this.cpu.vida;
    }

    // Actualizar escala horizontal de barras de vida (respeta origin 0 y origin 1)
    this.barraVidaP1.scaleX = Phaser.Math.Clamp(
      this.jugador.vida / CONFIG_JUEGO.VIDA_MAX,
      0,
      1
    );
    this.barraFantasmaP1.scaleX = Phaser.Math.Clamp(
      this.vidaFantasmaJugador / CONFIG_JUEGO.VIDA_MAX,
      0,
      1
    );

    this.barraVidaP2.scaleX = Phaser.Math.Clamp(
      this.cpu.vida / CONFIG_JUEGO.VIDA_MAX,
      0,
      1
    );
    this.barraFantasmaP2.scaleX = Phaser.Math.Clamp(
      this.vidaFantasmaCPU / CONFIG_JUEGO.VIDA_MAX,
      0,
      1
    );

    // Actualizar barras de energía y brillo cuando están al 100%
    this.barraEnergiaP1.scaleX = Phaser.Math.Clamp(
      this.jugador.energia / CONFIG_JUEGO.ENERGIA_MAX,
      0,
      1
    );
    this.barraEnergiaP2.scaleX = Phaser.Math.Clamp(
      this.cpu.energia / CONFIG_JUEGO.ENERGIA_MAX,
      0,
      1
    );

    const pulso = 0.65 + Math.sin(this.time.now * 0.015) * 0.35;
    if (this.jugador.energia >= CONFIG_JUEGO.ENERGIA_MAX) {
      this.barraEnergiaP1.setFillStyle(0xffd600, pulso);
      this.marcoEnergiaP1.setStrokeStyle(2.5, 0xffd600, 1);
      this.textoEnergiaP1.setText("⚡ ¡ESPECIAL LISTO! PULSA [L]").setColor("#ffd600");
    } else {
      this.barraEnergiaP1.setFillStyle(0x00f0ff, 1);
      this.marcoEnergiaP1.setStrokeStyle(2, 0x00f0ff, 0.7);
      this.textoEnergiaP1
        .setText(`ENERGÍA ESPECIAL (${Math.floor(this.jugador.energia)}%)`)
        .setColor("#94a3b8");
    }

    if (this.cpu.energia >= CONFIG_JUEGO.ENERGIA_MAX) {
      this.barraEnergiaP2.setFillStyle(0xffd600, pulso);
      this.textoEnergiaP2.setText("⚡ ¡ESPECIAL CPU LISTO!").setColor("#ffd600");
    } else {
      this.barraEnergiaP2.setFillStyle(0xff2a54, 1);
      this.textoEnergiaP2
        .setText(`ENERGÍA CPU (${Math.floor(this.cpu.energia)}%)`)
        .setColor("#94a3b8");
    }
  }

  // ==========================================================================
  // BUCLE PRINCIPAL (update con delta time)
  // ==========================================================================
  update(time, delta) {
    if (this.pausado) return;

    // 1. Gestionar Hit-Stop (congela la acción ~60 ms en cada impacto)
    if (this.hitStopMs > 0) {
      this.hitStopMs -= delta;
      if (this.hitStopMs <= 0) {
        this.hitStopMs = 0;
        if (!this.pausado) {
          this.physics.world.resume();
        }
      }
      this.actualizarHUD(delta);
      this.dibujarDebugHitboxes();
      return;
    }

    // 2. Factor de cámara lenta al finalizar el round
    let deltaEfectivo = delta;
    if (this.camaraLentaMs > 0) {
      this.camaraLentaMs -= delta;
      deltaEfectivo = delta * 0.3;
    }

    // 3. Actualizar entradas y estado de ambos luchadores
    const entradaJugador = this.obtenerEntradaJugador();
    const entradaCPU = this.obtenerEntradaCPU(deltaEfectivo);

    this.jugador.actualizar(deltaEfectivo, entradaJugador, 1.0);
    this.cpu.actualizar(deltaEfectivo, entradaCPU, this.confDificultad.factorVelocidad);

    // 4. Orientación cara a cara y empuje de cuerpos
    this.resolverPosicionYDirecciones();

    // 5. Detectar impactos de ataques y proyectiles
    if (this.estadoRound === "fighting") {
      this.verificarImpactos();
      this.actualizarCombos(deltaEfectivo);

      // 6. Temporizador del round (60 segundos)
      this.acumuladorSegundo += delta;
      if (this.acumuladorSegundo >= 1000) {
        this.acumuladorSegundo -= 1000;
        this.tiempoRestante = Math.max(0, this.tiempoRestante - 1);
        this.textoTimer.setText(String(this.tiempoRestante));

        if (this.tiempoRestante <= 10) {
          this.textoTimer.setColor("#ff2a54");
        }

        if (this.tiempoRestante <= 0) {
          this.finalizarRound("TIME");
        }
      }
    }

    // 7. Refrescar HUD y capa de depuración de hitboxes
    this.actualizarHUD(delta);
    this.dibujarDebugHitboxes();
  }
}

// ============================================================================
// 7. ESCENA 3: RESULTADOS DE LA PARTIDA (ResultScene)
// ============================================================================
class ResultScene extends Phaser.Scene {
  constructor() {
    super("ResultScene");
  }

  init(data) {
    this.victoria = Boolean(data && data.victoria);
    this.roundsJugador = (data && data.roundsJugador) || 0;
    this.roundsCPU = (data && data.roundsCPU) || 0;
    this.dificultad = (data && data.dificultad) || "normal";
    this.estadisticas = (data && data.estadisticas) || {
      golpesJugador: 0,
      golpesCPU: 0,
      danoJugador: 0,
      danoCPU: 0,
      comboMaxJugador: 0,
    };
    this.enTransicion = false;
  }

  create() {
    window.focus();
    this.input.on("pointerdown", () => {
      window.focus();
      SONIDO.iniciar();
    });

    this.events.once("shutdown", () => {
      if (this.input && this.input.keyboard) {
        this.input.keyboard.removeAllListeners();
      }
      if (this.time) {
        this.time.removeAllEvents();
      }
      if (this.tweens) {
        this.tweens.killAll();
      }
    });

    asegurarTexturasBase(this);
    if (this.cameras.main.fadeEffect) {
      this.cameras.main.fadeEffect.reset();
    }
    this.cameras.main.fadeIn(350, 0, 0, 0);

    const { ANCHO, ALTO } = CONFIG_JUEGO;
    const colorTema = this.victoria ? 0x00f0ff : 0xff2a54;
    const colorHex = this.victoria ? "#00f0ff" : "#ff2a54";

    // Fondo degradado
    const g = this.add.graphics();
    g.fillGradientStyle(0x090514, 0x090514, 0x1f0d2e, 0x0f081d, 1);
    g.fillRect(0, 0, ANCHO, ALTO);

    // Partículas de celebración / ambiente
    this.add.particles(0, 0, "tex_particula", {
      x: { min: 40, max: ANCHO - 40 },
      y: { min: 40, max: ALTO - 40 },
      speedY: { min: -50, max: -15 },
      scale: { start: 0.65, end: 0 },
      alpha: { start: 0.75, end: 0 },
      tint: [colorTema, 0xffd600],
      lifespan: 2600,
      frequency: 90,
      blendMode: "ADD",
    });

    // Sonido de resultado
    if (this.victoria) {
      SONIDO.uiConfirmar();
    } else {
      SONIDO.anuncioKO();
    }

    // Título principal: ¡VICTORIA! o DERROTA
    const textoTitulo = this.victoria ? "¡VICTORIA!" : "DERROTA";
    const titulo = this.add
      .text(ANCHO / 2, 82, textoTitulo, {
        fontFamily: "Impact, 'Arial Black', sans-serif",
        fontSize: "72px",
        fontStyle: "bold",
        color: "#ffffff",
        stroke: colorHex,
        strokeThickness: 10,
      })
      .setOrigin(0.5);

    this.tweens.add({
      targets: titulo,
      scaleX: 1.05,
      scaleY: 1.05,
      duration: 900,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });

    const sub = this.victoria
      ? "¡Has dominado la Cyber Arena!"
      : "VEX (CPU) ha ganado el combate. ¡Inténtalo de nuevo!";
    this.add
      .text(ANCHO / 2, 138, sub, {
        fontFamily: "sans-serif",
        fontSize: "17px",
        color: "#cbd5e1",
      })
      .setOrigin(0.5);

    // Panel de estadísticas
    const panelY = 278;
    this.add
      .rectangle(ANCHO / 2, panelY, 540, 210, 0x110c1f, 0.92)
      .setStrokeStyle(2.5, colorTema, 0.85);

    this.add
      .text(ANCHO / 2, panelY - 78, "ESTADÍSTICAS DEL COMBATE", {
        fontFamily: "sans-serif",
        fontSize: "16px",
        fontStyle: "bold",
        color: "#ffd600",
        letterSpacing: 2,
      })
      .setOrigin(0.5);

    const nombreDif =
      (CONFIG_JUEGO.DIFICULTADES[this.dificultad] &&
        CONFIG_JUEGO.DIFICULTADES[this.dificultad].nombre) ||
      "NORMAL";

    const filas = [
      ["Rounds Ganados (Tú vs CPU)", `${this.roundsJugador}  -  ${this.roundsCPU}`],
      ["Golpes Acertados por Ti", `${this.estadisticas.golpesJugador}`],
      ["Golpes Acertados por la CPU", `${this.estadisticas.golpesCPU}`],
      ["Daño Total Infligido", `${this.estadisticas.danoJugador} pts`],
      ["Combo Máximo Alcanzado", `${this.estadisticas.comboMaxJugador} Hits`],
      ["Dificultad Jugada", nombreDif],
    ];

    filas.forEach(([etiqueta, valor], idx) => {
      const y = panelY - 42 + idx * 26;
      this.add
        .text(ANCHO / 2 - 230, y, etiqueta, {
          fontFamily: "sans-serif",
          fontSize: "15px",
          color: "#cbd5e1",
        })
        .setOrigin(0, 0.5);

      this.add
        .text(ANCHO / 2 + 230, y, valor, {
          fontFamily: "sans-serif",
          fontSize: "15px",
          fontStyle: "bold",
          color: colorHex,
        })
        .setOrigin(1, 0.5);
    });

    // Botones de acción: Reintentar (ENTER) y Menú (ESC)
    const btnY = 446;

    const btnReintentar = this.add
      .rectangle(ANCHO / 2 - 145, btnY, 255, 50, 0x00f0ff, 0.92)
      .setStrokeStyle(2.5, 0xffffff, 0.9)
      .setInteractive({ useHandCursor: true });

    this.add
      .text(ANCHO / 2 - 145, btnY, "REINTENTAR [ENTER]", {
        fontFamily: "sans-serif",
        fontSize: "17px",
        fontStyle: "bold",
        color: "#090612",
      })
      .setOrigin(0.5);

    const btnMenu = this.add
      .rectangle(ANCHO / 2 + 145, btnY, 255, 50, 0x1e1b2e, 0.95)
      .setStrokeStyle(2.5, 0xff2a54, 0.9)
      .setInteractive({ useHandCursor: true });

    this.add
      .text(ANCHO / 2 + 145, btnY, "VOLVER AL MENÚ [ESC]", {
        fontFamily: "sans-serif",
        fontSize: "17px",
        fontStyle: "bold",
        color: "#ffffff",
      })
      .setOrigin(0.5);

    btnReintentar.on("pointerdown", () => this.reintentar());
    btnMenu.on("pointerdown", () => this.irAlMenu());

    this.input.keyboard.on("keydown-ENTER", () => this.reintentar());
    this.input.keyboard.on("keydown-SPACE", () => this.reintentar());
    this.input.keyboard.on("keydown-ESC", () => this.irAlMenu());
    this.input.keyboard.on("keydown-M", () => SONIDO.alternarSilencio());
  }

  reintentar() {
    if (this.enTransicion) return;
    this.enTransicion = true;
    SONIDO.uiConfirmar();

    transicionarAEscena(this, "FightScene", { dificultad: this.dificultad }, 300);
  }

  irAlMenu() {
    if (this.enTransicion) return;
    this.enTransicion = true;
    SONIDO.uiMover();

    transicionarAEscena(this, "MenuScene", { dificultad: this.dificultad }, 300);
  }
}

// ============================================================================
// 8. CONFIGURACIÓN E INICIALIZACIÓN DE PHASER 4.0
// ============================================================================
const configPhaser = {
  type: Phaser.AUTO,
  width: CONFIG_JUEGO.ANCHO,
  height: CONFIG_JUEGO.ALTO,
  backgroundColor: "#090514",
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: CONFIG_JUEGO.GRAVEDAD },
      debug: false,
    },
  },
  scene: [MenuScene, FightScene, ResultScene],
};

const game = new Phaser.Game(configPhaser);
