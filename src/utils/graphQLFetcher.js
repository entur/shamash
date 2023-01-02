import fetch from 'isomorphic-fetch';
import uuid from 'uuid/v4';
import { parse } from 'graphql';
import { SubscriptionClient } from 'subscriptions-transport-ws';

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

const graphQLFetcher = (graphQLUrl, subscriptionsUrl) => {
  let activeSubscriptionId = null;

  let subscriptionsClient;

  if (subscriptionsUrl) {
    subscriptionsClient = new SubscriptionClient(subscriptionsUrl, {
      reconnect: true,
    });
  }

  return (graphQLParams) => {
    console.log(graphQLParams);
    if (hasSubscriptionOperation(graphQLParams)) {
      if (subscriptionsClient && activeSubscriptionId !== null) {
        subscriptionsClient.unsubscribeAll();
      }

      if (subscriptionsClient) {
        return {
          subscribe: (observer) => {
            activeSubscriptionId = subscriptionsClient
              .request(graphQLParams)
              .subscribe(observer);
          },
        };
      }
    } else {
      return fetch(graphQLUrl, {
        method: 'post',
        headers: {
          accept: '*/*',
          'Content-Type': 'application/json',
          'ET-Client-Name': 'entur-shamash2023',
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
          } catch (error) {
            return responseBody;
          }
        });
    }
  };
};

export default graphQLFetcher;
