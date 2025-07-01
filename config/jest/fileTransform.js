'use strict';

const path = require('path');

// Simple camelCase implementation to replace the camelcase package
function camelCase(str, options = {}) {
  if (!str) return '';

  // Remove non-alphanumeric characters and split into words
  const words = str
    .replace(/[^a-zA-Z0-9]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 0);

  if (words.length === 0) return '';

  // Convert to camelCase
  const firstWord = words[0].toLowerCase();
  const restWords = words.slice(1).map(word =>
    word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
  );

  const result = firstWord + restWords.join('');

  // Return PascalCase if requested
  return options.pascalCase ?
    result.charAt(0).toUpperCase() + result.slice(1) : result;
}

// This is a custom Jest transformer turning file imports into filenames.
// http://facebook.github.io/jest/docs/en/webpack.html

module.exports = {
  process(src, filename) {
    const assetFilename = JSON.stringify(path.basename(filename));

    if (filename.match(/\.svg$/)) {
      // Based on how SVGR generates a component name:
      // https://github.com/smooth-code/svgr/blob/01b194cf967347d43d4cbe6b434404731b87cf27/packages/core/src/state.js#L6
      const pascalCaseFilename = camelCase(path.parse(filename).name, {
        pascalCase: true,
      });
      const componentName = `Svg${pascalCaseFilename}`;
      return {
        code: `const React = require('react');
        module.exports = {
          __esModule: true,
          default: ${assetFilename},
          ReactComponent: React.forwardRef(function ${componentName}(props, ref) {
            return {
              $$typeof: Symbol.for('react.element'),
              type: 'svg',
              ref: ref,
              key: null,
              props: Object.assign({}, props, {
                children: ${assetFilename}
              })
            };
          }),
        };`
      };
    }

    return {
      code: `module.exports = ${assetFilename};`
    };
  },
};
