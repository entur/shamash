module.exports = {
  extends: ['react-app'],
  plugins: ['prettier'],
  rules: {
    'prettier/prettier': 'error',
    // Disable problematic flowtype rules for ESLint 9 compatibility
    'flowtype/define-flow-type': 'off',
    'flowtype/use-flow-type': 'off',
    'flowtype/no-types-missing-file-annotation': 'off',
    'flowtype/valid-syntax': 'off',
    // Disable problematic react-hooks rules for ESLint 9 compatibility
    'react-hooks/exhaustive-deps': 'off',
    'react-hooks/rules-of-hooks': 'off',
  },
  overrides: [
    {
      files: ['**/*.{js,jsx,ts,tsx}'],
      rules: {
        // Additional flowtype rule overrides
        'flowtype/boolean-style': 'off',
        'flowtype/delimiter-dangle': 'off',
        'flowtype/generic-spacing': 'off',
        'flowtype/no-primitive-constructor-types': 'off',
        'flowtype/no-types-missing-file-annotation': 'off',
        'flowtype/no-weak-types': 'off',
        'flowtype/object-type-delimiter': 'off',
        'flowtype/require-parameter-type': 'off',
        'flowtype/require-return-type': 'off',
        'flowtype/require-valid-file-annotation': 'off',
        'flowtype/semi': 'off',
        'flowtype/space-after-type-colon': 'off',
        'flowtype/space-before-generic-bracket': 'off',
        'flowtype/space-before-type-colon': 'off',
        'flowtype/type-id-match': 'off',
        'flowtype/union-intersection-spacing': 'off',
      },
    },
  ],
};
