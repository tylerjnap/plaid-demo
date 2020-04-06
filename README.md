# Plaid Demo

## Local Development

Test Plaid runs on node `8.16.2`. Use [nvm](https://github.com/creationix/nvm) for node versioning and to use `8.16.2`:

```
$ nvm use 8.16.2
```

Plaid Demo utilizes [yarn](https://yarnpkg.com/en/) to build, run, and test the application. To get started, use yarn to install the dependencies and bootstrap any necessary resources:

```
$ yarn
```

Add your Plaid keys to the `index.js` found here in the dashboard - [https://dashboard.plaid.com/team/keys](https://dashboard.plaid.com/team/keys):

```
const PLAID_CLIENT_ID = 'INSERT_PLAID_CLIENT_ID'
const PLAID_SECRET = 'INSERT_PLAID_SECRET'
const PLAID_PUBLIC_KEY = 'INSERT_PLAID_PUBLIC_KEY'
```

To run Plaid Demo:

```
$ yarn start
```

and head to `localhost:3000`.
