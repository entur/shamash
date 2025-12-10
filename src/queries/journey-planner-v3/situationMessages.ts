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
################## Retrieving situation messages (service disruptions)
#
# This query shows how to fetch situation messages (SIRI-SX) for trips.
# Situations include service disruptions, planned maintenance, delays,
# cancellations, and other travel advisories.
#
# Situation fields:
# - description: Human-readable description of the situation
# - validityPeriod: When the situation is active (startTime/endTime)
# - reportType: Type of situation (e.g., incident, maintenance)
#
# Situations can be attached to:
# - legs: Affecting specific journey segments
# - lines: Affecting entire lines
# - quays: Affecting specific platforms/stops
#
# Use case: Displaying warnings to travelers about disruptions,
# helping them make informed travel decisions.
#
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
