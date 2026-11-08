# ⚡ NEON KOMBAT: Cyber Arena — Landing Page Comercial (Astro)

Escaparate digital (**Fase 3**) desarrollado con **Astro** para el videojuego **NEON KOMBAT: Cyber Arena (ISWD823)**.

## 🌐 Rutas Configuradas (`astro.config.mjs`)

- **Site:** `https://2026b-sof-jueg-gr3.github.io`
- **Base:** `/rocha-jahir-jueg-gr3`
- **URL de la Landing Page:** `https://2026b-sof-jueg-gr3.github.io/rocha-jahir-jueg-gr3/`
- **URL Directa al Juego:** `https://2026b-sof-jueg-gr3.github.io/rocha-jahir-jueg-gr3/my-first-game/`

> **Sincronización Automática del Juego:**  
> La integración `neonKombatGameSyncIntegration()` en [`astro.config.mjs`](./astro.config.mjs) copia automáticamente el contenido de `../my-first-game/` hacia `public/my-first-game/` (al iniciar `npm run dev` o `npm run build`) y hacia `dist/my-first-game/` (al finalizar `npm run build`), garantizando que el enlace al canvas nunca se rompa.

## 🚀 Comandos de Desarrollo y Compilación

Dentro de la carpeta `landing-page/`:

```bash
# 1. Instalar dependencias (primera vez)
npm install

# 2. Iniciar servidor de desarrollo local
npm run dev
# Disponible en: http://localhost:4321/rocha-jahir-jueg-gr3/

# 3. Compilar para producción (GitHub Pages)
npm run build
# Salida estática en: ./dist/ (incluyendo ./dist/my-first-game/)
```

