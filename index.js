const express = require('express');
const app = express();

const bodyParser = require('body-parser');

const path = require('path');
const util = require('util');

// Found here in dashboard - https://dashboard.plaid.com/team/keys
const PLAID_CLIENT_ID = 'ENTER_PLAID_CLIENT_ID';
const PLAID_SECRET = 'ENTER_PLAID_SECRET';
const PLAID_PUBLIC_KEY = 'ENTER_PLAID_PUBLIC_KEY';

// Persist in datastore in relation to user
// note: persisted here in memory for demo purposes
let PLAID_ACCESS_TOKEN = null;

const plaid = require('plaid');
const plaidClient = new plaid.Client(
  PLAID_CLIENT_ID,
  PLAID_SECRET,
  PLAID_PUBLIC_KEY,
  plaid.environments.sandbox
);

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.post('/get-access-token', async (req, res) => {
  try {
    // Exchange public token for access token
    // Persist access token in datastore in relation to user
    // note: persisted here in memory for demo purposes
    const { publicToken } = req.body;
    const tokenResponse = await plaidClient.exchangePublicToken(publicToken);
    PLAID_ACCESS_TOKEN = tokenResponse.access_token;
    console.log('-----');
    console.log(PLAID_ACCESS_TOKEN);

    // Call Auth API to obtain user's account & routing numbers
    // Persist account & routing numbers in datastore in relation to user
    // note: persisted here in memory for demo purposes
    const authResponse = await plaidClient.getAuth(PLAID_ACCESS_TOKEN);
    console.log('-----');
    console.log('Auth response:');
    console.log(util.inspect(authResponse, false, null, true));

    const identityResponse = await plaidClient.getIdentity(PLAID_ACCESS_TOKEN);
    console.log('-----');
    console.log('Identity response:');
    console.log(util.inspect(identityResponse, false, null, true));

    // note: only need to call Balance API for ongoing payments
    // b/c Auth API will return balance at time of request for
    // account & routing numbers
    const balanceResponse = await plaidClient.getBalance(PLAID_ACCESS_TOKEN);
    console.log('-----');
    console.log('Balance response:');
    console.log(util.inspect(balanceResponse, false, null, true));

    const transactionsResponse = await plaidClient.getTransactions(
      PLAID_ACCESS_TOKEN,
      '2019-01-01',
      '2020-01-01'
    );
    console.log('-----');
    console.log('Transactions response:');
    console.log(util.inspect(transactionsResponse, false, null, true));

    res.sendStatus(200);
  } catch(error) {
    console.log(error);
    res.sendStatus(500);
  }
});

app.listen(3000);
