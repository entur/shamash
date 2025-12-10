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
################## Comparing planned vs actual departure times
#
# This query demonstrates how to retrieve and compare scheduled (aimed),
# expected (real-time prediction), and actual departure/arrival times
# for each stop along a journey.
#
# Time fields explained:
# - aimedDepartureTime: The scheduled/timetabled departure time
# - expectedDepartureTime: Real-time predicted departure (if available)
# - actualDepartureTime: The recorded actual departure (after it happened)
#
# The same pattern applies to arrival times (aimedArrival, expectedArrival, etc.)
#
# The 'realtime' field indicates whether real-time data is available.
# Compare aimed vs expected to show delays to users.
#
# Use case: Building an app that shows delays, or analyzing punctuality
# of public transport services.
#
{
  trip(
    from: {
      place: "NSR:StopPlace:3247",
      name: "Asker stasjon, Asker"
    },
    to: {
      place: "NSR:StopPlace:269",
      name: "Oslo lufthavn, Ullensaker"
    },
    numTripPatterns: 3,
  ) {
    tripPatterns {
      startTime
      duration
      walkDistance
      legs {
        mode
        distance
        line {
          id
          publicCode
          authority {
            name
          }
        }
        fromEstimatedCall {
          quay {
            id 
            name
          }
          realtime
          aimedDepartureTime
          expectedDepartureTime
          actualDepartureTime
        }
        toEstimatedCall {
          quay {
            id 
            name
          }
          aimedDepartureTime
          expectedDepartureTime
          actualDepartureTime
        }
        intermediateEstimatedCalls {
          aimedArrivalTime
          expectedArrivalTime
          actualArrivalTime
          aimedDepartureTime
          expectedDepartureTime
          actualDepartureTime
          quay {
            id 
            name
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
