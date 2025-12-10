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
################## Find bike rental stations in a geographic area
#
# This query returns all bike rental (city bike) stations within a
# rectangular bounding box defined by latitude/longitude coordinates.
#
# Parameters:
# - minimumLatitude/maximumLatitude: South/North bounds of the box
# - minimumLongitude/maximumLongitude: West/East bounds of the box
#
# The response includes for each station:
# - id: Unique identifier for the station
# - name: Human-readable station name
# - bikesAvailable: Number of bikes currently available for pickup
# - spacesAvailable: Number of empty docks for returning bikes
#
# Use case: Displaying city bike stations on a map, showing availability
# in real-time. Great for "find bikes near me" features.
#
# Tip: You can also request 'latitude' and 'longitude' fields to plot
# the stations on a map.
#
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
`,
};

export default query;
