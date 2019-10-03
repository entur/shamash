import React, {useState, useEffect} from 'react';
import GraphiQL  from 'graphiql';
import { parse, print } from 'graphql';
import cfgreader from '../config/readConfig';
import '../css/app.css';
import '../css/graphiql.css';
import '../css/custom.css';
import { getQueryParameters } from '../utils/';
import graphQLFetcher from '../utils/graphQLFetcher';

import * as journeyplannerQueries from '../queries/journeyplanner';
import * as nsrQueries from '../queries/nsr';

import GeocoderModal from './GeocoderModal';

let logo;
if (window.localStorage.getItem('theme') === 'dark') {
    require('../css/darktheme.css');
    logo = require('../static/img/entur-white.png')
} else {
    logo = require('../static/img/entur.png')
}

const App = () => {
    const [parameters, setParameters] = useState(getQueryParameters());
    const [isConfigLoaded, setIsConfigLoaded] = useState(false);
    const [showGeocoderModal, setShowGeocoderModal] = useState(false);
    let graphiql;

    if (window.localStorage) {
        localStorage.removeItem('graphiql:query');
    }

    useEffect(() => {
        cfgreader.readConfig(config => {
            console.info('loaded config', config);
            window.config = config;
            setIsConfigLoaded(true)
        });
    }, [cfgreader, setIsConfigLoaded, window]);

    const updateURL = ()=>{
        let newSearch = Object.keys(parameters)
            .filter(key => Boolean(parameters[key]))
            .map(key => encodeURIComponent(key) + '=' + encodeURIComponent(parameters[key]))
            .join('&');
        history.replaceState(null, null, '?' + newSearch);
    };

    const onEditQuery = (query) => {
        setParameters({ ...parameters, query});
        this.updateURL();
    };

    const onEditVariables = (variables)=>{
        setParameters({ ...parameters, variables});
        this.updateURL();
    };

    const onEditOperationName = (operationName)=>{
        setParameters({ ...parameters, operationName});
        this.updateURL();
    };

    const getDefaultQuery = () => {
        if (!window.config) return;
        if (window.config.serviceName === 'JourneyPlanner') {
            return journeyplannerQueries.tripQuery;
        }
        return nsrQueries.topographicPlaceQuery;
    };

    const handleClickPrettifyButton = ()=>{
        if (!graphiql) return;
        const editor = graphiql.getQueryEditor();
        const currentText = editor.getValue();
        const prettyText = print(parse(currentText));
        editor.setValue(prettyText);
    };

    const handleHistoryButton = () => {
        if (!graphiql) return;
        graphiql.setState({
            historyPaneOpen: !graphiql.state.historyPaneOpen,
        });
    };

    const handleServiceChange = (service) => {
        let newPathName;
        switch (service) {
            case 'journey-planner':
                newPathName = '/journey-planner/v2/ide';
                break;
            case 'stop-places':
                newPathName = '/stop-places/v1/ide';
                break;
            case 'raptor':
                newPathName = '/journey-planner/v2/raptor/ide';
                break;
            default: // need for good performance
        }
        window.location.href = `${window.location.origin}${newPathName}${window.location.search}`;
    };

    const handleEnvironmentChange = (env) => {
        const newOrigin = env === 'prod' ? 'https://api.entur.io' : `https://api.${env}.entur.io`;
        window.location.href = `${newOrigin}${window.location.pathname}${window.location.search}`;
    };

    const handleThemeChange = (theme) => {
        window.localStorage.setItem('theme', theme);
        window.location.reload();
    };
    const searchForId = () => {
        setShowGeocoderModal( !showGeocoderModal);
    };

    const renderExamplesMenu = () => {
        const isJourneyPlanner = window.config.serviceName === 'JourneyPlanner';
        const queries = isJourneyPlanner ? journeyplannerQueries : nsrQueries;
        const menuEntries = Object.entries(queries);

        return (
            <GraphiQL.Menu label="Examples" title="Examples">
                { menuEntries.map(([ key, value ]) => (
                    <GraphiQL.MenuItem
                        key={key}
                        label={key}
                        title={key}
                        onSelect={() => onEditQuery(value)}
                    />
                ))}
            </GraphiQL.Menu>
        )
    };

        if (!isConfigLoaded) {
            return <div>Loading ...</div>;
        }

        return (
            <div>
                <div className="label">
                    {window.config.serviceName}
                </div>
                <GraphiQL
                    ref={c => {
                        graphiql = c;
                    }}
                    fetcher={graphQLFetcher}
                    query={parameters.query}
                    variables={parameters.variables}
                    operationName={parameters.operationName}
                    onEditQuery={()=>onEditQuery()}
                    onEditVariables={()=>onEditVariables()}
                    onEditOperationName={()=>onEditOperationName()}
                    defaultQuery={getDefaultQuery()}
                >
                    <GraphiQL.Logo>
                        <img alt="logo" src={logo} className="logo" />
                    </GraphiQL.Logo>
                    <GraphiQL.Toolbar>
                        <GraphiQL.Button
                            onClick={()=>handleClickPrettifyButton()}
                            label="Prettify"
                            title="Prettify Query (Shift-Ctrl-P)"
                        />

                        <GraphiQL.Button
                            onClick={handleHistoryButton.bind(this)}
                            label="History"
                            title="Show History"
                        />

                        <GraphiQL.Menu label="Service" title="Service">
                            <GraphiQL.MenuItem label="JourneyPlanner" title="JourneyPlanner" onSelect={() => handleServiceChange('journey-planner')} />
                            <GraphiQL.MenuItem label="NSR" title="NSR" onSelect={() => handleServiceChange('stop-places')} />
                            <GraphiQL.MenuItem label="Raptor" title="Raptor" onSelect={() => handleServiceChange('raptor')} />
                        </GraphiQL.Menu>

                        <GraphiQL.Menu label="Environment" title="Environment">
                            <GraphiQL.MenuItem label="Prod" title="Prod" onSelect={() => handleEnvironmentChange('prod')} />
                            <GraphiQL.MenuItem label="Staging" title="Staging" onSelect={() => handleEnvironmentChange('staging')} />
                            <GraphiQL.MenuItem label="Dev" title="Dev" onSelect={() => handleEnvironmentChange('dev')} />
                        </GraphiQL.Menu>

                        { renderExamplesMenu() }

                        <GraphiQL.Menu label="Theme" title="Theme">
                            <GraphiQL.MenuItem label="Light" title="Light" onSelect={() => handleThemeChange('light')} />
                            <GraphiQL.MenuItem label="Dark" title="Dark" onSelect={() => handleThemeChange('dark')} />
                        </GraphiQL.Menu>

                        <GraphiQL.Button
                            onClick={searchForId.bind(this)}
                            label="Search for ID"
                            title="Search for ID"
                        />
                    </GraphiQL.Toolbar>
                </GraphiQL>
                { showGeocoderModal ? <GeocoderModal onDismiss={() => setShowGeocoderModal(false )} /> : null }
            </div>
        );
};

export default App;
