import React from 'react';
import { mount } from 'enzyme';
import App from './App';

const services = [
  {
    id: 'journey-planner-v3',
    name: 'JourneyPlanner',
    url: 'http://fake.entur.local/journey-planner/v3/graphql',
    queries: 'journey-planner-v3',
    defaultQuery: 'trip',
  },
];

const pathname = '/journey-planner-v3';

const parameters = {};

test('App renders', () => {
  mount(
    <App services={services} pathname={pathname} parameters={parameters} />
  );
});
