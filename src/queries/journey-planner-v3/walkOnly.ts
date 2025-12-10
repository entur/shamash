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
################## Walking-only trip (no public transit)
#
# This query plans a walking-only route between two locations,
# without using any public transit.
#
# Mode configuration:
# - directMode: foot - Walk directly from origin to destination
# - transportModes: [] - Empty array means no transit modes allowed
#
# This is useful for:
# - Showing walk time as a comparison to transit options
# - Providing directions when transit isn't practical for short distances
# - Accessibility: finding pedestrian routes
#
# The response will contain a single leg with mode "foot" showing
# the walking distance, duration, and path.
#
# Use case: "How long would it take to just walk there?"
#
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
      streetDistance
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
