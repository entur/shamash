import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { expect, test, vi } from 'vitest';
import AppToolbar from './AppToolbar';

const services = [
  { id: 'journey-planner-v3', name: 'JourneyPlanner' },
  { id: 'mobility-v2', name: 'Mobility' },
];

test('renders controls and fires callbacks', () => {
  const onServiceChange = vi.fn();
  const onToggleMap = vi.fn();
  render(
    <AppToolbar
      logoSrc="logo.png"
      services={services}
      currentServiceId="journey-planner-v3"
      onServiceChange={onServiceChange}
      onEnvironmentChange={vi.fn()}
      exampleKeys={['trip', 'nearest']}
      onExampleSelect={vi.fn()}
      onToggleMap={onToggleMap}
      onSearchForId={vi.fn()}
      currentTheme="light"
      onThemeChange={vi.fn()}
    />
  );
  fireEvent.click(screen.getByRole('button', { name: /Map/ }));
  expect(onToggleMap).toHaveBeenCalled();

  fireEvent.click(screen.getByRole('button', { name: /Service/ }));
  fireEvent.click(screen.getByRole('menuitem', { name: /Mobility/ }));
  expect(onServiceChange).toHaveBeenCalledWith('mobility-v2');
});
