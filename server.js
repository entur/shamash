const express = require('express');
const convict = require('./config/convict-promise')

const app = express();
const port = process.env.port || 8080

convict.then( convict => {

  let ENDPOINTBASE = convict.get('endpointBase')

  console.info("ENDPOINTBASE is set to", ENDPOINTBASE)

  app.get(ENDPOINTBASE, (req, res) => {
    res.send(getPage(ENDPOINTBASE))
  })

  app.get(ENDPOINTBASE + '_health', (req, res) => {
    res.sendStatus(200)
  })

  app.get(ENDPOINTBASE + 'config.json', (req, res) => {
    let cfg = {
      serviceName: convict.get('serviceName'),
      graphQLUrl: convict.get('graphQLUrl'),
      endpointBase: convict.get('endpointBase')
    }
    res.send(cfg)
  })

  app.get(ENDPOINTBASE + 'public/bundle.js', function(req, res) {
    res.sendFile(__dirname + '/public/bundle.js')
  })

  app.listen(port, () => console.log('Started on http://localhost:8080/'));
})

const getPage = (endpointBase) =>
  `<!DOCTYPE html>
     <html>
      <head>
        <title>Shamash</title>
      </head>
      <body>
        <div id="root">
        </div>
        <script src='${endpointBase}public/bundle.js'></script>
      </body>
    </html>`