const path = require('path');
const express = require('express');
const fallback = require('express-history-api-fallback');

const contentRoot = path.resolve(process.env.CONTENT_BASE || './build');

const configureApp = (app, endpointBase = '/') => {
  app.get(endpointBase + '_health', function(req, res) {
    res.sendStatus(200)
  });

  app.get(endpointBase + 'config.json', function(req, res) {
    res.send([
      {
        id: 'stop-places',
        name: 'Stoppestedsregisteret',
        url: 'https://api.entur.io/stop-places/v1/graphql',
        queries: 'stop-places',
        defaultQuery: 'stopPlace'
      },
      {
        id: 'journey-planner',
        name: 'JourneyPlanner',
        url: 'https://api.entur.io/journey-planner/v2/graphql',
        queries: 'journey-planner',
        defaultQuery: 'trip'
      }
    ]);
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
