import { fileURLToPath } from 'node:url';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { routes } from './api/_lib/handlers.js';
import { toNode } from './api/_lib/http.js';

/**
 * Serves the same /api/* handlers that run on Vercel, inside `npm run dev`
 * and `npm run preview`. Server-side keys (FOOTBALL_DATA_API_KEY, …) are read
 * from .env here and never reach the browser bundle — only VITE_* vars do.
 */
function liveApi(env) {
  const mount = (server) => {
    server.middlewares.use('/api', (req, res, next) => {
      const name = (req.url || '').split('?')[0].replace(/^\/+|\/+$/g, '');
      const handler = routes[name];
      if (!handler) return next();
      return toNode(handler, env)(req, res);
    });
  };
  return { name: 'himalayahub-live-api', configureServer: mount, configurePreviewServer: mount };
}

export default defineConfig(({ mode }) => {
  const env = { ...process.env, ...loadEnv(mode, process.cwd(), '') };
  return {
    plugins: [react(), liveApi(env)],
    // One source of truth for roles, WhatsApp formatting etc. (packages/shared)
    resolve: { alias: { '@shared': fileURLToPath(new URL('../../packages/shared/src', import.meta.url)) } },
    server: {
      port: 5173, open: true,
      // The HimalayaHub API (apps/api). Live-data routes above are still served by the plugin;
      // everything it doesn't handle under /api goes to the API server, same-origin (cookies just work).
      proxy: { '/api': { target: env.API_PROXY_TARGET || 'http://localhost:4000', changeOrigin: false } },
    },
  };
});
