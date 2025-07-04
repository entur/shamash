import React, {
  useMemo,
  useCallback,
  useState,
  useRef,
  useEffect,
} from 'react';
import GraphiQL from 'graphiql';
import { Explorer as GraphiQLExplorer } from 'graphiql-explorer';
import {
  parse,
  getIntrospectionQuery,
  buildClientSchema,
  stripIgnoredCharacters,
  print,
} from 'graphql';
import queryString from 'query-string';
import graphQLFetcher from '../../utils/graphQLFetcher.js';
import getPreferredTheme from '../../utils/getPreferredTheme.js';
import history from '../../utils/history.js';
import GeocoderModal from '../GeocoderModal/index.js';
import './custom.css';
import findServiceName from '../../utils/findServiceName.js';

import explorerDarkColors from './DarkmodeExplorerColors.js';
import 'graphiql/graphiql.css';

// Conditionally import dark theme CSS based on user preference
// if (getPreferredTheme() === 'dark') {
//   import('../../darktheme.css');
// }

import Map from '../Map/index.jsx';

import whiteLogo from '../../static/images/entur-white.png';
import normalLogo from '../../static/images/entur.png';

import { NotFound } from './404.jsx';

import {
  ConfigContext,
  useConfig,
  useFetchConfig,
} from '../../config/ConfigContext.js';

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

  // Load dark theme CSS dynamically when dark theme is selected
  useEffect(() => {
    const isDarkTheme = getPreferredTheme() === 'dark';

    if (isDarkTheme) {
      // Import the dark theme CSS
      import('../../darktheme.css');
    } else {
      // Remove dark theme CSS if it was previously loaded
      const existingLink = document.querySelector('link[href*="darktheme"]');
      if (existingLink) {
        existingLink.remove();
      }
    }
  }, []);

  // Redirect to default service if no service is specified or if at root
  useEffect(() => {
    const isAtRoot =
      pathname === BASE_PATH ||
      pathname === `${BASE_PATH}/` ||
      pathname === '/';
    const hasNoService = !serviceName || serviceName === '';

    if (isAtRoot || hasNoService) {
      // Use window.location instead of history.replace for initial redirect
      // This avoids the SecurityError with malformed URLs
      const basePath = import.meta.env.BASE_URL || '/';
      const newPath = basePath === '/' ? `/${DEFAULT_SERVICE_ID}` : `${basePath}${DEFAULT_SERVICE_ID}`;
      window.location.replace(newPath);
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
    // For development with Vite, use simple relative paths
    // For production, handle base path correctly
    const basePath = import.meta.env.BASE_URL || '/';
    const newPath = basePath === '/' ? `/${id}` : `${basePath}${id}`;

    // Use window.location for proper navigation instead of custom history
    window.location.href = newPath;
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

  const [exampleQueries, setExampleQueries] = useState({});

  // Load example queries dynamically when service changes
  useEffect(() => {
    const loadExampleQueries = async () => {
      if (!currentService?.queries) return;

      try {
        const module = await import(
          `../../queries/${currentService.queries}/index.js`
        );
        setExampleQueries(module);
      } catch (error) {
        console.warn(
          `Failed to load example queries for ${currentService.queries}:`,
          error
        );
        setExampleQueries({});
      }
    };

    loadExampleQueries();
  }, [currentService]);

  const renderExamplesMenu = () => {
    if (!exampleQueries || Object.keys(exampleQueries).length === 0) {
      return null;
    }

    return (
      <GraphiQL.Menu label="Examples" title="Examples">
        {Object.entries(exampleQueries).map(([key, { query, variables }]) => (
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

  const [query, setQuery] = useState('');

  useEffect(() => {
    const setInitialQuery = async () => {
      const urlQuery = parameters.query;
      if (urlQuery) {
        setQuery(urlQuery);
      } else if (currentService) {
        try {
          const module = await import(
            `../../queries/${currentService.queries}/${currentService.defaultQuery}.js`
          );
          setQuery(module.default.query);
        } catch (error) {
          console.warn(
            `Failed to load default query for ${currentService.id}:`,
            error
          );
          setQuery('');
        }
      }
    };
    setInitialQuery();
  }, [parameters.query, currentService]);

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
        colors={getPreferredTheme() === 'dark' ? explorerDarkColors : undefined}
      />
      <div style={{ flex: 1 }}>
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
