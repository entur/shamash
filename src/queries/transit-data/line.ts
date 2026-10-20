const query = {
  query: `# Fetch one line by its full NeTEx id
query line($id: String!) {
  line(id: $id) {
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
`,
  variables: {
    id: 'BFO:Line:364ee089-185b-4d84-93a2-2b5b9eed4edb',
  },
};

export default query;
