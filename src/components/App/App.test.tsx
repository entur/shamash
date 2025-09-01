import React from 'react';
import { render } from '@testing-library/react';
import { App } from './App';
import { expect, test, describe, vi } from 'vitest';
import { ConfigContext } from '../../config/ConfigContext';

vi.mock('../../utils/graphQLFetcher', () => ({
  default: vi.fn(() =>
    vi.fn(() =>
      Promise.resolve({
        data: {},
      })
    )
  ),
}));

vi.mock('graphql', () => ({
  buildClientSchema: vi.fn(() => ({})),
  getIntrospectionQuery: vi.fn(() => 'mock query'),
}));

vi.mock('graphiql', () => ({
  default: () => <div data-testid="graphiql">GraphiQL Mock</div>,
}));

const mockConfig = {
  services: [
    {
      id: 'journey-planner-v3',
      name: 'JourneyPlanner',
      url: 'https://api.example.com/graphql',
      queries: 'journey-planner-v3',
      defaultQuery: 'trip',
    },
  ],
  enturClientName: 'test-client',
};

describe('App', () => {
  test('renders without crashing', () => {
    const { container } = render(
      <ConfigContext.Provider value={mockConfig}>
        <App
          pathname="/journey-planner-v3"
          parameters={{}}
          setParameters={vi.fn()}
        />
      </ConfigContext.Provider>
    );

    expect(container).toBeTruthy();
  });
});
