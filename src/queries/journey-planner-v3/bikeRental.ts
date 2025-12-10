const query = {
  query: `
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
################## Example query
# Travel search with city bike

{
  trip(
    from: {
      coordinates: {
        latitude: 59.92990
        longitude: 10.71579
      }
    },
    to: {
      coordinates: {
        latitude: 59.92543
        longitude: 10.78583
      }
    },
    modes: {
      directMode: bike_rental
    }
  ) {
    tripPatterns {
      aimedStartTime
      aimedEndTime
      legs {
        mode
        distance
        aimedStartTime
        aimedEndTime
        pointsOnLink {
          points
        }
      }
    }
  }
}
`,
  variables: {},
};

export default query;
