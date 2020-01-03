const express = require('express');
const configureApp = require('./server-config').configureApp;
const port = process.env.port || 8988;

const init = async () => {
  const app = await configureApp(express());

  app.listen(port, function(error) {
    if (error) {
      console.error(error);
    } else {
      console.info("==> Listening on port %s.", port);
    }
  });
}

init();
