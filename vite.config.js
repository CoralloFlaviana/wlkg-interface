import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ command, mode }) => {
  const isDev = command === 'serve';

  return {
    plugins: [react()],

    server: {
      host: '0.0.0.0',
      port: 5173,

      // Proxy solo in development
      proxy: isDev ? {
        '/graphrag': {
          target: 'http://localhost:8000/query',
          changeOrigin: true,
          secure: false,
        },
        '/rel': {
          target: 'http://localhost:8000/query',
          changeOrigin: true,
          secure: false,
        },
        '/entityFind': {
          target: 'http://localhost:8000/query',
          changeOrigin: true,
          secure: false,
        },
        '/api': {
          target: 'http://localhost:8000',
          changeOrigin: true,
          secure: false,
        }
      } : undefined
    },

    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      sourcemap: false,
    },

    define: {
      __API_URL__: JSON.stringify(
          isDev ? '' : (process.env.VITE_API_URL || 'http://localhost:8000')
      )
    }
  };
});