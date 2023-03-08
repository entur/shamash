import { toISOStringWithTimezone } from '../../utils/time';

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
################## Example query for planning a journey with a via point
#### Arguments
{
  viaTrip(
    from: {
      place: "NSR:StopPlace:60045"
      name: "Hamar stasjon, Hamar"
      coordinates: {
        latitude: 60.791525
        longitude: 11.077097
      }
    },
    to: {
      place: "NSR:StopPlace:59872"
      name: "Oslo S, Oslo"
      coordinates: {
        latitude: 59.910357
        longitude: 10.753051
      }
    },
    searchWindow: "PT2H",
    dateTime: "${toISOStringWithTimezone(new Date())}",
    via: [{
      place: "NSR:StopPlace:62339"
      name: "Lillestrøm stasjon, Lillestrøm"
      coordinates: {
        latitude: 59.952915
        longitude: 11.045364
      }
      minSlack: "PT120S"
      maxSlack: "PT2H"
    }],
    segments: [{
      filters: [{
        select: [{
          transportModes: [{
            transportMode: rail
          }, {
            transportMode: bus
          }, {
            transportMode: metro
          }]
        }]
      }]
    }, {
      filters: [{
        select: [{
          transportModes: [{
            transportMode: rail
          }, {
            transportMode: bus
          }, {
            transportMode: metro
          }]
        }]
      }]
    }]
  ) {
    routingErrors {
      description
      inputField
      code
    }
    tripPatternsPerSegment {
      tripPatterns {
        expectedStartTime
        expectedEndTime
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
    tripPatternCombinations {
      from
      to
    }
  }
}
`,
};

export default query;
