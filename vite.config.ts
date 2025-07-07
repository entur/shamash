/// <reference types="vitest" />
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, process.cwd(), '');

  // Determine base path based on environment
  const base = mode === 'production' ? '/graphql-explorer/' : '/';

  return {
    plugins: [react()],

    // Set base path for deployment
    base,

    // Define environment variables
    define: {
      // Make process.env available in browser
      'process.env': JSON.stringify({
        NODE_ENV: mode,
        PUBLIC_URL: env.PUBLIC_URL || base.slice(0, -1), // Remove trailing slash
        // Include all REACT_APP_ prefixed variables
        ...Object.keys(env).reduce((prev, key) => {
          if (key.startsWith('REACT_APP_')) {
            prev[key] = env[key];
          }
          return prev;
        }, {}),
      }),
      global: 'globalThis',
    },

    // Define path aliases similar to webpack resolve
    resolve: {
      alias: {
        '@': resolve(__dirname, './src'),
        // Node.js polyfills for browser compatibility
        buffer: 'buffer',
        crypto: 'crypto-browserify',
        stream: 'stream-browserify',
        url: 'url',
        util: 'util',
        path: 'path-browserify',
        os: 'os-browserify/browser',
        https: 'https-browserify',
        http: 'stream-http',
        querystring: 'querystring-es3',
        process: 'process/browser',
      },
    },

    // Development server configuration
    server: {
      port: 3000,
      open: true,
      host: true,
    },

    // Build configuration
    build: {
      outDir: mode === 'production' ? 'build/graphql-explorer' : 'build',
      sourcemap: true,
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom'],
            apollo: ['@apollo/client'],
            leaflet: ['leaflet', 'react-leaflet'],
            graphql: ['graphql', 'graphql-ws'],
          },
        },
      },
    },

    // CSS configuration
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: `@import "src/styles/variables.scss";`,
        },
      },
    },

    // Test configuration for Vitest
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: ['./src/setupTests.js'],
      css: true,
    },

    // Optimizations
    optimizeDeps: {
      include: [
        'react',
        'react-dom',
        '@apollo/client',
        'graphql',
        'leaflet',
        'react-leaflet',
        'buffer',
        'process',
      ],
    },
  };
});
