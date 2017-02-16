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
    fromPlace:"Dyrløkke, Frogn::59.67388,10.655733"
    toPlace: "Birkelunden, Oslo::59.927204,10.76015"
    numItineraries: 3
    date: "2017-02-08"
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
      stopPlaceType: onstreetBus, 
      municipalityReference: "NSR:TopographicPlace:71"
    ) {
    id
    importedId
    name {
      value
    }
    quays {
      id
      importedId
      geometry {
        type
        coordinates
      }
      allAreasWheelchairAccessible
    }
  }    
}`

}
export default defaultQuery
