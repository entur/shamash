import React, { useMemo, useState, useRef, useEffect } from 'react';
import GraphiQL from 'graphiql';
import GraphiQLExplorer from 'graphiql-explorer';
import {
  parse,
  print,
  getIntrospectionQuery,
  buildClientSchema
} from 'graphql';
import queryString from 'query-string';
import Helmet from 'react-helmet';
import graphQLFetcher from 'utils/graphQLFetcher';
import getPreferredTheme from 'utils/getPreferredTheme';
import history from 'utils/history';
import * as journeyplannerQueries from 'queries/journey-planner';
import * as nsrQueries from 'queries/stop-places';
import GeocoderModal from 'components/GeocoderModal';
import './app.css';
import './custom.css';
import 'graphiql/graphiql.css';
import findServiceName from 'utils/findServiceName';

let logo;
if (getPreferredTheme() === 'dark') {
  logo = require('static/images/entur-white.png');
} else {
  logo = require('static/images/entur.png');
}

const BASE_PATH = process.env.PUBLIC_URL || '';
const DEFAULT_SERVICE_ID = 'journey-planner';

export const App = ({ services, pathname, parameters }) => {
  const [showGeocoderModal, setShowGeocoderModal] = useState(false);
  const [schema, setSchema] = useState();
  const [showExplorer, setShowExplorer] = useState(false);

  let graphiql = useRef(null);

  const serviceName = findServiceName(pathname, BASE_PATH);

  const currentService =
    services.find(s => s.id === serviceName) ||
    services.find(s => s.id === DEFAULT_SERVICE_ID);

  const fetcher = useMemo(() => graphQLFetcher(currentService.url), [
    currentService.url
  ]);

  useEffect(() => {
    fetcher({
      query: getIntrospectionQuery()
    }).then(result => {
      setSchema(buildClientSchema(result.data));
    });
  }, [fetcher]);

  const handleServiceChange = id => {
    history.push(`${BASE_PATH}/${id}`);
  };

  const editParameter = (key, value) => {
    history.replace({
      search: queryString.stringify({
        ...parameters,
        [key]: value
      })
    });
  };

  const handleEnvironmentChange = env => {
    if (window.location.host.includes('localhost')) {
      return;
    }

    if (env === 'dev') {
      window.location.host = 'api.dev.entur.io';
    } else if (env === 'staging') {
      window.location.host = 'api.staging.entur.io';
    } else if (env === 'prod') {
      window.location.host = 'api.entur.io';
    }
  };

  const handleThemeChange = theme => {
    window.localStorage.setItem('theme', theme);
    window.location.reload();
  };

  const handleClickPrettifyButton = () => {
    if (!graphiql) return;

    const queryEditor = graphiql.current.getQueryEditor();
    const currentQueryText = queryEditor.getValue();
    const prettyQueryText = print(parse(currentQueryText));
    queryEditor.setValue(prettyQueryText);

    const variablesEditor = graphiql.current.getVariableEditor();
    const currentVariablesText = variablesEditor.getValue();
    const prettyVariablesText = JSON.stringify(
      JSON.parse(currentVariablesText),
      null,
      2
    );
    variablesEditor.setValue(prettyVariablesText);
  };

  const handleHistoryButton = () => {
    if (!graphiql) return;
    graphiql.current.setState({
      historyPaneOpen: !graphiql.current.state.historyPaneOpen
    });
  };

  const toggleExplorer = () => {
    setShowExplorer(prevShowExplorer => !prevShowExplorer);
  };

  const renderExamplesMenu = () => {
    let queries;

    if (currentService.queries === 'journey-planner') {
      queries = journeyplannerQueries;
    } else if (currentService.queries === 'stop-places') {
      queries = nsrQueries;
    } else {
      return null;
    }

    return (
      <GraphiQL.Menu label="Examples" title="Examples">
        {Object.entries(queries).map(([key, value]) => (
          <GraphiQL.MenuItem
            key={key}
            label={key}
            title={key}
            onSelect={() => editParameter('query', value)}
          />
        ))}
      </GraphiQL.Menu>
    );
  };

  const searchForId = () => {
    setShowGeocoderModal(!showGeocoderModal);
  };

  const {
    query = currentService
      ? require(`queries/${currentService.queries}/${currentService.defaultQuery}`)
          .default
      : '',
    variables,
    operationName
  } = parameters;

  return (
    <div className="App">
      <GraphiQLExplorer
        schema={schema}
        query={query}
        onEdit={value => editParameter('query', value)}
        onRunOperation={operationName =>
          graphiql.current.handleRunQuery(operationName)
        }
        explorerIsOpen={showExplorer}
        onToggleExplorer={toggleExplorer}
      />
      <div style={{ flex: 1 }}>
        <Helmet>
          {getPreferredTheme() === 'dark' && (
            <link
              rel="stylesheet"
              type="text/css"
              href={`${BASE_PATH}/darktheme.css`}
            />
          )}
        </Helmet>
        <GraphiQL
          ref={graphiql}
          fetcher={fetcher}
          query={query}
          variables={variables}
          operationName={operationName}
          onEditQuery={value => editParameter('query', value)}
          onEditVariables={value => editParameter('variables', value)}
          onEditOperationName={value => editParameter('operationName', value)}
        >
          <GraphiQL.Logo>
            <img alt="logo" src={logo} className="logo" />
          </GraphiQL.Logo>
          <GraphiQL.Toolbar>
            <GraphiQL.Button
              onClick={() => handleClickPrettifyButton()}
              label="Prettify"
              title="Prettify Query (Shift-Ctrl-P)"
            />

            <GraphiQL.Button
              onClick={handleHistoryButton}
              label="History"
              title="Show History"
            />

            <GraphiQL.Button
              onClick={toggleExplorer}
              label="Explorer"
              title="Show Explorer"
            />

            <GraphiQL.Menu label="Service" title="Service">
              {services.map(service => (
                <GraphiQL.MenuItem
                  key={service.id}
                  label={service.name}
                  title={service.name}
                  onSelect={() => handleServiceChange(service.id)}
                />
              ))}
            </GraphiQL.Menu>

            <GraphiQL.Menu label="Environment" title="Environment">
              <GraphiQL.MenuItem
                label="Prod"
                title="Prod"
                onSelect={() => handleEnvironmentChange('prod')}
              />
              <GraphiQL.MenuItem
                label="Staging"
                title="Staging"
                onSelect={() => handleEnvironmentChange('staging')}
              />
              <GraphiQL.MenuItem
                label="Dev"
                title="Dev"
                onSelect={() => handleEnvironmentChange('dev')}
              />
            </GraphiQL.Menu>

            {renderExamplesMenu()}

            <GraphiQL.Menu label="Theme" title="Theme">
              <GraphiQL.MenuItem
                label="Light"
                title="Light"
                onSelect={() => handleThemeChange('light')}
              />
              <GraphiQL.MenuItem
                label="Dark"
                title="Dark"
                onSelect={() => handleThemeChange('dark')}
              />
            </GraphiQL.Menu>

            <GraphiQL.Button
              onClick={() => {
                searchForId();
              }}
              label="Search for ID"
              title="Search for ID"
            />
          </GraphiQL.Toolbar>
          <GraphiQL.Footer>
            <div className="label">
              {currentService.name}:{' '}
              <a
                target="_blank"
                rel="noopener noreferrer"
                href={currentService.url}
              >
                {currentService.url}
              </a>
            </div>
          </GraphiQL.Footer>
        </GraphiQL>
        {showGeocoderModal ? (
          <GeocoderModal onDismiss={() => setShowGeocoderModal(false)} />
        ) : null}
      </div>
    </div>
  );
};

export default () => {
  const [services, setServices] = useState(null);
  const [pathname, setPathname] = useState(history.location.pathname);
  const [parameters, setParameters] = useState(
    queryString.parse(history.location.search)
  );

  useEffect(() => {
    const fetchServices = async () => {
      const resp = await fetch(`${BASE_PATH}/config.json`);
      setServices(await resp.json());
    };
    fetchServices();
  }, []);

  useEffect(() => {
    return history.listen(location => {
      if (location.pathname !== pathname) {
        setPathname(location.pathname);
        setParameters(queryString.parse(location.search));
      }
    });
  }, [pathname]);

  if (services === null) {
    return null;
  }

  return (
    <App services={services} pathname={pathname} parameters={parameters} />
  );
};
