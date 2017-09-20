# Shamash

An in-browser IDE for exploring GraphQL.

## Build the app

```
npm run build
```
or
```
yarn build
```

## Run the app

```
npm start
```
or
```
yarn start
```

## Configuration

We use convict.js for config. Set environment variables `GRAPHQL_URL`
and `SERVICE_NAME` in order to override default configuration of these
endpoints. E.g.

```
  GRAPHQL_URL=http://localhost:8090/graphql SERVICE_NAME=Stoppestedsregisteret npm start
```

Optional environment variable `ENDPOINTBASE` overrides namespace for client including slash. Full example:

```
SERVICE_NAME=Stoppestedsregisteret ENDPOINTBASE=/admin/shamash/ GRAPHQL_URL=https://api-test.entur.org/tiamat/1.0/graphql npm start
```
