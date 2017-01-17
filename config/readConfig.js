import fetch from 'isomorphic-fetch'

/*
Reading config json as served out of the node application.
*/

var configreader = {}
var config

configreader.readConfig = (callback) => {
  if (config && typeof config !== 'undefined') {
    callback(config)
    return
  }
  fetch('config.json', {
    timeout: 2000,
    method: 'get',
    headers: {
      'Content-Type': 'application/json',
    },
   })
    .then( response => response.json() )
    .then( json => callback(json) )
    .catch(function(response){
      throw new Error("Could not read config: "+response)
    })
  }

module.exports = configreader

