import React, {
  useMemo,
  useCallback,
  useState,
  useRef,
  useEffect,
} from 'react';
import GraphiQL from 'graphiql';
import GraphiQLExplorer from 'graphiql-explorer';
import {
  parse,
  getIntrospectionQuery,
  buildClientSchema,
  stripIgnoredCharacters,
} from 'graphql';
import queryString from 'query-string';
import Helmet from 'react-helmet';
import graphQLFetcher from 'utils/graphQLFetcher';
import getPreferredTheme from 'utils/getPreferredTheme';
import history from 'utils/history';
import * as journeyplannerV2Queries from 'queries/journey-planner-v2';
import * as journeyplannerV3Queries from 'queries/journey-planner-v3';
import * as nsrQueries from 'queries/stop-places';
import * as vehicleQueries from 'queries/vehicle-updates';
import GeocoderModal from 'components/GeocoderModal';
import './custom.css';
import findServiceName from 'utils/findServiceName';

import explorerDarkColors from './DarkmodeExplorerColors';
import 'graphiql/graphiql.css';
import { print } from '../../utils/graphqlPrinter';

import Map from '../Map';

import whiteLogo from 'static/images/entur-white.png';
import normalLogo from 'static/images/entur.png';

import { NotFound } from './404';

import { ConfigContext, useConfig, useFetchConfig } from 'config/ConfigContext';

const BASE_PATH = process.env.PUBLIC_URL || '';
const DEFAULT_SERVICE_ID = 'journey-planner-v3';

export const App = ({ pathname, parameters, setParameters }) => {
  const { services, enturClientName } = useConfig();
  const [showGeocoderModal, setShowGeocoderModal] = useState(false);
  const [schema, setSchema] = useState();
  const [showExplorer, setShowExplorer] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [response, setResponse] = useState();

  let graphiql = useRef(null);

  const serviceName = findServiceName(pathname, BASE_PATH);

  let currentService = null;

  if (!serviceName) {
    currentService = services.find((s) => s.id === DEFAULT_SERVICE_ID);
  } else {
    currentService = services.find((s) => s.id === serviceName);
  }

  const fetcher = useMemo(
    () =>
      currentService &&
      graphQLFetcher(
        currentService.url,
        currentService.subscriptionsUrl,
        enturClientName
      ),
    [currentService, enturClientName]
  );

  useEffect(() => {
    fetcher &&
      fetcher({
        query: getIntrospectionQuery(),
      }).then((result) => {
        setSchema(buildClientSchema(result.data));
      });
  }, [fetcher]);

  const handleServiceChange = (id) => {
    history.push(`${BASE_PATH}/${id}`);
  };

  const editParameter = (key, value) => {
    setParameters((prevParameters) => ({
      ...prevParameters,
      [key]: value,
    }));

    history.replace({
      search: queryString.stringify({
        ...parameters,
        [key]: value,
      }),
    });
  };

  const handleEnvironmentChange = (env) => {
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

  const handleThemeChange = (theme) => {
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

  const handleClickMinifyButton = () => {
    if (!graphiql) return;

    const queryEditor = graphiql.current.getQueryEditor();
    const currentQueryText = queryEditor.getValue();
    const uglyQueryText = stripIgnoredCharacters(currentQueryText);
    queryEditor.setValue(uglyQueryText);

    const variablesEditor = graphiql.current.getVariableEditor();
    const currentVariablesText = variablesEditor.getValue();
    const uglyVariablesText = JSON.stringify(JSON.parse(currentVariablesText));
    variablesEditor.setValue(uglyVariablesText);
  };

  const handleHistoryButton = () => {
    if (!graphiql) return;
    graphiql.current.setState({
      historyPaneOpen: !graphiql.current.state.historyPaneOpen,
    });
  };

  const toggleExplorer = () => {
    setShowExplorer((prevShowExplorer) => !prevShowExplorer);
  };

  const toggleMap = () => {
    setShowMap((prev) => !prev);
  };

  const renderExamplesMenu = () => {
    let queries;

    if (currentService.queries === 'journey-planner-v2') {
      queries = journeyplannerV2Queries;
    } else if (currentService.queries === 'journey-planner-v3') {
      queries = journeyplannerV3Queries;
    } else if (currentService.queries === 'stop-places') {
      queries = nsrQueries;
    } else if (currentService.queries === 'vehicle-updates') {
      queries = vehicleQueries;
    } else {
      return null;
    }

    return (
      <GraphiQL.Menu label="Examples" title="Examples">
        {Object.entries(queries).map(([key, { query, variables }]) => (
          <GraphiQL.MenuItem
            key={key}
            label={key}
            title={key}
            onSelect={() => {
              editParameter('query', query);
              if (variables) {
                editParameter('variables', JSON.stringify(variables, null, 2));
              }
            }}
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
          .default.query
      : '',
    variables,
    operationName,
  } = parameters;

  const customFetcher = useCallback(
    async (...args) => {
      const res = await fetcher(...args);
      setResponse(res);
      return res;
    },
    [fetcher]
  );

  if (currentService == null) {
    return <NotFound />;
  }

  return (
    <div className="App graphiql-container">
      <GraphiQLExplorer
        schema={schema}
        query={query}
        onEdit={(value) => editParameter('query', value)}
        onRunOperation={(operationName) =>
          graphiql.current.handleRunQuery(operationName)
        }
        explorerIsOpen={showExplorer}
        onToggleExplorer={toggleExplorer}
        colors={getPreferredTheme() === 'dark' && explorerDarkColors}
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
          fetcher={customFetcher}
          query={query}
          variables={variables}
          operationName={operationName}
          onEditQuery={(value) => editParameter('query', value)}
          onEditVariables={(value) => editParameter('variables', value)}
          onEditOperationName={(value) => editParameter('operationName', value)}
        >
          <GraphiQL.Logo>
            <img
              alt="logo"
              src={getPreferredTheme() === 'dark' ? whiteLogo : normalLogo}
              className="logo"
            />
          </GraphiQL.Logo>
          <GraphiQL.Toolbar>
            <GraphiQL.Button
              onClick={handleClickPrettifyButton}
              label="Prettify"
              title="Prettify Query (Shift-Ctrl-P)"
            />
            <GraphiQL.Button
              onClick={handleClickMinifyButton}
              label="Minify"
              title="Minify Query"
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

            <GraphiQL.Button onClick={toggleMap} label="Map" title="Show Map" />

            <GraphiQL.Menu label="Service" title="Service">
              {services.map((service) => (
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
      {showMap ? <Map response={response} /> : null}
    </div>
  );
};

const ConnectedApp = () => {
  const config = useFetchConfig();
  const [pathname, setPathname] = useState(history.location.pathname);
  const [parameters, setParameters] = useState(
    queryString.parse(history.location.search)
  );

  useEffect(() => {
    return history.listen((location) => {
      if (location.pathname !== pathname) {
        setPathname(location.pathname);
        setParameters(queryString.parse(location.search));
      }
    });
  }, [pathname]);

  if (!config.services) {
    return null;
  }

  return (
    <ConfigContext.Provider value={config}>
      <App
        pathname={pathname}
        parameters={parameters}
        setParameters={setParameters}
      />
    </ConfigContext.Provider>
  );
};

export default ConnectedApp;
