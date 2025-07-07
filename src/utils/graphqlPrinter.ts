import { visit, ASTNode } from 'graphql';

/**
 * 2020-09-10:
 * Contents are copied from graphql-js repository and modified to indent arguments over multiple lines
 *
 * Files:
 * https://github.com/graphql/graphql-js/blob/master/src/language/printer.js
 * https://github.com/graphql/graphql-js/blob/master/src/language/blockString.js
 */

function printBlockString(
  value: string,
  indentation: string = '',
  preferMultipleLines: boolean = false
): string {
  const isSingleLine = value.indexOf('\n') === -1;
  const hasLeadingSpace = value[0] === ' ' || value[0] === '\t';
  const hasTrailingQuote = value[value.length - 1] === '"';
  const hasTrailingSlash = value[value.length - 1] === '\\';
  const printAsMultipleLines =
    !isSingleLine ||
    hasTrailingQuote ||
    hasTrailingSlash ||
    preferMultipleLines;

  let result = '';
  // Format a multi-line block quote to account for leading space.
  if (printAsMultipleLines && !(isSingleLine && hasLeadingSpace)) {
    result += '\n' + indentation;
  }
  result += indentation ? value.replace(/\n/g, '\n' + indentation) : value;
  if (printAsMultipleLines) {
    result += '\n';
  }

  return '"""' + result.replace(/"""/g, '\\"""') + '"""';
}

/**
 * Converts an AST into a string, using one set of reasonable
 * formatting rules.
 */
export function print(ast: ASTNode): string {
  return visit(ast, { leave: printDocASTReducer });
}

const printDocASTReducer = {
  Name: (node: any) => node.value,
  Variable: (node: any) => '$' + node.name,

  // Document

  Document: (node: any) => join(node.definitions, '\n\n') + '\n',

  OperationDefinition(node: any) {
    const op = node.operation;
    const name = node.name;
    const varDefs = wrap('(', join(node.variableDefinitions, ', '), ')');
    const directives = join(node.directives, ' ');
    const selectionSet = node.selectionSet;
    // Anonymous queries with no directives or variable definitions can use
    // the query short form.
    return !name && !directives && !varDefs && op === 'query'
      ? selectionSet
      : join([op, join([name, varDefs]), directives, selectionSet], ' ');
  },

  VariableDefinition: ({ variable, type, defaultValue, directives }: any) =>
    variable +
    ': ' +
    type +
    wrap(' = ', defaultValue) +
    wrap(' ', join(directives, ' ')),
  SelectionSet: ({ selections }: any) => block(selections),

  Field: ({ alias, name, arguments: args, directives, selectionSet }: any) =>
    join(
      [
        wrap('', alias, ': ') +
          name +
          wrap('(\n', indent(join(args, ',\n')), '\n)'),
        join(directives, ' '),
        selectionSet,
      ],
      ' '
    ),

  Argument: ({ name, value }: any) => name + ': ' + value,

  // Fragments

  FragmentSpread: ({ name, directives }: any) =>
    '...' + name + wrap(' ', join(directives, ' ')),

  InlineFragment: ({ typeCondition, directives, selectionSet }: any) =>
    join(
      ['...', wrap('on ', typeCondition), join(directives, ' '), selectionSet],
      ' '
    ),

  FragmentDefinition: ({
    name,
    typeCondition,
    variableDefinitions,
    directives,
    selectionSet,
  }: any) =>
    // Note: fragment variable definitions are experimental and may be changed
    // or removed in the future.
    `fragment ${name}${wrap('(', join(variableDefinitions, ', '), ')')} ` +
    `on ${typeCondition} ${wrap('', join(directives, ' '), ' ')}` +
    selectionSet,

  // Value

  IntValue: ({ value }: any) => value,
  FloatValue: ({ value }: any) => value,
  StringValue: ({ value, block: isBlockString }: any, key: any) =>
    isBlockString
      ? printBlockString(value, key === 'description' ? '' : '  ')
      : JSON.stringify(value),
  BooleanValue: ({ value }: any) => (value ? 'true' : 'false'),
  NullValue: () => 'null',
  EnumValue: ({ value }: any) => value,
  ListValue: ({ values }: any) => '[' + join(values, ', ') + ']',
  ObjectValue: ({ fields }: any) => block(fields),
  ObjectField: ({ name, value }: any) => name + ': ' + value,

  // Directive

  Directive: ({ name, arguments: args }: any) =>
    '@' + name + wrap('(', join(args, ', '), ')'),

  // Type

  NamedType: ({ name }: any) => name,
  ListType: ({ type }: any) => '[' + type + ']',
  NonNullType: ({ type }: any) => type + '!',

  // Type System Definitions

  SchemaDefinition: addDescription(({ directives, operationTypes }: any) =>
    join(['schema', join(directives, ' '), block(operationTypes)], ' ')
  ),

  OperationTypeDefinition: ({ operation, type }: any) => operation + ': ' + type,

  ScalarTypeDefinition: addDescription(({ name, directives }: any) =>
    join(['scalar', name, join(directives, ' ')], ' ')
  ),

  ObjectTypeDefinition: addDescription(
    ({ name, interfaces, directives, fields }: any) =>
      join(
        [
          'type',
          name,
          wrap('implements ', join(interfaces, ' & ')),
          join(directives, ' '),
          block(fields),
        ],
        ' '
      )
  ),

  FieldDefinition: addDescription(
    ({ name, arguments: args, type, directives }: any) =>
      name +
      (hasMultilineItems(args)
        ? wrap('(\n', indent(join(args, '\n')), '\n)')
        : wrap('(', join(args, ', '), ')')) +
      ': ' +
      type +
      wrap(' ', join(directives, ' '))
  ),

  InputValueDefinition: addDescription(
    ({ name, type, defaultValue, directives }: any) =>
      join(
        [name + ': ' + type, wrap('= ', defaultValue), join(directives, ' ')],
        ' '
      )
  ),

  InterfaceTypeDefinition: addDescription(
    ({ name, interfaces, directives, fields }: any) =>
      join(
        [
          'interface',
          name,
          wrap('implements ', join(interfaces, ' & ')),
          join(directives, ' '),
          block(fields),
        ],
        ' '
      )
  ),

  UnionTypeDefinition: addDescription(({ name, directives, types }: any) =>
    join(
      [
        'union',
        name,
        join(directives, ' '),
        types && types.length !== 0 ? '= ' + join(types, ' | ') : '',
      ],
      ' '
    )
  ),

  EnumTypeDefinition: addDescription(({ name, directives, values }: any) =>
    join(['enum', name, join(directives, ' '), block(values)], ' ')
  ),

  EnumValueDefinition: addDescription(({ name, directives }: any) =>
    join([name, join(directives, ' ')], ' ')
  ),

  InputObjectTypeDefinition: addDescription(({ name, directives, fields }: any) =>
    join(['input', name, join(directives, ' '), block(fields)], ' ')
  ),

  DirectiveDefinition: addDescription(
    ({ name, arguments: args, repeatable, locations }: any) =>
      'directive @' +
      name +
      (hasMultilineItems(args)
        ? wrap('(\n', indent(join(args, '\n')), '\n)')
        : wrap('(', join(args, ', '), ')')) +
      (repeatable ? ' repeatable' : '') +
      ' on ' +
      join(locations, ' | ')
  ),

  SchemaExtension: ({ directives, operationTypes }: any) =>
    join(['extend schema', join(directives, ' '), block(operationTypes)], ' '),

  ScalarTypeExtension: ({ name, directives }: any) =>
    join(['extend scalar', name, join(directives, ' ')], ' '),

  ObjectTypeExtension: ({ name, interfaces, directives, fields }: any) =>
    join(
      [
        'extend type',
        name,
        wrap('implements ', join(interfaces, ' & ')),
        join(directives, ' '),
        block(fields),
      ],
      ' '
    ),

  InterfaceTypeExtension: ({ name, interfaces, directives, fields }: any) =>
    join(
      [
        'extend interface',
        name,
        wrap('implements ', join(interfaces, ' & ')),
        join(directives, ' '),
        block(fields),
      ],
      ' '
    ),

  UnionTypeExtension: ({ name, directives, types }: any) =>
    join(
      [
        'extend union',
        name,
        join(directives, ' '),
        types && types.length !== 0 ? '= ' + join(types, ' | ') : '',
      ],
      ' '
    ),

  EnumTypeExtension: ({ name, directives, values }: any) =>
    join(['extend enum', name, join(directives, ' '), block(values)], ' '),

  InputObjectTypeExtension: ({ name, directives, fields }: any) =>
    join(['extend input', name, join(directives, ' '), block(fields)], ' '),
};

function addDescription(cb: (node: any) => string) {
  return (node: any) => join([node.description, cb(node)], '\n');
}

/**
 * Given maybeArray, print an empty string if it is null or empty, otherwise
 * print all items together separated by separator if provided
 */
function join(maybeArray: any[] | null | undefined, separator: string = ''): string {
  return maybeArray?.filter((x) => x).join(separator) ?? '';
}

/**
 * Given array, print each item on its own line, wrapped in an
 * indented "{ }" block.
 */
function block(array: any[]): string {
  return wrap('{\n', indent(join(array, '\n')), '\n}');
}

/**
 * If maybeString is not null or empty, then wrap with start and end, otherwise print an empty string.
 */
function wrap(start: string, maybeString: string | null | undefined, end: string = ''): string {
  return maybeString != null && maybeString !== ''
    ? start + maybeString + end
    : '';
}

function indent(str: string): string {
  return wrap('  ', str.replace(/\n/g, '\n  '));
}

function isMultiline(str: string): boolean {
  return str.indexOf('\n') !== -1;
}

function hasMultilineItems(maybeArray: any[] | null | undefined): boolean {
  return maybeArray != null && maybeArray.some(isMultiline);
}

export { print };
