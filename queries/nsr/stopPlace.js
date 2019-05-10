export default `
# Welcome to GraphiQL
##################
# GraphiQL is an in-browser IDE for writing, validating, and
# testing GraphQL queries.
#
# Type queries into this side of the screen, and you will
# see intelligent typeaheads aware of the current GraphQL type schema and
# live syntax and validation errors highlighted within the text.
#
# To bring up the auto-complete at any point, just press Ctrl-Space.
#
# Press the run button above, or Cmd-Enter to execute the query, and the result
# will appear in the pane to the right.
#
#
################### Example query - fetching stopPlace attributes
{
  stopPlace(size: 5, stopPlaceType: onstreetBus) {
    id
    keyValues {
      key
      values
    }
    name {
      value
    }
    ... on StopPlace {
      quays {
        id
        keyValues {
          key
          values
        }
        geometry {
          type
          coordinates
        }
      }
    }
  }
}
`
