import { expect, test } from 'vitest';
import { createInMemoryStorage } from './inMemoryStorage';

test('implements the Storage interface without touching localStorage', () => {
  const s = createInMemoryStorage();
  expect(s.getItem('x')).toBeNull();
  s.setItem('x', '1');
  expect(s.getItem('x')).toBe('1');
  expect(s.length).toBe(1);
  s.removeItem('x');
  expect(s.getItem('x')).toBeNull();
  s.setItem('a', '1');
  s.clear();
  expect(s.length).toBe(0);
});
