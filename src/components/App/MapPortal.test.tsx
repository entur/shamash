import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { afterEach, expect, test, vi } from 'vitest';
import MapPortal from './MapPortal';

afterEach(() => {
  document.getElementById('map-portal-root')?.remove();
});

test('renders into #map-portal-root when show=true and closes', () => {
  const host = document.createElement('div');
  host.id = 'map-portal-root';
  document.body.appendChild(host);
  const onClose = vi.fn();

  render(
    <MapPortal show onClose={onClose}>
      <div>MAP</div>
    </MapPortal>
  );
  expect(screen.getByText('MAP')).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: /Close map/ }));
  expect(onClose).toHaveBeenCalled();
});

test('renders nothing when show=false', () => {
  const host = document.createElement('div');
  host.id = 'map-portal-root';
  document.body.appendChild(host);
  render(
    <MapPortal show={false} onClose={() => {}}>
      <div>MAP</div>
    </MapPortal>
  );
  expect(screen.queryByText('MAP')).not.toBeInTheDocument();
});
