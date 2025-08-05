import fetch from 'isomorphic-fetch';
import { v4 as uuid } from 'uuid';
import { parse } from 'graphql';
import { createClient } from 'graphql-ws';

const hasSubscriptionOperation = (graphQlParams) => {
  const queryDoc = parse(graphQlParams.query);

  for (let definition of queryDoc.definitions) {
    if (definition.kind === 'OperationDefinition') {
      const operation = definition.operation;
      if (operation === 'subscription') {
        return true;
      }
    }
  }

  return false;
};

const graphQLFetcher = (graphQLUrl, subscriptionsUrl, enturClientName) => {
  let activeSubscription = null;
  let subscriptionClient;

  if (subscriptionsUrl) {
    subscriptionClient = createClient({
      url: subscriptionsUrl,
      connectionParams: {
        headers: {
          'ET-Client-Name': enturClientName,
          'X-Correlation-Id': uuid(),
        },
      },
    });
  }

  return (graphQLParams) => {
    console.log(graphQLParams);
    if (hasSubscriptionOperation(graphQLParams)) {
      if (activeSubscription) {
        activeSubscription();
        activeSubscription = null;
      }

      if (subscriptionClient) {
        return {
          subscribe: (observer) => {
            activeSubscription = subscriptionClient.subscribe(
              {
                query: graphQLParams.query,
                variables: graphQLParams.variables,
              },
              observer
            );
          },
        };
      }
    } else {
      return fetch(graphQLUrl, {
        method: 'post',
        headers: {
          accept: '*/*',
          'Content-Type': 'application/json',
          'ET-Client-Name': enturClientName,
          'X-Correlation-Id': uuid(),
        },
        body: JSON.stringify(graphQLParams),
      })
        .then(function (response) {
          return response.text();
        })
        .then(function (responseBody) {
          try {
            return JSON.parse(responseBody);
          } catch {
            return responseBody;
          }
        });
    }
  };
};

export default graphQLFetcher;
