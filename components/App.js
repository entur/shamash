import React from 'react';
import GraphiQL from 'graphiql';
import { parse, print } from 'graphql';
import cfgreader from '../config/readConfig';
import '../css/app.css';
import '../css/graphiql.css';
import '../css/custom.css';
import defaultQuery from '../defaultQuery';
import { getQueryParameters } from '../utils/';
import graphQLFetcher from '../utils/graphQLFetcher';

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      parameters: getQueryParameters(),
      isConfigLoaded: false
    };

    if (window.localStorage) {
      localStorage.removeItem('graphiql:query');
    }
  }

  componentWillMount() {
    cfgreader.readConfig(config => {
      console.info('loaded config', config);
      window.config = config;
      this.setState({
        isConfigLoaded: true
      });
    });
  }

  onEditQuery(query) {
    this.setState({
      parameters: {
        ...this.state.parameters,
        query
      }
    });
    this.updateURL();
  }

  onEditVariables(variables) {
    this.setState({
      parameters: {
        ...this.state.parameters,
        variables
      }
    });
    this.updateURL();
  }

  onEditOperationName(operationName) {
    this.setState({
      parameters: {
        ...this.state.parameters,
        operationName
      }
    });
    this.updateURL();
  }

  getDefaultQuery() {
    if (window.config) {
      return defaultQuery[window.config.serviceName];
    }
  }

  handleClickPrettifyButton() {
    if (!this.graphiql) return
    const editor = this.graphiql.getQueryEditor();
    const currentText = editor.getValue();
    const prettyText = print(parse(currentText));
    editor.setValue(prettyText);
  }

  handleHistoryButton() {
    if (!this.graphiql) return
    this.graphiql.setState({
      historyPaneOpen: !this.graphiql.state.historyPaneOpen,
    })
  }

  handleEnvironmentChange(env) {
    let newOrigin = env === 'prod' ? 'https://api.entur.org' : `https://api-${env}.entur.org`
    window.location.href = `${newOrigin}${window.location.pathname}${window.location.search}`
  }

  updateURL() {
    const { parameters } = this.state;
    let newSearch =
      '?' +
      Object.keys(parameters)
        .filter(key => {
          return Boolean(parameters[key]);
        })
        .map(key => {
          return (
            encodeURIComponent(key) + '=' + encodeURIComponent(parameters[key])
          );
        })
        .join('&');
    history.replaceState(null, null, newSearch);
  }

  render() {
    const { parameters, isConfigLoaded } = this.state;

    if (!isConfigLoaded) {
      return <div>Loading ...</div>;
    }

    return (
      <div>
        <div className="label">
          {window.config.serviceName}
        </div>
        <GraphiQL
          ref={c => { this.graphiql = c; }}
          fetcher={graphQLFetcher}
          query={parameters.query}
          variables={parameters.variables}
          operationName={parameters.operationName}
          onEditQuery={this.onEditQuery.bind(this)}
          onEditVariables={this.onEditVariables.bind(this)}
          onEditOperationName={this.onEditOperationName.bind(this)}
          defaultQuery={this.getDefaultQuery()}
        >
          <GraphiQL.Logo>
            <img src={require('../static/img/entur.png')} className="logo" />
          </GraphiQL.Logo>
          <GraphiQL.Toolbar>
            <GraphiQL.Button
              onClick={this.handleClickPrettifyButton.bind(this)}
              label="Prettify"
              title="Prettify Query (Shift-Ctrl-P)"
            />

            <GraphiQL.Button
              onClick={this.handleHistoryButton.bind(this)}
              label="History"
              title="Show History"
            />

            <GraphiQL.Menu label="Miljø" title="Miljø">
              <GraphiQL.MenuItem label="Prod" title="Prod" onSelect={() => this.handleEnvironmentChange('prod')} />
              <GraphiQL.MenuItem label="Stage" title="Stage" onSelect={() => this.handleEnvironmentChange('stage')} />
              <GraphiQL.MenuItem label="Test" title="Test" onSelect={() => this.handleEnvironmentChange('test')} />
            </GraphiQL.Menu>
          </GraphiQL.Toolbar>
        </GraphiQL>
      </div>
    );
  }
}

export default App;
