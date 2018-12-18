import fetch from 'isomorphic-fetch';

const graphQLFetcher = graphQLParams => (
  fetch(window.config.graphQLUrl, {
    method: 'post',
    headers: {
      accept: '*/*',
      'Content-Type': 'application/json',
      'ET-Client-Name': 'entur-shamash',
    },
    body: JSON.stringify(graphQLParams)
  })
  .then(function(response) {
    return response.text();
  })
  .then(function(responseBody) {
    try {
      return JSON.parse(responseBody);
    } catch (error) {
      return responseBody;
    }
  })
);

export default graphQLFetcher;
