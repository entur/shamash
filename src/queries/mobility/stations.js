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
  ################### Example query - fetching the 10 nearest vehicle sharing stations within 500 meters
  {
    stations(lat:59.913491, lon:10.757933, range: 500, count: 10) {
      lat
      lon
      name
      address
      capacity
      numBikesAvailable
      numDocksAvailable
      system { name { translation { language value } } }
    }
  }
  `,
};

export default query;
