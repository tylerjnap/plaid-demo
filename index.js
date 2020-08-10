const express = require('express');
const app = express();

const bodyParser = require('body-parser');

const path = require('path');
const util = require('util');

// Found here in dashboard - https://dashboard.plaid.com/team/keys
const PLAID_CLIENT_ID = 'INSERT_CLIEND_ID';
const PLAID_SECRET = 'INSERT_PLAID_SECRET';

// Persist in datastore in relation to user
// note: persisted here in memory for demo purposes
let PLAID_ACCESS_TOKEN = null;

const plaid = require('plaid');
const plaidClient = new plaid.Client({
  clientID: PLAID_CLIENT_ID,
  secret: PLAID_SECRET,
  env: plaid.environments.sandbox
});

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.post('/create-link-token', async (request, response) => {
  try {
    const { link_token: linkToken } = await plaidClient.createLinkToken({
      user: {
        client_user_id: 'userID-123',
      },
      client_name: 'My App',
      products: ['auth', 'identity', 'transactions'],
      country_codes: ['US'],
      language: 'en',
      webhook: 'https://sample.webhook.com',
    });
    response.json({ linkToken });
  } catch (e) {
    console.log(e);
    res.sendStatus(500);
  }
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
