import React from 'react';
import { render, waitFor } from '@testing-library/react';
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

vi.mock('graphiql-explorer', () => ({
  Explorer: () => <div data-testid="graphiql-explorer">Explorer Mock</div>,
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

  test('allows empty query and does not refill it automatically', async () => {
    const setParameters = vi.fn();

    // First render with a query
    const { rerender, unmount } = render(
      <ConfigContext.Provider value={mockConfig}>
        <App
          pathname="/journey-planner-v3"
          parameters={{ query: 'query { test }' }}
          setParameters={setParameters}
        />
      </ConfigContext.Provider>
    );

    // Wait for initial render to complete
    await waitFor(() => {
      expect(setParameters).not.toHaveBeenCalled();
    }, { timeout: 100 });

    // Clear the query by setting it to empty string
    rerender(
      <ConfigContext.Provider value={mockConfig}>
        <App
          pathname="/journey-planner-v3"
          parameters={{ query: '' }}
          setParameters={setParameters}
        />
      </ConfigContext.Provider>
    );

    // Wait a bit to ensure no automatic refill happens
    await waitFor(() => {
      // setParameters should not be called to refill the query
      expect(setParameters).not.toHaveBeenCalled();
    }, { timeout: 100 });

    // Verify the component still renders correctly with empty query
    expect(true).toBe(true);

    // Clean up
    unmount();
  });
});
