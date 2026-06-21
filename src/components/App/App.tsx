import React, {
  Suspense,
  lazy,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { GraphiQL } from 'graphiql';
import { explorerPlugin } from '@graphiql/plugin-explorer';
import {
  buildClientSchema,
  getIntrospectionQuery,
  GraphQLSchema,
} from 'graphql';
import queryString from 'query-string';
import graphQLFetcher from '../../utils/graphQLFetcher';
import getPreferredTheme from '../../utils/getPreferredTheme';
import { createInMemoryStorage } from '../../utils/inMemoryStorage';
import history from '../../utils/history';
const GeocoderModal = lazy(() => import('../GeocoderModal'));
import './custom.css';
import findServiceName from '../../utils/findServiceName';

import 'graphiql/style.css';
import '@graphiql/plugin-explorer/style.css';

import MapView from '../MapView';
import MapPortal from './MapPortal';
import AppToolbar from './AppToolbar';

import whiteLogo from '../../static/images/entur-white.png';
import normalLogo from '../../static/images/entur.png';

import { NotFound } from './404';

import {
  ConfigContext,
  useConfig,
  useFetchConfig,
} from '../../config/ConfigContext';

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
  const [currentTheme, setCurrentTheme] = useState<string>(getPreferredTheme());
  const [query, setQuery] = useState('');
  const hasInitializedQuery = useRef(false);
  const loadedExampleQuery = useRef<string | null>(null);
  const loadedExampleVariables = useRef<string | null>(null);

  const serviceName = findServiceName(pathname, BASE_PATH);

  const explorer = useMemo(() => explorerPlugin(), []);
  const graphiqlStorage = useMemo(() => createInMemoryStorage(), []);
  const [queryInitialized, setQueryInitialized] = useState(false);

  // Load dark theme CSS once and toggle with body class
  useEffect(() => {
    // Import dark theme CSS once on component mount
    import('../../darktheme.css');

    // Apply or remove dark theme class based on current theme
    if (currentTheme === 'dark') {
      document.body.classList.add('dark-theme');
    } else {
      document.body.classList.remove('dark-theme');
    }
  }, [currentTheme]);

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

  const fetcher = useMemo(() => {
    if (!currentService) return null;

    return graphQLFetcher(
      currentService.url,
      currentService.subscriptionsUrl,
      enturClientName
    );
  }, [currentService, enturClientName]);

  useEffect(() => {
    fetcher &&
      fetcher({
        query: getIntrospectionQuery(),
      }).then((result) => {
        setSchema(buildClientSchema(result.data));
      });
  }, [fetcher]);

  const handleServiceChange = (id: string) => {
    // For development with Vite, use simple relative paths
    // For production, handle base path correctly
    const basePath = import.meta.env.BASE_URL || '/';

    // Use window.location for proper navigation instead of custom history
    window.location.href = basePath === '/' ? `/${id}` : `${basePath}${id}`;
  };

  const editParameter = (key: string, value: any) => {
    setParameters((prevParameters: Record<string, any>) => {
      const newParameters = {
        ...prevParameters,
        [key]: value,
      };

      // Check if this is the same value that was loaded from an example
      const isLoadedExampleValue =
        (key === 'query' && value === loadedExampleQuery.current) ||
        (key === 'variables' && value === loadedExampleVariables.current);

      // Skip URL update if this is just the initial load from example
      if (!isLoadedExampleValue) {
        // User made an actual edit - clear example refs and update URL
        if (key === 'query') {
          loadedExampleQuery.current = null;
        }
        if (key === 'variables') {
          loadedExampleVariables.current = null;
        }

        // Remove example param and show full query/variables
        const urlParameters = { ...newParameters };
        delete urlParameters.example;
        history.replace({
          search: queryString.stringify(urlParameters),
        });
      }

      return newParameters;
    });
  };

  const handleEnvironmentChange = (env: string) => {
    if (window.location.host.includes('localhost')) {
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

  const handleThemeChange = (theme: string) => {
    window.localStorage.setItem('theme', theme);
    setCurrentTheme(theme);
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
        let module;
        const modules = await import.meta.glob('../../queries/**/index.ts');
        const path = `../../queries/${currentService.queries}/index.ts`;
        module = await modules[path]();
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

  const handleExampleSelect = (exampleKey: string) => {
    // Navigate to short URL for the example
    const basePath = import.meta.env.BASE_URL || '/';
    const serviceId = currentService?.id || DEFAULT_SERVICE_ID;
    const url =
      basePath === '/'
        ? `/${serviceId}?example=${exampleKey}`
        : `${basePath}${serviceId}?example=${exampleKey}`;
    window.location.href = url;
  };

  const searchForId = () => {
    setShowGeocoderModal(!showGeocoderModal);
  };

  useEffect(() => {
    const setInitialQuery = async () => {
      const urlQuery = parameters.query;
      const exampleKey = parameters.example as string | undefined;

      if (urlQuery) {
        // Explicit query parameter takes precedence
        setQuery(urlQuery);
        setQueryInitialized(true);
        hasInitializedQuery.current = true;
      } else if (exampleKey && currentService && !hasInitializedQuery.current) {
        // Load example query by key from URL (e.g., ?example=tripQuery)
        // Keep short URL in address bar - only expands when user makes edits
        try {
          const modules = await import.meta.glob('../../queries/**/index.ts');
          const path = `../../queries/${currentService.queries}/index.ts`;
          const module = (await modules[path]()) as Record<
            string,
            { query: string; variables?: object }
          >;

          const exampleQuery = module[exampleKey];
          if (exampleQuery) {
            // Store loaded values to detect when user makes actual edits
            loadedExampleQuery.current = exampleQuery.query;
            setQuery(exampleQuery.query);
            if (exampleQuery.variables) {
              const variablesJson = JSON.stringify(
                exampleQuery.variables,
                null,
                2
              );
              loadedExampleVariables.current = variablesJson;
              // Set variables in state without updating URL (keeps short URL)
              setParameters((prev) => ({
                ...prev,
                variables: variablesJson,
              }));
            }
          } else {
            console.warn(
              `Example query "${exampleKey}" not found for ${currentService.queries}`
            );
            // Fall back to default query
            const defaultModules = await import.meta.glob(
              '../../queries/**/*.ts'
            );
            const defaultPath = `../../queries/${currentService.queries}/${currentService.defaultQuery}.ts`;
            const defaultModule = (await defaultModules[defaultPath]()) as {
              default: { query: string };
            };
            setQuery(defaultModule.default.query);
          }
        } catch (error) {
          console.warn(`Failed to load example query "${exampleKey}":`, error);
          setQuery('');
        }
        setQueryInitialized(true);
        hasInitializedQuery.current = true;
      } else if (currentService && !hasInitializedQuery.current) {
        // Only load default query on initial load, not when user clears the query
        try {
          let module;
          const modules = await import.meta.glob('../../queries/**/*.ts');
          const path = `../../queries/${currentService.queries}/${currentService.defaultQuery}.ts`;
          module = await modules[path]();
          setQuery(module.default.query);
        } catch (error) {
          console.warn(
            `Failed to load default query for ${currentService.id}:`,
            error
          );
          setQuery('');
        }
        setQueryInitialized(true);
        hasInitializedQuery.current = true;
      } else if (urlQuery === '' && hasInitializedQuery.current) {
        // Allow empty query if user has cleared it
        setQuery('');
        setQueryInitialized(true);
      }
    };
    setInitialQuery();
  }, [parameters.query, parameters.example, currentService, setParameters]);

  const { variables, operationName } = parameters;

  // Custom fetcher that handles subscription lifecycle
  const customFetcher = useCallback(
    (graphQLParams: any) => {
      const result = fetcher(graphQLParams);

      // Handle regular queries/mutations (promises)
      if (result && typeof result.then === 'function') {
        result.then((res) => setResponse(res));
        return result;
      }

      // Handle subscriptions (observables)
      if (result && typeof result.subscribe === 'function') {
        return {
          subscribe: (observer) => {
            const subscription = result.subscribe({
              next: (data) => {
                setResponse(data); // Update response state with subscription data
                observer.next(data);
              },
              error: (error) => {
                observer.error(error);
              },
              complete: () => {
                observer.complete();
              },
            });

            return subscription;
          },
        };
      }

      return result;
    },
    [fetcher]
  );

  const exampleKeys = Object.keys(exampleQueries || {});

  if (currentService == null) {
    return <NotFound />;
  }

  return (
    <div className="App">
      <AppToolbar
        logoSrc={currentTheme === 'dark' ? whiteLogo : normalLogo}
        services={services}
        currentServiceId={currentService.id}
        onServiceChange={handleServiceChange}
        onEnvironmentChange={handleEnvironmentChange}
        exampleKeys={exampleKeys}
        onExampleSelect={handleExampleSelect}
        onToggleMap={toggleMap}
        onSearchForId={searchForId}
        currentTheme={currentTheme}
        onThemeChange={handleThemeChange}
      />
      <div className="graphiql-wrapper">
        {queryInitialized ? (
          /* GraphiQL 5 reads initialQuery/initialVariables once at mount (uncontrolled
            store). Deep-links work because service/example/env changes hard-reload the
            page. NOTE: browser back/forward that changes ?query in place is NOT reflected
            in the editor without a remount. Do NOT add key={query} — query state changes
            on every keystroke and that would remount on each character. A correct fix keys
            on a stable navigation identity; deferred. */
          <GraphiQL
            fetcher={customFetcher}
            schema={schema}
            plugins={[explorer]}
            storage={graphiqlStorage}
            forcedTheme={currentTheme === 'dark' ? 'dark' : 'light'}
            initialQuery={query}
            initialVariables={variables}
            operationName={operationName}
            onEditQuery={(value) => editParameter('query', value)}
            onEditVariables={(value) => editParameter('variables', value)}
            onEditOperationName={(value) =>
              editParameter('operationName', value)
            }
          >
            <GraphiQL.Logo>
              <img
                alt="logo"
                src={currentTheme === 'dark' ? whiteLogo : normalLogo}
                className="logo"
              />
            </GraphiQL.Logo>
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
        ) : (
          <div className="graphiql-loading">Loading…</div>
        )}
        <div id="map-portal-root" />
      </div>
      {showGeocoderModal ? (
        <Suspense fallback={<div>Loading...</div>}>
          <GeocoderModal onDismiss={() => setShowGeocoderModal(false)} />
        </Suspense>
      ) : null}
      <MapPortal show={showMap} onClose={() => setShowMap(false)}>
        {response ? (
          <MapView response={response} />
        ) : (
          <p>
            No map data available. Run a query that returns geographic data to
            see the map.
          </p>
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
