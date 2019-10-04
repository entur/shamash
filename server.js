const express = require('express')
const convict = require('./config/convict')
const webpack = require('webpack')

const app = express()
const port = process.env.port || 8080
const path = require('path')

convict.then( convict => {

  let ENDPOINTBASE = convict.get('endpointBase')

  console.info("ENDPOINTBASE is set to", ENDPOINTBASE)

  if (process.env.NODE_ENV === 'development') {
    let config = require('./webpack.config')
    config.output.publicPath = ENDPOINTBASE + 'public/'
    const compiler = webpack(config)
    app.use(
      require('webpack-dev-middleware')(compiler, {
        noInfo: true,
        publicPath: config.output.publicPath,
        stats: { colors: true }
      })
    )
    app.use(require('webpack-hot-middleware')(compiler))
  } else {
    app.use(ENDPOINTBASE + 'public', express.static(path.join(__dirname, 'public')))
  }

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

  app.listen(port, () => console.log(`Started on http://localhost:${port}${ENDPOINTBASE}`))
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
