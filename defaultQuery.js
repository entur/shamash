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
#Example query for planning a journey (uncomment to run)
##################
#
#### Arguments
#{
#  plan(
#    fromPlace:"Dyrløkke, Frogn::59.67388,10.655733"
#    toPlace: "Birkelunden, Oslo::59.927204,10.76015"
#    numItineraries: 3
#    date: "2017-02-08"
#    time: "12:51:14"
#    walkReluctance: 2
#    walkBoardCost: 600
#    minTransferTime: 180
#    walkSpeed: 1.2
#    maxWalkDistance: 5000
#    wheelchair: false
#    arriveBy: false          
#  )
#
#
#### Requested fields
#  {
#    itineraries {
#      startTime
#      duration
#      walkDistance
#        
#          legs {
#            transitLeg
#            mode
#            distance
#            route {
#              shortName
#            }
#            legGeometry {
#              points
#              length
#            }
#          }
#    }
#  }
#}`,
  'Stoppestedsregisteret': null
}

export default defaultQuery