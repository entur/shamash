import { toISOStringWithTimezone } from '../../utils/time.js';

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
################## Trip planning with intermediate stops (via points)
#
# The viaTrip query plans journeys that must pass through one or more
# intermediate locations. This is useful when you need to make a stop
# along the way (e.g., pick someone up, run an errand).
#
# Key parameters:
# - from/to: Origin and final destination
# - via: Array of intermediate stops that must be visited in order
#   - minSlack: Minimum time to spend at the via point (e.g., "PT120S" = 2 min)
#   - maxSlack: Maximum waiting time allowed at the via point
# - segments: Filter transport modes for each segment of the journey
#   (one segment per via point + 1)
# - searchWindow: How long to search for departures (ISO 8601 duration)
#
# Response structure:
# - tripPatternsPerSegment: Trip options for each segment separately
# - tripPatternCombinations: Valid combinations of segments that work together
# - routingErrors: Any issues with the routing request
#
# Use case: "I need to travel from Hamar to Oslo, but stop at Lillestrøm
# for at least 2 minutes to pick up a friend"
#
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
    tripPatternCombinations {
      from
      to
    }
  }
}
`,
};

export default query;
