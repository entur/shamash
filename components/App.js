import React from 'react'
import GraphiQL from 'graphiql'
import fetch from 'isomorphic-fetch'
import cfgreader from '../config/readConfig'
import '../css/app.css'
import '../css/codemirror.css'
import '../css/doc-explorer.css'
import '../css/foldgutter.css'
import '../css/lint.css'
import '../css/loading.css'
import '../css/show-hint.css'
import '../css/graphiql.css'
import '../css/custom.css'
import defaultQuery from '../defaultQuery'

class App extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      parameters: this.getParameters(),
      isConfigLoaded: false
    }

    if (window.localStorage) {
      localStorage.removeItem('graphiql:query')
    }

  }

  componentWillMount(){
    cfgreader.readConfig( config => {
      console.info("loaded config", config)
      window.config = config
      this.setState({
        ...this.state,
        isConfigLoaded: true
      })
    })
  }

  graphQLFetcher(graphQLParams) {
    return fetch(window.config.graphQLUrl, {
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

  getDefaultQuery() {
    if (window.config) {
      return defaultQuery[window.config.serviceName]
    }
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

    const { parameters, isConfigLoaded } = this.state

    if (!isConfigLoaded) {
      return (
        <div>Loading ...</div>
      )
    }

    return (
      <div>
        <div className="title">{window.config.serviceName}</div>
        <GraphiQL
          fetcher={this.graphQLFetcher}
          query={parameters.query}
          variables={parameters.variables}
          operationName={parameters.operationName}
          onEditQuery={this.onEditQuery.bind(this)}
          onEditVariables={this.onEditVariables.bind(this)}
          onEditOperationName={this.onEditOperationName.bind(this)}
          defaultQuery={this.getDefaultQuery()}
        />
      </div>
    )
  }
}

export default App