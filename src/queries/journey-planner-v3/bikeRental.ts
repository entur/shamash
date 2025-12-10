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
################## Direct city bike trip (bike_rental as directMode)
#
# This query plans a trip using only city bike (bike sharing) as the
# mode of transport. By setting 'directMode: bike_rental', the planner
# will find routes that go directly from origin to destination using
# available city bikes.
#
# The response includes:
# - aimedStartTime/aimedEndTime: Planned departure and arrival times
# - pointsOnLink: The GPS coordinates of the route for map visualization
#
# Use case: Finding the fastest city bike route between two points,
# useful for short urban trips where bike sharing is available.
#
{
  trip(
    from: {
      coordinates: {
        latitude: 59.92990
        longitude: 10.71579
      }
    },
    to: {
      coordinates: {
        latitude: 59.92543
        longitude: 10.78583
      }
    },
    modes: {
      directMode: bike_rental
    }
  ) {
    tripPatterns {
      aimedStartTime
      aimedEndTime
      legs {
        mode
        distance
        aimedStartTime
        aimedEndTime
        pointsOnLink {
          points
        }
      }
    }
  }
}
`,
  variables: {},
};

export default query;
