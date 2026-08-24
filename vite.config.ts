import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': '/src',
    },
  },
  server: {
    proxy: {
      // Proxy BMKG untuk pengembangan lokal. Di produksi, rute yang sama
      // dilayani oleh Vercel Serverless Function di `api/bmkg.ts`.
      '/api/bmkg': {
        target: 'https://api.bmkg.go.id',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/bmkg/, '/publik/prakiraan-cuaca'),
      },
    },
  },
});
