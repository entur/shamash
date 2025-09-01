import fetch from 'isomorphic-fetch';
import { v4 as uuid } from 'uuid';
import { parse } from 'graphql';
import { createClient } from 'graphql-ws';

interface SubscriptionCallbacks {
  onSubscriptionStart?: () => void;
  onSubscriptionEnd?: () => void;
}

const hasSubscriptionOperation = (graphQlParams) => {
  const queryDoc = parse(graphQlParams.query);
  return queryDoc.definitions.some(
    (definition) =>
      definition.kind === 'OperationDefinition' &&
      definition.operation === 'subscription'
  );
};

const graphQLFetcher = (
  graphQLUrl,
  subscriptionsUrl,
  enturClientName,
  subscriptionCallbacks: SubscriptionCallbacks = {}
) => {
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

  const cancelActiveSubscription = () => {
    if (activeSubscription) {
      activeSubscription();
      activeSubscription = null;
      subscriptionCallbacks.onSubscriptionEnd?.();
    }
  };

  const fetcher = (graphQLParams) => {
    if (hasSubscriptionOperation(graphQLParams)) {
      cancelActiveSubscription();
      subscriptionCallbacks.onSubscriptionStart?.();

      if (!subscriptionClient) return;

      return {
        subscribe: (observer) => {
          activeSubscription = subscriptionClient.subscribe(
            {
              query: graphQLParams.query,
              variables: graphQLParams.variables,
            },
            {
              next: observer.next,
              error: (error) => {
                observer.error(error);
                activeSubscription = null;
                subscriptionCallbacks.onSubscriptionEnd?.();
              },
              complete: () => {
                observer.complete();
                activeSubscription = null;
                subscriptionCallbacks.onSubscriptionEnd?.();
              },
            }
          );

          return {
            unsubscribe: cancelActiveSubscription,
          };
        },
      };
    }

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
      .then((response) => response.text())
      .then((responseBody) => {
        try {
          return JSON.parse(responseBody);
        } catch {
          return responseBody;
        }
      });
  };

  fetcher.cancelActiveSubscription = cancelActiveSubscription;
  return fetcher;
};

export default graphQLFetcher;
