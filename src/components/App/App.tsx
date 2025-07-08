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
      setResponse(res);
      return res;
    },
    [fetcher]
  );

  // Configure the explorer plugin
  const explorer = useMemo(() => explorerPlugin(), []);

  if (currentService == null) {
    return <NotFound />;
  }

  return (
    <div className="App graphiql-container">
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
      />
      {showGeocoderModal ? (
        <Suspense fallback={<div>Loading...</div>}>
          <GeocoderModal onDismiss={() => setShowGeocoderModal(false)} />
        </Suspense>
      ) : null}
      {showMap ? <MapView response={response} /> : null}
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
