import { toISOStringWithTimezone } from './utils/time'

const defaultQuery = {
    'JourneyPlanner': `
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
#
################## Example query for planning a journey
#### Arguments
{
  trip(
    from: {name: "Bjerkealleen 5A, Skedsmo"
    coordinates: {
      latitude: 59.96050414081307
      longitude:11.040338686322317
    }}

    to: {
      place:"NSR:StopPlace:385"
      name:"Alna, Oslo"
    }
    numTripPatterns: 3
    dateTime: "${toISOStringWithTimezone(new Date())}"
    minimumTransferTime: 180
    walkSpeed: 1.3
    wheelchair: false
    arriveBy: false
  )

#### Requested fields
  {
    tripPatterns {
      startTime
      duration
      walkDistance

          legs {

            mode
            distance
            line {
              id
              publicCode
            }
            pointsOnLink {
              points
              length
            }
          }
    }
  }
}`,
  'Stoppestedsregisteret': `
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
#
################## Example query 1 - fetching id for Frogn
{
  topographicPlace(query: "frogn") {
    id
    name {
      value
    }
  }

################## Example query 2 - fetching stopPlace attributes
  stopPlace(size: 5,
      stopPlaceType: onstreetBus
    ) {
    id
    keyValues {
      key
      values
    }
    name {
      value
    }
    ... on StopPlace {
      quays {
        id
        keyValues {
          key
          values
        }
        geometry {
          type
          coordinates
        }
      }
    }
  }
}`

}
export default defaultQuery
