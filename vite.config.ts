/// <reference types="vitest" />
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react()],

    // Define environment variables
    define: {
      // Make process.env available in browser
      'process.env': JSON.stringify({
        NODE_ENV: mode,
        PUBLIC_URL: process.env.PUBLIC_URL ?? env.PUBLIC_URL ?? '',
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
      outDir: 'build',
      sourcemap: true,
      rolldownOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules/react-dom') || id.includes('node_modules/react/')) {
              return 'vendor';
            }
            if (id.includes('node_modules/@apollo/client')) {
              return 'apollo';
            }
            if (id.includes('node_modules/maplibre-gl/') || id.includes('node_modules/react-map-gl/')) {
              return 'maplibre';
            }
            if (id.includes('node_modules/graphql/') || id.includes('node_modules/graphql-ws/')) {
              return 'graphql';
            }
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
      setupFiles: ['./src/setupTests.ts'],
      css: true,
    },

    // Optimizations
    optimizeDeps: {
      include: [
        'react',
        'react-dom',
        '@apollo/client',
        'graphql',
        'maplibre-gl',
        'react-map-gl/maplibre',
        'buffer',
        'process',
      ],
    },
  };
});
