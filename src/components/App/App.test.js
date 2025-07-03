import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
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

test('App renders', async () => {
  render(
    <App services={services} pathname={pathname} parameters={parameters} />
  );
  // Add a basic assertion to verify the app renders
  await waitFor(() => expect(document.body).toBeInTheDocument());
});
