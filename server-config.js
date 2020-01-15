const fs = require('fs');
const path = require('path');
const express = require('express');
const fallback = require('express-history-api-fallback');

const contentRoot = path.resolve(process.env.CONTENT_BASE || './build');

let config;

try {
  config = JSON.parse(fs.readFileSync('/etc/config/config.json'));
} catch {
  console.warn("Could not read config from file system - using development config.");
  config = require('./config-dev.json');
}

const configureApp = (app, endpointBase = '/') => {
  app.get(endpointBase + '_health', function(req, res) {
    res.sendStatus(200)
  });

  app.get(endpointBase + 'config.json', function(req, res) {
    res.send(config);
  });

  app.use(endpointBase, express.static(contentRoot))

  app.use(endpointBase, fallback('index.html', { root: contentRoot }))
    .use((err, req, res, next) => {
      console.log(`Request to ${req.url} failed: ${err.stack}`);
      next(err);
    });

  app.use(endpointBase, (err, req, res, next) => {
    res.status(500);
    res.send({
      code: 'INTERNAL_ERROR',
      message: 'Ooops. Something broke back here. Sorry!'
    });
  });

  return app;
}

module.exports = { configureApp };
