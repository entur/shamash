import findServiceName from './findServiceName';

describe('findServiceName', () => {
  describe('with empty base path', () => {
    it('returns the correct segment', () => {
      expect(findServiceName('/foo-bar', '')).toBe('foo-bar');

      expect(findServiceName('/foo-bar/v2', '')).toBe('foo-bar');
    });
  });

  describe('with non-empty base path', () => {
    it('returns the correct segment', () => {
      expect(
        findServiceName('/graphql-explorer/foo-bar', '/graphql-explorer')
      ).toBe('foo-bar');

      expect(
        findServiceName('/graphql-explorer/foo-bar/v2', '/graphql-explorer')
      ).toBe('foo-bar');
    });
  });
});
