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
