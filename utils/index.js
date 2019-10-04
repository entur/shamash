export const getQueryParameters = () => {
  let search = window.location.search
  let parameters = {}

  search.substr(1).split('&').forEach( entry => {
    let eq = entry.indexOf('=')
    if (eq >= 0) {
      parameters[decodeURIComponent(entry.slice(0, eq))] =
        decodeURIComponent(entry.slice(eq + 1))
    }
  })

  if (parameters.variables) {
    try {
      parameters.variables =
        JSON.stringify(JSON.parse(parameters.variables), null, 2)
    } catch (e) {
      console.log("error", e)
    }
  }
  return parameters
}
