export default `
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
################## Example: Getting bike rental stations within a bounding box
#### Arguments
{
  bikeRentalStationsByBbox(
    minimumLatitude:59.9
    maximumLatitude:60
    minimumLongitude:10.7
    maximumLongitude:10.8
  )
#### Requested fields
  {
    id
    name
    bikesAvailable
    spacesAvailable
  }
}
`
