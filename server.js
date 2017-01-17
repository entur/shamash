const express = require('express');

const app = express();

app.listen(process.env.port || 8080, () => console.log('Started on http://localhost:8080/'));

app.get('/', (req, res) => {
  res.send(getPage())
})

app.get('/public/bundle.js', function(req, res) {
  res.sendFile(__dirname + '/public/bundle.js')
})

const getPage = () =>
  `<!DOCTYPE html>
     <html>
      <head>
        <title>Shamash</title>
      </head>
      <body>
        <div id="root">
        </div>
        <script src='/public/bundle.js'></script>
      </body>
    </html>`