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
################## Filter trips by authority (whiteListed)
#
# This query demonstrates how to filter trip results to only include
# journeys operated by specific authorities. The 'whiteListed' parameter
# restricts results to services from the specified authority IDs.
#
# In this example, only trips operated by NSB (now Vy) are returned
# for a journey from Oslo Bus Terminal to Drammen Bus Terminal.
#
# Use case: When you want to show only train options or only services
# from a particular transport provider.
#
{
  trip(
    from: {
      place: "NSR:StopPlace:6505"
      name: "Oslo Bussterminal, Oslo"
    },
    to: {
      place: "NSR:StopPlace:16804"
      name: "Drammen Bussterminal, Drammen"
    },
    whiteListed: {
      authorities: ["NSB:Authority:NSB"]
    }
  ) {
    tripPatterns {
      startTime
      duration
      walkDistance
      legs {
        authority {
          name
        }
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
        mode
      }
    }
  }
}
`,
  variables: {},
};

export default query;
