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
      place: "NSR:StopPlace:11", 
      name: "Drammen stasjon, Drammen"
    }, 
    to: {
      place: "NSR:StopPlace:288", 
      name: "Nationaltheatret, Oslo"
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
        serviceJourney {
          id
        }
        line {
          id
          publicCode
          authority {
            name
          }
        }
        situations {
          description {
            value
            language
          }
          validityPeriod {
            startTime
            endTime
          }
          reportType
        }
        intermediateEstimatedCalls {
          aimedArrivalTime
          expectedArrivalTime
          aimedDepartureTime
          expectedDepartureTime
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
