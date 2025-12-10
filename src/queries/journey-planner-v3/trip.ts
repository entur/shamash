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
################## Basic trip planning query
#
# This is the fundamental query for planning a journey between two locations.
# It demonstrates the core 'trip' query with common parameters.
#
# Key parameters:
# - from/to: Origin and destination (can use coordinates, place ID, or both)
# - numTripPatterns: Number of journey alternatives to return
# - dateTime: When to travel (ISO 8601 format with timezone)
# - walkSpeed: Walking speed in meters/second (1.3 m/s ≈ 4.7 km/h is typical)
# - arriveBy: false = depart at dateTime, true = arrive by dateTime
#
# The response includes tripPatterns, each containing:
# - expectedStartTime: When the journey starts (with real-time adjustments)
# - duration: Total travel time in seconds
# - walkDistance: Total walking distance in meters
# - legs: Individual segments of the journey (walk, bus, train, etc.)
#
#### Arguments
{
  trip(
    from: {
      name: "Bjerkealleen 5A, Skedsmo"
      coordinates: {
        latitude: 59.96050414081307
        longitude:11.040338686322317
      }
    }
    to: {
      place:"NSR:StopPlace:385"
      name:"Alna, Oslo"
    }
    numTripPatterns: 3
    dateTime: "${toISOStringWithTimezone(new Date())}"
    walkSpeed: 1.3
    arriveBy: false
  )

#### Requested fields
  {
    tripPatterns {
      expectedStartTime
      duration
      walkDistance
      legs {
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
};

export default query;
