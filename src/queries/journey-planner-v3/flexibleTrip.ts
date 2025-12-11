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
################## Flexible service trip (on-demand transport)
#
# This query searches for trips that include flexible/on-demand transport
# services. Flexible services are demand-responsive transport that operates
# within flexible zones or along flexible routes.
#
# Mode configuration:
# - accessMode: flexible - Use flexible transport to reach transit stops
# - egressMode: flexible - Use flexible transport from transit to destination
# - directMode: flexible - Allow direct flexible service trips
# - transportModes: Included public transit modes for the main journey
#
# The response includes:
# - bookingArrangements: Information about how to book the flexible service
# - flexibleLineType: The type of flexible service (e.g., corridorService,
#   flexibleAreasOnly, mixedFlexibleAndFixed)
#
# Use case: Finding trips in rural areas or areas with limited fixed-route
# public transit, where on-demand/flexible services provide first/last mile
# connections or complete journeys.
#
# Note: This example uses coordinates in Vestland county where flexible
# services operate. Adjust coordinates to test other flexible service areas.
#
{
  trip(
    from: {
      coordinates: {
        latitude: 60.3899
        longitude: 5.3326
      }
    },
    to: {
      coordinates: {
        latitude: 60.4662
        longitude: 5.3305
      }
    },
    modes: {
      accessMode: flexible
      egressMode: flexible
      directMode: flexible
      transportModes: [
        { transportMode: bus }
        { transportMode: rail }
      ]
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
        fromPlace {
          name
          flexibleArea
        }
        toPlace {
          name
          flexibleArea
        }
        line {
          id
          name
          flexibleLineType
          bookingArrangements {
            bookingMethods
            bookingNote
            latestBookingTime
            bookWhen
          }
        }
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
