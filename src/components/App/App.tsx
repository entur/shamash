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
  parse,
  print,
  stripIgnoredCharacters,
} from 'graphql';
import queryString from 'query-string';
import graphQLFetcher from '../../utils/graphQLFetcher';
import getPreferredTheme from '../../utils/getPreferredTheme';
import history from '../../utils/history';
const GeocoderModal = lazy(() => import('../GeocoderModal'));
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
import ReactDOM from 'react-dom';

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

      // Use the new parameters for the URL update to avoid stale closure
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

  const handleThemeChange = (theme: string) => {
    window.localStorage.setItem('theme', theme);
    window.location.reload();
  };

  const handleClickPrettifyButton = () => {
    try {
      const currentQueryText = query;
      if (currentQueryText) {
        const prettyQueryText = print(parse(currentQueryText));
        editParameter('query', prettyQueryText);
      }

      if (variables && variables.trim() !== '') {
        const prettyVariablesText = JSON.stringify(
          JSON.parse(variables),
          null,
          2
        );
        editParameter('variables', prettyVariablesText);
      }
    } catch (error) {
      console.warn('Prettify failed:', error);
    }
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
    console.log('Map button clicked, current showMap:', showMap);
    setShowMap((prev) => {
      const newValue = !prev;
      console.log('Setting showMap from', prev, 'to', newValue);
      return newValue;
    });
  };

  const searchForId = () => {
    setShowGeocoderModal(!showGeocoderModal);
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

  // Use useEffect to hide unwanted UI elements and inject custom buttons
  useEffect(() => {
    const hideUnwantedElements = () => {
      // Hide the tabs that show "<untitled>"
      const tabs = document.querySelectorAll('[role="tab"]');
      tabs.forEach((tab) => {
        if (tab.textContent?.includes('untitled') || tab.textContent?.trim() === '') {
          (tab.parentElement as HTMLElement)?.style.setProperty('display', 'none');
        }
      });

      // Hide tab list entirely if it only contains unwanted tabs
      const tabList = document.querySelector('[role="tablist"]');
      if (tabList) {
        const visibleTabs = Array.from(tabList.children).filter(
          (child) => (child as HTMLElement).style.display !== 'none'
        );
        if (visibleTabs.length === 0) {
          (tabList as HTMLElement).style.display = 'none';
        }
      }

      // Inject custom buttons into the topbar (where the logo is)
      const topbar = document.querySelector('.graphiql-logo') ||
                    document.querySelector('.graphiql-container > div:first-child') ||
                    document.querySelector('[class*="logo"]')?.parentElement;

      if (topbar && !topbar.querySelector('.custom-buttons-injected')) {
        // Make sure topbar has proper layout
        const topbarElement = topbar as HTMLElement;
        if (!topbarElement.style.display || topbarElement.style.display === 'block') {
          topbarElement.style.display = 'flex';
          topbarElement.style.alignItems = 'center';
          topbarElement.style.justifyContent = 'space-between';
          topbarElement.style.padding = '8px 16px';
        }

        const customButtonsContainer = document.createElement('div');
        customButtonsContainer.className = 'custom-buttons-injected';
        customButtonsContainer.style.cssText =
          'display: flex; align-items: center; gap: 8px;';

        // Create buttons with proper styling
        const buttons = [
          {
            text: 'Minify',
            onClick: () => handleClickMinifyButton(),
            title: 'Minify Query',
          },
          {
            text: 'Map',
            onClick: () => toggleMap(),
            title: 'Show Map'
          },
          {
            text: 'Search for ID',
            onClick: () => searchForId(),
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
          button.style.cssText = `
            padding: 6px 12px;
            margin-right: 8px;
            border: 1px solid #ccc;
            background: white;
            border-radius: 4px;
            cursor: pointer;
            font-size: 14px;
            font-family: inherit;
          `;
          customButtonsContainer.appendChild(button);
        });

        // Create dropdowns
        const dropdowns = [
          {
            options: services.map((s) => ({ value: s.id, label: s.name })),
            value: currentService?.id || '',
            onChange: (value: string) => handleServiceChange(value),
            title: 'Select Service',
          },
          {
            options: [
              { value: '', label: 'Environment' },
              { value: 'prod', label: 'Prod' },
              { value: 'staging', label: 'Staging' },
              { value: 'dev', label: 'Dev' },
            ],
            onChange: (value: string) => handleEnvironmentChange(value),
            title: 'Environment',
          },
          {
            options: [
              { value: '', label: 'Theme' },
              { value: 'light', label: 'Light' },
              { value: 'dark', label: 'Dark' },
            ],
            onChange: (value: string) => handleThemeChange(value),
            title: 'Theme',
          },
        ];

        dropdowns.forEach(({ options, value, onChange, title }) => {
          const select = document.createElement('select');
          select.className = 'custom-topbar-select';
          select.title = title;
          if (value) select.value = value;
          select.addEventListener('change', (e) => {
            const target = e.target as HTMLSelectElement;
            onChange(target.value);
          });
          select.style.cssText = `
            padding: 6px 8px;
            margin-right: 8px;
            border: 1px solid #ccc;
            border-radius: 4px;
            font-size: 14px;
            background: white;
            font-family: inherit;
            cursor: pointer;
          `;

          options.forEach((option) => {
            const optionEl = document.createElement('option');
            optionEl.value = option.value;
            optionEl.textContent = option.label;
            select.appendChild(optionEl);
          });

          customButtonsContainer.appendChild(select);
        });

        // Add examples dropdown if available
        if (Object.keys(exampleQueries).length > 0) {
          const examplesSelect = document.createElement('select');
          examplesSelect.className = 'custom-topbar-select';
          examplesSelect.title = 'Examples';
          examplesSelect.style.cssText = `
            padding: 6px 8px;
            margin-right: 8px;
            border: 1px solid #ccc;
            border-radius: 4px;
            font-size: 14px;
            background: white;
            font-family: inherit;
            cursor: pointer;
          `;
          examplesSelect.addEventListener('change', (e) => {
            const target = e.target as HTMLSelectElement;
            const key = target.value;
            if (key && exampleQueries[key]) {
              const { query: exampleQuery, variables: exampleVars } =
                exampleQueries[key];
              editParameter('query', exampleQuery);
              if (exampleVars) {
                editParameter('variables', JSON.stringify(exampleVars, null, 2));
              }
            }
          });

          const defaultOption = document.createElement('option');
          defaultOption.value = '';
          defaultOption.textContent = 'Examples';
          examplesSelect.appendChild(defaultOption);

          Object.keys(exampleQueries).forEach((key) => {
            const option = document.createElement('option');
            option.value = key;
            option.textContent = key;
            examplesSelect.appendChild(option);
          });

          customButtonsContainer.appendChild(examplesSelect);
        }

        topbar.appendChild(customButtonsContainer);
      }
    };

    // Run immediately and on a timer to handle dynamic content
    hideUnwantedElements();
    const interval = setInterval(hideUnwantedElements, 500);

    return () => clearInterval(interval);
  }, [
    currentService,
    services,
    exampleQueries,
    handleClickMinifyButton,
    toggleMap,
    searchForId,
    handleServiceChange,
    handleEnvironmentChange,
    handleThemeChange,
  ]);

  if (currentService == null) {
    return <NotFound />;
  }

  return (
    <div className="App">
      <div className="graphiql-wrapper">
        <GraphiQL
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
      {showMap && typeof window !== 'undefined' && document.querySelector('#graphiql-session')
        ? ReactDOM.createPortal(
            <div style={{
              width: '400px',
              borderLeft: '1px solid #ccc',
              display: 'flex',
              flexDirection: 'column',
              backgroundColor: 'white',
              height: '100%',
              minWidth: 0,
              zIndex: 1,
              position: 'relative',
            }}>
              <button
                onClick={() => setShowMap(false)}
                style={{
                  position: 'absolute',
                  top: 8,
                  right: 8,
                  background: 'rgba(255,255,255,0.85)',
                  border: 'none',
                  fontSize: '22px',
                  cursor: 'pointer',
                  zIndex: 2,
                  borderRadius: '50%',
                  width: 32,
                  height: 32,
                  lineHeight: '32px',
                  textAlign: 'center',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.08)'
                }}
                aria-label="Close map"
                title="Close map"
              >
                ×
              </button>
              <div style={{ flex: 1, padding: '16px', minWidth: 0 }}>
                {response ? (
                  <MapView response={response} />
                ) : (
                  <p>No map data available. Please run a GraphQL query that returns geographic data (like journeys, stops, or routes) to see the map visualization.</p>
                )}
              </div>
            </div>,
            document.querySelector('#graphiql-session')
          )
        : null}
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
