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
      place: "NSR:StopPlace:6505"
      name: "Oslo Bussterminal, Oslo"
    },
    to: {
      place: "NSR:StopPlace:16804"
      name: "Drammen Bussterminal, Drammen"
    },
    whiteListed: {
      authorities: ["NSB:Authority:NSB"]
    }
  ) {
    tripPatterns {
      startTime
      duration
      walkDistance
      legs {
        authority {
          name
        }
        fromPlace {
          name
        }
        toPlace {
          name
        }
        line {
          id
          publicCode
        }
        mode
      }
    }
  }
}
`,
  variables: {},
};

export default query;
