# Shamash

An in-browser IDE for exploring GraphQL.

## Build the app

```
yarn build
```

## Run the app

### Run build against localhost

Change the homepage field in `package.json` to just `.`:

```diff
+"homepage": ".",
-"homepage": "/graphql-explorer",
```

Then start the show with:

```
yarn start
```

## Configuration

Configuration for shamash is served by the NodeJS proxy.

For local development, use `config-dev.json`. In gcp, configuration is loaded from the configmap called `shamash-server-config`. TODO: Use configmap and values from helm template.
