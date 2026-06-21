import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { expect, test, vi } from 'vitest';
import CustomDropdown from './CustomDropdown';

test('opens on click and fires onChange with the selected value', () => {
  const onChange = vi.fn();
  render(
    <CustomDropdown
      label="Service"
      selected="a"
      onChange={onChange}
      options={[
        { value: 'a', label: 'Alpha' },
        { value: 'b', label: 'Beta' },
      ]}
    />
  );
  fireEvent.click(screen.getByRole('button', { name: /Service/ }));
  fireEvent.click(screen.getByRole('option', { name: /Beta/ }));
  expect(onChange).toHaveBeenCalledWith('b');
});
