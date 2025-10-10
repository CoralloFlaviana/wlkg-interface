import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ command, mode }) => {
  const isDev = command === 'serve';

  return {
    plugins: [react()],

    server: {
      host: '0.0.0.0',
      port: 5173,
      proxy: isDev
          ? {
            '/graphrag': {
              target: 'http://localhost:8000',
              changeOrigin: true,
              secure: false,
              rewrite: (path) => path.replace(/^\/graphrag/, '/query/graphrag'),
            },
            '/rel': {
              target: 'http://localhost:8000',
              changeOrigin: true,
              secure: false,
              rewrite: (path) => path.replace(/^\/rel/, '/query/rel'),
            },
            '/entityFind': {
              target: 'http://localhost:8000',
              changeOrigin: true,
              secure: false,
              rewrite: (path) => path.replace(/^\/entityFind/, '/query/entityFind'),
            },
            '/api': {
              target: 'http://localhost:8000',
              changeOrigin: true,
              secure: false,
            },
          }
          : undefined,
    },

    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      sourcemap: false,
    },

    define: {
      __API_URL__: JSON.stringify(
          isDev ? '' : process.env.VITE_API_URL || 'http://localhost:8000'
      ),
    },
  };
});
