import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Sincroniza ../my-first-game/game.js hacia public/my-first-game/game.js
 * y hacia dist/my-first-game/game.js.
 * La página HTML en /rocha-jahir-jueg-gr3/my-first-game/ es generada de forma nativa
 * por Astro desde src/pages/my-first-game/index.astro tanto en `npm run dev` como en `npm run build`.
 */
function syncGameAssets(targetDir, cleanDuplicatePublicIndex = false) {
  const sourceDir = path.resolve(__dirname, '../my-first-game');
  if (!fs.existsSync(sourceDir)) return;

  fs.mkdirSync(targetDir, { recursive: true });

  // Solo en public/ eliminamos index.html para evitar colisión de ruta con src/pages/my-first-game/index.astro
  if (cleanDuplicatePublicIndex) {
    const publicIndex = path.join(targetDir, 'index.html');
    if (fs.existsSync(publicIndex)) {
      try {
        fs.unlinkSync(publicIndex);
      } catch {
        // Ignorar si no se puede eliminar
      }
    }
  }

  const entries = fs.readdirSync(sourceDir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.name === 'index.html') continue;
    const srcPath = path.join(sourceDir, entry.name);
    const destPath = path.join(targetDir, entry.name);
    if (entry.isDirectory()) {
      fs.cpSync(srcPath, destPath, { recursive: true, force: true });
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

function neonKombatGameSyncIntegration() {
  return {
    name: 'neon-kombat-game-sync',
    hooks: {
      'astro:config:setup': () => {
        const publicGameDir = path.resolve(__dirname, './public/my-first-game');
        syncGameAssets(publicGameDir, true);
      },
      'astro:server:setup': ({ server }) => {
        server.middlewares.use((req, res, next) => {
          if (!req.url) return next();
          if (req.url === '/my-first-game' || req.url === '/my-first-game/') {
            res.writeHead(302, { Location: '/rocha-jahir-jueg-gr3/my-first-game/' });
            res.end();
            return;
          }
          if (req.url.startsWith('/rocha-jahir-jueg-gr3/my-first-game/index.html')) {
            res.writeHead(302, { Location: '/rocha-jahir-jueg-gr3/my-first-game/' });
            res.end();
            return;
          }
          next();
        });
      },
      'astro:build:done': ({ dir }) => {
        const distPath = fileURLToPath(dir);
        const distGameDir = path.join(distPath, 'my-first-game');
        syncGameAssets(distGameDir, false);
      },
    },
  };
}

export default defineConfig({
  site: 'https://2026b-sof-jueg-gr3.github.io',
  base: '/rocha-jahir-jueg-gr3',
  trailingSlash: 'ignore',
  vite: {
    plugins: [tailwindcss()],
  },
  integrations: [neonKombatGameSyncIntegration()],
});
