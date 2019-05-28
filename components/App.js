import React from 'react';
import GraphiQL from 'graphiql';
import { parse, print } from 'graphql';
import cfgreader from '../config/readConfig';
import '../css/app.css';
import '../css/graphiql.css';
import '../css/custom.css';
import { getQueryParameters } from '../utils/';
import graphQLFetcher from '../utils/graphQLFetcher';

import { tripQuery, bikeRentalStationsByBboxQuery } from '../queries/journeyplanner';
import { stopPlaceQuery, topographicPlaceQuery } from '../queries/nsr';

let logo

if (window.localStorage.getItem('theme') === 'dark') {
  require('../css/darktheme.css');
  logo = require('../static/img/entur-white.png')
} else {
  logo = require('../static/img/entur.png')
}

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
    if (!window.config) return
    if (window.config.serviceName === 'JourneyPlanner') {
      return tripQuery
    }
    return topographicPlaceQuery
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

  handleServiceChange(service) {
    let newPathName
    switch (service) {
      case 'journey-planner':
        newPathName = '/journey-planner/v2/ide'
        break;
      case 'stop-places':
        newPathName = '/stop-places/v1/ide'
        break;
      case 'raptor':
        newPathName = '/journey-planner/v2/raptor/ide'
        break;
    }
    window.location.href = `${window.location.origin}${newPathName}${window.location.search}`
  }

  handleEnvironmentChange(env) {
    const newOrigin = env === 'prod' ? 'https://api.entur.io' : `https://api.${env}.entur.io`
    window.location.href = `${newOrigin}${window.location.pathname}${window.location.search}`
  }

  handleThemeChange = (theme) => {
    window.localStorage.setItem('theme', theme)
    window.location.reload();
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

  renderExamplesMenu = () => {
    if (window.config.serviceName === 'JourneyPlanner') {
      return (
        <GraphiQL.Menu label="Examples" title="Examples">
          <GraphiQL.MenuItem label="trip" title="trip" onSelect={() => this.onEditQuery(tripQuery)} />
          <GraphiQL.MenuItem label="bikeRentalStationsByBbox" title="bikeRentalStationsByBbox" onSelect={() => this.onEditQuery(bikeRentalStationsByBboxQuery)} />
        </GraphiQL.Menu>
      )
    }
    return (
      <GraphiQL.Menu label="Examples" title="Examples">
        <GraphiQL.MenuItem label="topographicPlace" title="topographicPlace" onSelect={() => this.onEditQuery(topographicPlaceQuery)}  />
        <GraphiQL.MenuItem label="stopPlace" title="stopPlace" onSelect={() => this.onEditQuery(stopPlaceQuery)}  />
      </GraphiQL.Menu>
    )
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
            <img src={logo} className="logo" />
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

            <GraphiQL.Menu label="Service" title="Service">
              <GraphiQL.MenuItem label="JourneyPlanner" title="JourneyPlanner" onSelect={() => this.handleServiceChange('journey-planner')} />
              <GraphiQL.MenuItem label="NSR" title="NSR" onSelect={() => this.handleServiceChange('stop-places')} />
              <GraphiQL.MenuItem label="Raptor" title="Raptor" onSelect={() => this.handleServiceChange('raptor')} />
            </GraphiQL.Menu>

            <GraphiQL.Menu label="Environment" title="Environment">
              <GraphiQL.MenuItem label="Prod" title="Prod" onSelect={() => this.handleEnvironmentChange('prod')} />
              <GraphiQL.MenuItem label="Staging" title="Staging" onSelect={() => this.handleEnvironmentChange('staging')} />
              <GraphiQL.MenuItem label="Dev" title="Dev" onSelect={() => this.handleEnvironmentChange('dev')} />
            </GraphiQL.Menu>

            { this.renderExamplesMenu() }

            <GraphiQL.Menu label="Theme" title="Theme">
              <GraphiQL.MenuItem label="Light" title="Light" onSelect={() => this.handleThemeChange('light')} />
              <GraphiQL.MenuItem label="Dark" title="Dark" onSelect={() => this.handleThemeChange('dark')} />
            </GraphiQL.Menu>
          </GraphiQL.Toolbar>
        </GraphiQL>
      </div>
    );
  }
}

export default App;
