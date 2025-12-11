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
# This query plans journeys that must pass through one or more intermediate
# locations. Use the 'via' argument on the trip query to specify stops
# along the way.
#
# Via location types:
# - visit: The traveler must alight/board at the stop or walk to a coordinate
#   - stopLocationIds: Stop places, quays, or groups to visit (only ONE needed)
#   - coordinate: A specific point to visit (requires walking from transit)
#   - minimumWaitTime: How long to stay at the via point (ISO 8601 duration)
# - passThrough: Stay on board and pass through the stop (no alighting required)
#
# Example 1: Multi-city business trip with lunch break
# This example demonstrates a trip where you need to stop at an intermediate city
# for a longer duration (e.g., for a business meeting or lunch).
#
# Use case: "I'm traveling from Bergen to Trondheim for a business trip,
# but need to stop in Ålesund for a 1-hour client meeting"

# Example 2: Tourist trip with sightseeing stop
# This example shows how to plan a trip with a stop for sightseeing.
#
# Use case: "I want to travel from Oslo to Stavanger, but I want to stop in
# Kristiansand for 30 minutes to visit the Ravenstein Park"
#
{
  trip(
    from: {
      place: "NSR:StopPlace:59872"
      name: "Oslo S, Oslo"
    },
    to: {
      place: "NSR:StopPlace:60005"
      name: "Stavanger S, Stavanger"
    },
    dateTime: "${toISOStringWithTimezone(new Date())}",
    via: [
      {
        visit: {
          stopLocationIds: ["NSR:StopPlace:60003"]
          label: "Ålesund stasjon"
          minimumWaitTime: "PT1H"
        }
      },
      {
        visit: {
          stopLocationIds: ["NSR:StopPlace:60004"]
          label: "Kristiansand stasjon"
          minimumWaitTime: "PT30M"
        }
      }
    ]
  ) {
    routingErrors {
      description
      inputField
      code
    }
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
      }
    }
  }
}
`,
};

export default query;
