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
################## Trip from stop place to coordinates
#
# This query shows how to plan a trip where the destination is specified
# as GPS coordinates rather than a stop place ID. This is useful when
# the user's destination is not a known transit stop.
#
# Origin/destination can be specified as:
# - place: NSR stop place ID (e.g., "NSR:StopPlace:59872")
# - coordinates: Latitude/longitude pair
# - Both: place ID with coordinates as fallback
#
# When using coordinates as destination, the journey planner will:
# 1. Find the nearest transit stops to the coordinates
# 2. Plan routes to those stops
# 3. Add a walking leg from the stop to the final destination
#
# Use case: "Navigate me from Oslo S to my home address"
#
{
  trip(
    from: {
      place: "NSR:StopPlace:59872"
    },
    to: {
      coordinates: {
        latitude: 59.96050414081307
        longitude: 11.040338686322317
      }
    }
  ) {
    tripPatterns {
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
}
`,
  variables: {},
};

export default query;
