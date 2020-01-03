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
        name: 'NSR',
        url: 'https://api.entur.io/stop-places/v1/graphql',
        defaultQuery: `
        {
          topographicPlace(query: "frogn") {
            id
            name {
              value
            }
          }
        }
        `
      },
      {
        id: 'journey-planner',
        name: 'JourneyPlanner',
        url: 'https://api.entur.io/journey-planner/v2/graphql',
        defaultQuery: `
        {
          trip(
            from: {
              name: "Bjerkealleen 5A, Skedsmo"
              coordinates: {
                latitude: 59.96050414081307
                longitude:11.040338686322317
              }
            }
            to: {
              place:"NSR:StopPlace:385"
              name:"Alna, Oslo"
            }
            numTripPatterns: 3
            dateTime: "2020-01-03T19:18:26.997+01:00"
            minimumTransferTime: 180
            walkSpeed: 1.3
            wheelchair: false
            arriveBy: false
          )

        #### Requested fields
          {
            tripPatterns {
              startTime
              duration
              walkDistance
              legs {
                mode
                distance
                line {
                  id
                  publicCode
                }
                pointsOnLink {
                  points
                  length
                }
              }
            }
          }
        }
        `
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
