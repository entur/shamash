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
################## City bike as first-mile access to public transit
#
# This query demonstrates a multimodal trip where city bike is used
# as the 'access mode' (first mile) to reach public transit, followed
# by bus, and then walking (foot) as the 'egress mode' (last mile).
#
# Mode configuration:
# - accessMode: bike_rental - Use city bike to get to the transit stop
# - egressMode: foot - Walk from the final transit stop to destination
# - transportModes: bus - Use bus for the main transit leg
#
# Use case: When the origin is not near a transit stop, but there are
# city bikes available nearby. The traveler can bike to a bus stop,
# take the bus, and walk to the final destination.
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
      accessMode: bike_rental
      egressMode: foot
      transportModes: {
        transportMode: bus
      }
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
      }
    }
  }
}
`,
  variables: {},
};

export default query;
