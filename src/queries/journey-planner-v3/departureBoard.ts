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
################## Departure board for a stop place
#
# This query fetches upcoming departures from a specific stop place,
# similar to what you would see on a departure board at a station.
#
# Key parameters:
# - id: The NSR ID of the stop place (e.g., "NSR:StopPlace:548" for Stavanger stadion)
# - timeRange: How far ahead to look for departures (in seconds, 72100 = ~20 hours)
# - numberOfDepartures: Maximum number of departures to return
#
# The response includes both scheduled (aimed) and real-time (expected/actual) times,
# allowing you to show delays. The 'realtime' field indicates if real-time data
# is available for that departure.
#
# Use case: Building a departure board display, showing upcoming departures
# from a specific stop with real-time updates.
#
{
  stopPlace(id: "NSR:StopPlace:548") {
    id
    name
    estimatedCalls(timeRange: 72100, numberOfDepartures: 10) {     
      realtime
      aimedArrivalTime
      aimedDepartureTime
      expectedArrivalTime
      expectedDepartureTime
      actualArrivalTime
      actualDepartureTime
      date
      forBoarding
      forAlighting
      destinationDisplay {
        frontText
      }
      quay {
        id
      }
      serviceJourney {
        journeyPattern {
          line {
            id
            name
            transportMode
          }
        }
      }
    }
  }
}
`,
  variables: {},
};

export default query;
