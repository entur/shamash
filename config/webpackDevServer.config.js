'use strict';

const fs = require('fs');
const errorOverlayMiddleware = require('react-dev-utils/errorOverlayMiddleware');
const evalSourceMapMiddleware = require('react-dev-utils/evalSourceMapMiddleware');
const noopServiceWorkerMiddleware = require('react-dev-utils/noopServiceWorkerMiddleware');
const ignoredFiles = require('react-dev-utils/ignoredFiles');
const redirectServedPath = require('react-dev-utils/redirectServedPathMiddleware');
const paths = require('./paths');
const getHttpsConfig = require('./getHttpsConfig');

const host = process.env.HOST || '0.0.0.0';
const sockHost = process.env.WDS_SOCKET_HOST;
const sockPath = process.env.WDS_SOCKET_PATH; // default: '/sockjs-node'
const sockPort = process.env.WDS_SOCKET_PORT;

module.exports = function (proxy, allowedHost) {
  return {
    // Enable gzip compression of generated files.
    compress: true,
    // Static file serving configuration
    static: {
      directory: paths.appPublic,
      publicPath: paths.publicUrlOrPath,
      watch: true,
    },
    // Enable hot reloading
    hot: true,
    // WebSocket configuration
    webSocketServer: 'ws',
    client: {
      webSocketURL: {
        hostname: sockHost,
        pathname: sockPath,
        port: sockPort,
      },
      overlay: false,
    },
    // Public path configuration
    devMiddleware: {
      publicPath: paths.publicUrlOrPath.slice(0, -1),
    },
    // Watch options
    watchFiles: {
      paths: [paths.appSrc],
      options: {
        ignored: ignoredFiles(paths.appSrc),
      },
    },
    // HTTPS configuration
    server: getHttpsConfig() ? 'https' : 'http',
    // Host configuration
    host,
    allowedHosts: allowedHost ? [allowedHost] : 'auto',
    // History API fallback
    historyApiFallback: {
      disableDotRule: true,
      index: paths.publicUrlOrPath,
    },
    // Proxy configuration
    proxy,
    // Setup middlewares
    setupMiddlewares: (middlewares, devServer) => {
      // Keep `evalSourceMapMiddleware` and `errorOverlayMiddleware`
      middlewares.unshift({
        name: 'eval-source-map-middleware',
        middleware: evalSourceMapMiddleware(devServer),
      });

      middlewares.unshift({
        name: 'error-overlay-middleware',
        middleware: errorOverlayMiddleware(),
      });

      if (fs.existsSync(paths.proxySetup)) {
        require(paths.proxySetup)(devServer.app);
      }

      middlewares.push({
        name: 'redirect-served-path-middleware',
        middleware: redirectServedPath(paths.publicUrlOrPath),
      });

      middlewares.push({
        name: 'noop-service-worker-middleware',
        middleware: noopServiceWorkerMiddleware(paths.publicUrlOrPath),
      });

      return middlewares;
    },
  };
};
