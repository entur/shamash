import React, { useState, useRef, useEffect } from "react";
import GraphiQL from "graphiql";
import { parse, print } from "graphql";
import graphQLFetcher from "utils/graphQLFetcher";
import getPreferredTheme from "utils/getPreferredTheme";
import history from "utils/history";
import queryString from "query-string";
import * as journeyplannerQueries from "queries/journey-planner";
import * as nsrQueries from "queries/stop-places";
import "static/css/app.css";
import "graphiql/graphiql.css";
import "static/css/custom.css";

let logo;
if (getPreferredTheme() === "dark") {
  require("static/css/darktheme.css");
  logo = require("static/images/entur-white.png");
} else {
  logo = require("static/images/entur.png");
}

const DEFAULT_SERVICE_ID = "journey-planner";

function App() {
  const [services, setServices] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pathname, setPathname] = useState(history.location.pathname);
  const [parameters, setParameters] = useState(
    queryString.parse(history.location.search)
  );

  let graphiql = useRef(null);

  useEffect(() => {
    fetch("/config.json")
      .then(resp => resp.json())
      .then(services => {
        setServices(services);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    return history.listen(location => {
      setPathname(location.pathname);
      setParameters(queryString.parse(location.search));
    });
  }, []);

  if (loading) {
    return null;
  }

  const currentService =
    services.find(s => pathname.includes(s.id)) ||
    services.find(s => s.id === DEFAULT_SERVICE_ID);

  const handleServiceChange = id => {
    history.push(`/${id}`);
  };

  const editParameter = (key, value) => {
    history.replace({
      search: queryString.stringify({
        ...parameters,
        [key]: value
      })
    });
  };

  const handleEnvironmentChange = () => {};

  const handleThemeChange = theme => {
    window.localStorage.setItem("theme", theme);
    window.location.reload();
  };

  const handleClickPrettifyButton = () => {
    if (!graphiql) return;
    const editor = graphiql.current.getQueryEditor();
    const currentText = editor.getValue();
    const prettyText = print(parse(currentText));
    editor.setValue(prettyText);
  };

  const handleHistoryButton = () => {
    if (!graphiql) return;
    graphiql.current.setState({
      historyPaneOpen: !graphiql.current.state.historyPaneOpen
    });
  };

  const renderExamplesMenu = () => {
    let queries;

    if (currentService.queries === "journey-planner") {
      queries = journeyplannerQueries;
    } else if (currentService.queries === "stop-places") {
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
            onSelect={() => editParameter("query", value)}
          />
        ))}
      </GraphiQL.Menu>
    );
  };

  const searchForId = () => {};

  const {
    query = currentService
      ? require(`queries/${currentService.queries}/${currentService.defaultQuery}`)
          .default
      : "",
    variables,
    operationName
  } = parameters;

  return (
    <div className="App">
      <GraphiQL
        ref={graphiql}
        fetcher={graphQLFetcher(currentService.url)}
        query={query}
        variables={variables}
        operationName={operationName}
        onEditQuery={value => editParameter("query", value)}
        onEditVariables={value => editParameter("variables", value)}
        onEditOperationName={value => editParameter("operationName", value)}
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
            onClick={() => {
              handleHistoryButton();
            }}
            label="History"
            title="Show History"
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
              onSelect={() => handleEnvironmentChange("prod")}
            />
            <GraphiQL.MenuItem
              label="Staging"
              title="Staging"
              onSelect={() => handleEnvironmentChange("staging")}
            />
            <GraphiQL.MenuItem
              label="Dev"
              title="Dev"
              onSelect={() => handleEnvironmentChange("dev")}
            />
          </GraphiQL.Menu>

          {renderExamplesMenu()}

          <GraphiQL.Menu label="Theme" title="Theme">
            <GraphiQL.MenuItem
              label="Light"
              title="Light"
              onSelect={() => handleThemeChange("light")}
            />
            <GraphiQL.MenuItem
              label="Dark"
              title="Dark"
              onSelect={() => handleThemeChange("dark")}
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
      </GraphiQL>
    </div>
  );
}

export default App;
