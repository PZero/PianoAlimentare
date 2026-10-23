import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// Colore del tema (barra del browser): --colore-primario del chiaro (docs/DESIGN.md)
const COLORE_TEMA = '#FBF8F3';

export default defineConfig({
  base: '/PianoAlimentare/',
  // Il file .env sta nella radice del repository, non in app/
  envDir: '..',
  // Solo sviluppo: la modalità demo legge docs/esempi/ (fuori da app/)
  server: { fs: { allow: ['..'] } },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'apple-touch-icon.png'],
      manifest: {
        name: 'PianoAlimentare',
        short_name: 'PianoAlimentare',
        description: 'Segui il piano alimentare del tuo nutrizionista, un pasto alla volta.',
        lang: 'it',
        display: 'standalone',
        start_url: '/PianoAlimentare/',
        scope: '/PianoAlimentare/',
        theme_color: COLORE_TEMA,
        background_color: '#FBF8F3',
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        // Solo precache dei file dell'app. Nessuna cache runtime di Firebase/Google:
        // l'autenticazione e Firestore passano sempre dalla rete (Firestore ha la sua cache offline).
        globPatterns: ['**/*.{js,css,html,svg,png,webmanifest,woff2}'],
        navigateFallback: '/PianoAlimentare/index.html',
        navigateFallbackDenylist: [/^\/__\//, /^\/PianoAlimentare\/__\//],
        cleanupOutdatedCaches: true,
      },
    }),
  ],
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
});
