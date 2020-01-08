import React from 'react';
import { mount } from 'enzyme';
import App from './App';

const services = [
  {
    id: 'journey-planner',
    name: 'JourneyPlanner',
    url: 'http://fake.entur.local/journey-planner/v2/graphql',
    queries: 'journey-planner',
    defaultQuery: 'trip'
  }
];

const pathname = '/journey-planner';

const parameters = {};

test('App renders', () => {
  mount(
    <App services={services} pathname={pathname} parameters={parameters} />
  );
});
