const path = require('path');
const express = require('express');
const fallback = require('express-history-api-fallback');

const contentRoot = path.resolve(process.env.CONTENT_BASE || './build');

const configureApp = (app, endpointBase = '/') => {
  app.get(endpointBase + '_health', function(req, res) {
    res.sendStatus(200)
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
