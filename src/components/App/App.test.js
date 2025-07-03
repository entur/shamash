import React from 'react';
import { render, screen } from '@testing-library/react';
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
  render(
    <App services={services} pathname={pathname} parameters={parameters} />
  );
  // Add a basic assertion to verify the app renders
  expect(document.body).toBeInTheDocument();
});
