var convict = require('convict');
var request = require('request');
var fs = require('fs');

module.exports = new Promise(function(resolve, reject){
  var conf = convict({
    env: {
      doc: "The applicaton environment.",
      format: ["production", "development"],
      default: "development",
      env: "NODE_ENV"
    },
    configUrl: {
      doc: "URL for where to read the configuration",
      format: "*",
      default: "http://rutebanken.org/do_not_read",
      env: "CONFIG_URL"
    },
    graphQLUrl: {
      doc: "Base URL for GraphQL endpoint including slash",
      format: "url",
      default: "https://api-test.entur.org/stop_places/1.0/graphql",
      env: "GRAPHQL_URL"
    },
    serviceName: {
      doc: "Name of service to identify service in client",
      format: String,
      default: "Stoppestedsregisteret",
      env: "SERVICE_NAME"
    },
    endpointBase: {
      doc: "Namespace for client including slash, e.g. /admin/shamash/",
      format: String,
      default: "/",
      env: "ENDPOINTBASE"
    }

  });

  // If configuration URL exists, read it and update the configuration object
  var configUrl = conf.get('configUrl');

  console.log("configUrl", configUrl);

  if ( configUrl.indexOf("do_not_read") == -1 ) {
      // Read contents from configUrl if it is given

      if (configUrl.indexOf("http") == -1) {
          fs.readFile(configUrl, (error, data) => {
              if (!error) {
                  data = JSON.parse(data)
                  conf.load(data);
                  conf.validate();
                  resolve(conf)
              } else {
                  reject("Could not load data from " + configUrl, error)
              }
          });
      } else {
          request(configUrl, function (error, response, body) {
              if (!error && response.statusCode == 200) {
                  body = JSON.parse(body)
                  conf.load(body);
                  conf.validate();
                  resolve(conf)
              } else {
                  reject("Could not load data from " + configUrl, error)
              }
          });
      }
  } else {
    console.log("The CONFIG_URL element has not been set, so you use the default dev-mode configuration")
    conf.validate();
    resolve(conf)
  }
})
