# Shamash

An in-browser IDE for exploring GraphQL – extended with a map, query selection, etc.

## Install dependencies

```sh
yarn install
```

## Build the app

```sh
yarn build
```

## Run the app

### Run build against localhost

```sh
yarn start
```

## Deploy to dev (for quick testing)

Deployment to dev is (done automatically)[.github/workflows/firebase-hosting-merge.yml] when a PR is merged (or push to master), but sometimes you need to test quickly:
```sh
firebase -P dev deploy --only hosting
```

The updated app should now be available at https://api.dev.entur.io/graphql-explorer
