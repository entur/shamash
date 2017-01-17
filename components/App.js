import React from 'react'
import GraphiQL from 'graphiql'
import fetch from 'isomorphic-fetch'
import '../css/app.css'
import '../css/codemirror.css'
import '../css/doc-explorer.css'
import '../css/foldgutter.css'
import '../css/lint.css'
import '../css/loading.css'
import '../css/show-hint.css'
import '../css/graphiql.css'
import '../css/custom.css'

class App extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      parameters: this.getParameters()
    }
  }

  graphQLFetcher(graphQLParams) {
    return fetch('https://test.rutebanken.org/apiman-gateway/rutebanken/tiamat/1.0/graphql', {
      method: 'post',
      headers: {
        'accept': '*/*',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(graphQLParams),
    }).then(function (response) {
      return response.text()
    }).then(function (responseBody) {
      try {
        return JSON.parse(responseBody)
      } catch (error) {
        return responseBody
      }
    })
  }

  getParameters() {
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
      }
    }
    return parameters
  }


  onEditQuery(newQuery) {
    const parameters = Object.assign({}, this.state.parameters, {
      query: newQuery
    })

    this.setState({
      parameters: parameters
    })
    this.updateURL()
  }

  onEditVariables(newVariables) {
    const parameters = Object.assign({}, this.state.parameters, {
      variables: newVariables
    })

    this.setState({
      parameters: parameters
    })
    this.updateURL()
  }

  onEditOperationName(newOperationName) {
    const parameters = Object.assign({}, this.state.parameters, {
      operationName: newOperationName
    })
    this.setState({
      parameters: parameters
    })
    this.updateURL()
  }

  updateURL() {
    const { parameters } = this.state
    let newSearch = '?' + Object.keys(parameters).filter(function (key) {
        return Boolean(parameters[key])
      }).map(function (key) {
        return encodeURIComponent(key) + '=' +
          encodeURIComponent(parameters[key])
      }).join('&')
    history.replaceState(null, null, newSearch)
  }

  render() {

    const { parameters } = this.state

    return (
      <div>
        <div className="title">Stoppestedsregisteret</div>
        <GraphiQL
          fetcher={this.graphQLFetcher}
          query={parameters.query}
          variables={parameters.variables}
          operationName={parameters.operationName}
          onEditQuery={this.onEditQuery.bind(this)}
          onEditVariables={this.onEditVariables.bind(this)}
          onEditOperationName={this.onEditOperationName.bind(this)}
        />
      </div>
    )
  }
}

export default App