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
  ################### Example query - fetching all estimated timetables for codespaceID="GOA", lineID="GOA:Line:59", datedServiceJourneyID="GOA:DatedServiceJourney:3128_STV-SAS_24-08-23"
{
  estimatedVehicleJourneys(
    codespaceID: "GOA"
    lineID: "GOA:Line:59"
    
    # Extra journey IDs are currently just named dated service journey ID
    datedServiceJourneyID: "GOA:DatedServiceJourney:3128_STV-SAS_24-08-23"
    
    # Either a service journey ID with a service date or a dated service journey ID is required
    # serviceJourneyID: "VYB:ServiceJourney:3926c62058eb143fe5ac97578b6fdaeca3ae5c95_3205752"
    # serviceDate: "2024-08-21"
  ) {
    codespaceID
    lineID
    datedServiceJourneyID
    serviceDate
    serviceJourneyID
    recordedAtTime
    isCancelled
  }
}
`,
  variables: {},
};

export default query;
