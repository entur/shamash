import React, {
  Suspense,
  lazy,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { GraphiQL } from 'graphiql';
import { explorerPlugin } from '@graphiql/plugin-explorer';
import {
  buildClientSchema,
  getIntrospectionQuery,
  GraphQLSchema,
  stripIgnoredCharacters,
} from 'graphql';
import queryString from 'query-string';
import graphQLFetcher from '../../utils/graphQLFetcher';
import getPreferredTheme from '../../utils/getPreferredTheme';
import history from '../../utils/history';
const GeocoderModal = lazy(() => import('../GeocoderModal'));
import MapPortal from './MapPortal';
import './custom.css';
import findServiceName from '../../utils/findServiceName';

import 'graphiql/graphiql.css';

import MapView from '../MapView';

import whiteLogo from '../../static/images/entur-white.png';
import normalLogo from '../../static/images/entur.png';

import { NotFound } from './404';

import {
  ConfigContext,
  useConfig,
  useFetchConfig,
} from '../../config/ConfigContext';
import { createRoot } from 'react-dom/client';
import CustomDropdown from './CustomDropdown';

const BASE_PATH = process.env.PUBLIC_URL || '';
const DEFAULT_SERVICE_ID = 'journey-planner-v3';

interface AppProps {
  pathname: string;
  parameters: Record<string, any>;
  setParameters: (
    params:
      | Record<string, any>
      | ((prev: Record<string, any>) => Record<string, any>)
  ) => void;
}

export const App: React.FC<AppProps> = ({
  pathname,
  parameters,
  setParameters,
}) => {
  const { services, enturClientName } = useConfig();
  const [showGeocoderModal, setShowGeocoderModal] = useState<boolean>(false);
  const [schema, setSchema] = useState<GraphQLSchema | undefined>();
  const [showMap, setShowMap] = useState<boolean>(false);
  const [response, setResponse] = useState<any>();

  const serviceName = findServiceName(pathname, BASE_PATH);

  // Load dark theme CSS dynamically when dark theme is selected
  useEffect(() => {
    const isDarkTheme = getPreferredTheme() === 'dark';

    if (isDarkTheme) {
      import('../../darktheme.css');
    } else {
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
      const basePath = import.meta.env.BASE_URL || '/';
      const newPath =
        basePath === '/'
          ? `/${DEFAULT_SERVICE_ID}`
          : `${basePath}${DEFAULT_SERVICE_ID}`;
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
    if (fetcher) {
      fetcher({
        query: getIntrospectionQuery(),
      }).then((result) => {
        setSchema(buildClientSchema(result.data));
      });
    }
  }, [fetcher]);

  const editParameter = (key: string, value: any) => {
    setParameters((prevParameters: Record<string, any>) => {
      const newParameters = {
        ...prevParameters,
        [key]: value,
      };

      history.replace({
        search: queryString.stringify(newParameters),
      });

      return newParameters;
    });
  };

  const [query, setQuery] = useState('');

  useEffect(() => {
    const setInitialQuery = async () => {
      const urlQuery = parameters.query;
      if (urlQuery) {
        setQuery(urlQuery);
      } else if (currentService) {
        try {
          const modules = await import.meta.glob('../../queries/**/*.ts');
          const path = `../../queries/${currentService.queries}/${currentService.defaultQuery}.ts`;
          let module = await modules[path]();
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
    async (params: any) => {
      const res = await fetcher(params);
      // Only set response for non-introspection queries that might have map data
      if (!params.query?.includes('__schema') && !params.query?.includes('IntrospectionQuery')) {
        setResponse(res);
      }
      return res;
    },
    [fetcher]
  );

  // Configure the explorer plugin
  const explorer = useMemo(() => explorerPlugin(), []);

  const handleServiceChange = (id: string) => {
    const basePath = import.meta.env.BASE_URL || '/';
    window.location.href = basePath === '/' ? `/${id}` : `${basePath}${id}`;
  };

  const handleEnvironmentChange = (env: string) => {
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

  const redirectHost = (host: string) => {
    window.location.href = `${window.location.protocol}//${host}${window.location.pathname}${window.location.search}`;
  };

  const handleClickMinifyButton = () => {
    try {
      const currentQueryText = query;
      if (currentQueryText) {
        const uglyQueryText = stripIgnoredCharacters(currentQueryText);
        editParameter('query', uglyQueryText);
      }

      if (variables && variables.trim() !== '') {
        const uglyVariablesText = JSON.stringify(JSON.parse(variables));
        editParameter('variables', uglyVariablesText);
      }
    } catch (error) {
      console.warn('Minify failed:', error);
    }
  };

  const toggleMap = () => {
    setShowMap((prev) => !prev);
  };

  const searchForId = () => {
    setShowGeocoderModal(!showGeocoderModal);
  };

  // Use useEffect to hide unwanted UI elements and inject custom buttons
  useEffect(() => {
    const addCustomTopbarButtons = async () => {
      // Load example queries dynamically when service changes
      let loadedExampleQueries = {};
      if (currentService?.queries) {
        try {
          const modules = await import.meta.glob('../../queries/**/index.ts');
          const path = `../../queries/${currentService.queries}/index.ts`;
          loadedExampleQueries = await modules[path]();
        } catch (error) {
          console.warn(
            `Failed to load example queries for ${currentService.queries}:`,
            error
          );
        }
      }

      const topbar = document.querySelector('.graphiql-session-header-right');

      if (topbar && !topbar.querySelector('.custom-buttons-injected')) {
        // Remove any previously injected container
        const prev = topbar.querySelector('.custom-buttons-injected');
        if (prev) prev.remove();

        const customButtonsContainer = document.createElement('div');
        customButtonsContainer.className = 'custom-buttons-injected';

        // Create buttons with proper styling
        const buttons = [
          {
            text: 'Minify',
            onClick: handleClickMinifyButton,
            title: 'Minify Query',
          },
          {
            text: 'Map',
            onClick: toggleMap,
            title: 'Show Map',
          },
          {
            text: 'Search for ID',
            onClick: searchForId,
            title: 'Search for ID',
          },
        ];

        buttons.forEach(({ text, onClick, title }) => {
          const button = document.createElement('button');
          button.className = 'custom-topbar-button';
          button.textContent = text;
          button.title = title;
          button.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            onClick();
          });
          customButtonsContainer.appendChild(button);
        });

        // Replace the Service dropdown with the custom ServiceDropdown component
        const serviceOptions = services.map((s) => ({ value: s.id, label: s.name }));
        const serviceDropdown = document.createElement('div');
        serviceDropdown.className = 'custom-service-dropdown-wrapper';
        customButtonsContainer.appendChild(serviceDropdown);
        createRoot(serviceDropdown).render(
          <CustomDropdown
            options={serviceOptions}
            selected={serviceName || currentService?.id || ''}
            onChange={handleServiceChange}
            label="Service"
          />,
        );

        // Replace the Environment dropdown with the custom CustomDropdown component
        const environmentOptions = [
          { value: 'prod', label: 'Prod' },
          { value: 'staging', label: 'Staging' },
          { value: 'dev', label: 'Dev' },
        ];
        const environmentDropdown = document.createElement('div');
        environmentDropdown.className = 'custom-environment-dropdown-wrapper';
        customButtonsContainer.appendChild(environmentDropdown);
        createRoot(environmentDropdown).render(
          <CustomDropdown
            options={environmentOptions}
            selected={''}
            onChange={handleEnvironmentChange}
            label="Environment"
          />,
        );

        // Add Examples dropdown if available
        if (Object.keys(loadedExampleQueries).length > 0) {
          const examplesDropdown = document.createElement('div');
          examplesDropdown.className = 'custom-examples-dropdown-wrapper';
          customButtonsContainer.appendChild(examplesDropdown);
          createRoot(examplesDropdown).render(
            <CustomDropdown
              options={Object.keys(loadedExampleQueries).map((key) => ({ value: key, label: key }))}
              selected={''}
              onChange={(value: string) => {
                if (value && loadedExampleQueries[value]) {
                  const { query: exampleQuery, variables: exampleVars } = loadedExampleQueries[value];
                  editParameter('query', exampleQuery);
                  if (exampleVars) {
                    editParameter('variables', JSON.stringify(exampleVars, null, 2));
                  }
                }
              }}
              label="Examples"
            />
          );
        }

        topbar.appendChild(customButtonsContainer);
      }
    };

    addCustomTopbarButtons();
    return () => {};
  }, [
    currentService,
    services,
    serviceName
  ]);

  if (currentService == null) {
    return <NotFound />;
  }

  return (
    <div className="App">
      <div className="graphiql-wrapper">
        <GraphiQL
          disableTabs={true}
          fetcher={customFetcher}
          query={query}
          variables={variables}
          operationName={operationName}
          onEditQuery={(value) => editParameter('query', value)}
          onEditVariables={(value) => editParameter('variables', value)}
          onEditOperationName={(value) => editParameter('operationName', value)}
          plugins={[explorer]}
          schema={schema}
        >
          <GraphiQL.Logo>
            <img
              alt="EnTur logo"
              src={getPreferredTheme() === 'dark' ? whiteLogo : normalLogo}
              className="logo"
            />
          </GraphiQL.Logo>
        </GraphiQL>
      </div>
      {showGeocoderModal ? (
        <Suspense fallback={<div>Loading...</div>}>
          <GeocoderModal onDismiss={() => setShowGeocoderModal(false)} />
        </Suspense>
      ) : null}
      <MapPortal show={showMap} onClose={() => setShowMap(false)} response={response}>
        {response ? (
          <MapView response={response} />
        ) : (
          <p>No map data available. Please run a GraphQL query that returns geographic data (like journeys, stops, or routes) to see the map visualization.</p>
        )}
      </MapPortal>
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
