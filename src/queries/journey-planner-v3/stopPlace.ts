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
################## Stop place information with departures
#
# This query fetches information about a specific stop place and its
# upcoming departures. It uses a query variable ($id) for the stop ID,
# making it easy to reuse for different stops.
#
# The response includes:
# - Stop place name and ID
# - Upcoming departures (estimatedCalls) with:
#   - expectedDepartureTime: Real-time departure prediction
#   - destinationDisplay: Where the vehicle is heading (front text)
#   - line info: Public code (e.g., "31") and transport mode
#
# Use case: Looking up a stop place and showing what's departing soon,
# useful for "nearby departures" features in travel apps.
#
query ($id: String!) {
  stopPlace(
    id: $id
  ) {
    name
    id
    estimatedCalls {
      expectedDepartureTime
      destinationDisplay {
        frontText
      }
      serviceJourney {
        line {
          publicCode
          transportMode
        }
      }
    }
  }
}
`,
  variables: {
    id: 'NSR:StopPlace:337',
  },
};

export default query;
