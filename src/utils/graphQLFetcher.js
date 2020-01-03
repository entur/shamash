import fetch from "isomorphic-fetch";
import uuid from "uuid/v4";

const graphQLUrl = "https://api.entur.io/stop-places/v1/graphql";

const graphQLFetcher = graphQLParams =>
  fetch(graphQLUrl, {
    method: "post",
    headers: {
      accept: "*/*",
      "Content-Type": "application/json",
      "ET-Client-Name": "entur-shamash",
      "X-Correlation-Id": uuid()
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
    });

export default graphQLFetcher;
