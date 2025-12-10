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
{
  trip(
    from: {
      place: "NSR:StopPlace:58404"
    },
    to: {
      place: "NSR:StopPlace:59872"
    },
    modes: {
      directMode: foot
      transportModes:[]
    }
  ) {
    tripPatterns {
      duration
      walkDistance
      legs {
        expectedStartTime
        expectedEndTime
        mode
        distance
        line {
          id
          publicCode
        }
      }
    }
  }
}
`,
  variables: {},
};

export default query;
