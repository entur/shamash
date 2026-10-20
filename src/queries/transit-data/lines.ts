const query = {
  query: `# List lines, 10 at a time. Use "after" with endCursor to get the next page.
{
  lines(first: 10, transportModes: ["bus"]) {
    edges {
      node {
        id
        name
        publicCode
        transportMode
        authority {
          id
          name
        }
      }
    }
    pageInfo {
      hasNextPage
      endCursor
    }
  }
}
`,
};

export default query;
