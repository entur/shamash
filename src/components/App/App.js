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
  print,
} from 'graphql';
import queryString from 'query-string';
import Helmet from 'react-helmet';
import graphQLFetcher from 'utils/graphQLFetcher';
import getPreferredTheme from 'utils/getPreferredTheme';
import history from 'utils/history';
import * as journeyplannerV3Queries from 'queries/journey-planner-v3';
import * as vehicleQueries from 'queries/vehicle-updates';
import GeocoderModal from 'components/GeocoderModal';
import './custom.css';
import findServiceName from 'utils/findServiceName';

import explorerDarkColors from './DarkmodeExplorerColors';
import 'graphiql/graphiql.css';

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

  // Redirect to default service if no service is specified or if at root
  useEffect(() => {
    const isAtRoot =
      pathname === BASE_PATH ||
      pathname === `${BASE_PATH}/` ||
      pathname === '/';
    const hasNoService = !serviceName || serviceName === '';

    if (isAtRoot || hasNoService) {
      const newPath = `${BASE_PATH}/${DEFAULT_SERVICE_ID}`;
      history.replace(newPath);
    }
  }, [pathname, serviceName]);

  let currentService = null;

  if (!serviceName || serviceName === 'journey-planner') {
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
    // Use the proper history API to navigate to the new service
    const newPath = `${BASE_PATH}/${id}`;
    history.push(newPath);
  };

  const editParameter = (key, value) => {
    setParameters((prevParameters) => {
      const newParameters = {
        ...prevParameters,
        [key]: value,
      };

      // Use the new parameters for the URL update to avoid stale closure
      history.replace({
        search: queryString.stringify(newParameters),
      });

      return newParameters;
    });
  };

  const handleEnvironmentChange = (env) => {
    if (window.location.host.includes('localhost')) {
      console.log('Running on localhost, not redirecting');
      return;
    }

    if (env === 'dev') {
      redirectHost('api.dev.entur.io');
    } else if (env === 'staging') {
      redirectHost('api.staging.entur.io');
    } else if (env === 'prod') {
      redirectHost('api.entur.io');
    }
  };

  const redirectHost = (host) => {
    window.location.href = `${window.location.protocol}//${host}${window.location.pathname}${window.location.search}`;
  };

  const handleThemeChange = (theme) => {
    window.localStorage.setItem('theme', theme);
    window.location.reload();
  };

  const handleClickPrettifyButton = () => {
    if (!graphiql || !graphiql.current) return;

    try {
      const queryEditor = graphiql.current.getQueryEditor();
      const variablesEditor = graphiql.current.getVariableEditor();

      if (queryEditor) {
        const currentQueryText = queryEditor.getValue();
        if (currentQueryText) {
          const prettyQueryText = print(parse(currentQueryText));
          queryEditor.setValue(prettyQueryText);
        }
      }

      if (variablesEditor) {
        const currentVariablesText = variablesEditor.getValue();
        if (currentVariablesText && currentVariablesText.trim() !== '') {
          const prettyVariablesText = JSON.stringify(
            JSON.parse(currentVariablesText),
            null,
            2
          );
          variablesEditor.setValue(prettyVariablesText);
        }
      }
    } catch (error) {
      console.warn('Prettify failed:', error);
    }
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

    if (currentService.queries === 'journey-planner-v3') {
      queries = journeyplannerV3Queries;
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

  // Fix: Make query loading reactive to service changes
  const getDefaultQuery = useCallback(() => {
    if (!currentService) return '';
    try {
      return require(`queries/${currentService.queries}/${currentService.defaultQuery}`)
        .default.query;
    } catch (error) {
      console.warn(
        `Failed to load default query for ${currentService.id}:`,
        error
      );
      return '';
    }
  }, [currentService]);

  // Use useMemo to ensure query is reactive to service changes
  const query = useMemo(() => {
    const urlQuery = parameters.query;
    const defaultQuery = getDefaultQuery();

    // Only return the default query if there's no URL query
    // Don't automatically add the default query to the URL
    return urlQuery || defaultQuery;
  }, [
    parameters.query,
    getDefaultQuery,
    pathname,
    serviceName,
    currentService?.id,
  ]);

  const { variables, operationName } = parameters;

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
  const [pathname, setPathname] = useState(window.location.pathname);
  const [parameters, setParameters] = useState(
    queryString.parse(window.location.search)
  );

  useEffect(() => {
    // Listen for popstate events (back/forward browser buttons)
    const handlePopState = () => {
      setPathname(window.location.pathname);
      setParameters(queryString.parse(window.location.search));
    };

    window.addEventListener('popstate', handlePopState);

    // Check for path changes only when they actually change
    let lastPath = window.location.pathname;
    let lastSearch = window.location.search;

    const checkForPathChanges = () => {
      const currentPath = window.location.pathname;
      const currentSearch = window.location.search;

      // Only update state if something actually changed
      if (currentPath !== lastPath) {
        setPathname(currentPath);
        lastPath = currentPath;
      }

      if (currentSearch !== lastSearch) {
        setParameters(queryString.parse(currentSearch));
        lastSearch = currentSearch;
      }
    };

    // Check for path changes less frequently and only when needed
    const interval = setInterval(checkForPathChanges, 500);

    return () => {
      window.removeEventListener('popstate', handlePopState);
      clearInterval(interval);
    };
  }, []);

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
