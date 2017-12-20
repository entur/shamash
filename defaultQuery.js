const defaultQuery = {
  'OpenTripPlanner': `
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
  plan(

    #Dyrløkke - coordinates
    fromPlace:"59.67388,10.655733"
    #Dyrløkke - StopPlace reference (preferred solution if you know stopPlace)
    #fromPlace:"NSR:StopPlace:5532"

    #Bjørvika - coordinates
    toPlace: "59.90804,10.756284"
    #Bjørvika - StopPlace reference (preferred solution if you know stopPlace)
    #toPlace: "NSR:StopPlace:58367"

    numItineraries: 3
    date: "2017-12-16"
    time: "12:51:14"
    walkReluctance: 2
    walkBoardCost: 600
    minTransferTime: 180
    walkSpeed: 1.2
    maxWalkDistance: 5000
    wheelchair: false
    arriveBy: false
  )

#### Requested fields
  {
    itineraries {
      startTime
      duration
      walkDistance

          legs {
            transitLeg
            mode
            distance
            route {
              shortName
            }
            legGeometry {
              points
              length
            }
          }
    }
  }
}`,
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
{
  trip(
    from: {name: "Bjerkealleen 5A, Skedsmo"
    coordinates: {
      latitude: 59.96050414081307
      longitude:11.040338686322317
    }}

    to: {
      place:"NSR:StopPlace:4906"
      name:"Bjørvika, Oslo"
    }
    numTripPatterns: 5
    dateTime: "2017-12-18T12:51:14.000+0000"
    minimumTransferTime: 180
    walkSpeed: 1.2
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
