import React, { useState, useRef } from "react";
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

function App() {
  const [parameters, setParameters] = useState(getQueryParameters());

  let graphiql = useRef(null);

  const updateURL = () => {
    let newSearch = Object.keys(parameters)
      .filter(key => Boolean(parameters[key]))
      .map(
        key =>
          encodeURIComponent(key) + "=" + encodeURIComponent(parameters[key])
      )
      .join("&");
    window.history.replaceState(null, null, "?" + newSearch);
  };

  const editParameter = (key, value) => {
    setParameters({ ...parameters, [key]: value });
    updateURL();
  };

  const handleServiceChange = () => {};
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
        fetcher={graphQLFetcher}
        query={parameters.query}
        variables={parameters.variables}
        operationName={parameters.operationName}
        onEditQuery={value => editParameter("query", value)}
        onEditVariables={value => editParameter("variables", value)}
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
            <GraphiQL.MenuItem
              label="JourneyPlanner"
              title="JourneyPlanner"
              onSelect={() => handleServiceChange("journey-planner")}
            />
            <GraphiQL.MenuItem
              label="NSR"
              title="NSR"
              onSelect={() => handleServiceChange("stop-places")}
            />
            <GraphiQL.MenuItem
              label="Raptor"
              title="Raptor"
              onSelect={() => handleServiceChange("raptor")}
            />
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
