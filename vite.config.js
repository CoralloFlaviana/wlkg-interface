import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/graphrag': {
        target: 'http://0.0.0.0:8000/query/',
        changeOrigin: true,              // Cambia l'origine della richiesta
        secure: false,                   // Impostazione per HTTP (se non usi HTTPS)
      },
      '/rel':{
        target: 'http://0.0.0.0:8000/query/',
        changeOrigin: true,
        secure: false,
      },
      '/entityFind':{
        target: 'http://0.0.0.0:8000/query/',
        changeOrigin: true,
        secure: false,
      }
    },
  },
});
