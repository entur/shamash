import React, { useState, useRef, useEffect } from "react";
import GraphiQL from "graphiql";
import { parse, print } from "graphql";
import graphQLFetcher from "utils/graphQLFetcher";
import getPreferredTheme from "utils/getPreferredTheme";
import { getQueryParameters } from "utils";
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

const updateURL = parameters => {
  let newSearch = Object.keys(parameters)
    .filter(key => Boolean(parameters[key]))
    .map(
      key => encodeURIComponent(key) + "=" + encodeURIComponent(parameters[key])
    )
    .join("&");
  window.history.replaceState(null, null, "?" + newSearch);
};

const parametersUpdater = ([parameters, setParameters]) => (key, value) => {
  const newParameters = { ...parameters, [key]: value };
  setParameters(newParameters);
  updateURL(newParameters);
};

function App() {
  const [parameters, setParameters] = useState(getQueryParameters());
  const editParameter = parametersUpdater([parameters, setParameters]);
  const [services, setServices] = useState(null);
  const [currentService, setCurrentService] = useState(null);
  const [loading, setLoading] = useState(true);

  let graphiql = useRef(null);

  useEffect(() => {
    fetch("/config.json")
      .then(resp => resp.json())
      .then(services => {
        setServices(services);
        setCurrentService(services.find(s => s.id === DEFAULT_SERVICE_ID));
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (currentService) {
      editParameter("service", currentService.id);
    }
  }, [currentService]);

  if (loading) {
    return null;
  }

  const handleServiceChange = id => {
    const service = services.find(s => s.id === id);
    setCurrentService(service);
    editParameter("service", service.id);
    editParameter("query", service.defaultQuery);
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

  const renderExamplesMenu = () => {};
  const searchForId = () => {};

  return (
    <div className="App">
      <GraphiQL
        ref={graphiql}
        fetcher={graphQLFetcher(currentService.url)}
        query={parameters.query}
        variables={parameters.variables}
        operationName={parameters.operationName}
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
