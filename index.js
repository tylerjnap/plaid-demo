const express = require('express');
const app = express();

const bodyParser = require('body-parser');

const path = require('path');
const util = require('util');

// Found here in dashboard - https://dashboard.plaid.com/team/keys
const PLAID_CLIENT_ID = 'CLIENT_ID';
const PLAID_SECRET = 'SECRET_KEY';

// Persist in datastore in relation to user
// note: persisted here in memory for demo purposes
let PLAID_ACCESS_TOKEN = null;

const plaid = require('plaid');
const plaidClient = new plaid.Client({
  clientID: PLAID_CLIENT_ID,
  secret: PLAID_SECRET,
  env: plaid.environments.sandbox,
});

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/create-direct-deposit-switch-token', async (req, res) => {
  try {
    const itemImportResponse = await plaidClient.importItem(
      ['auth', 'identity'],
      {
        user_id: 'user_good',
        auth_token: 'pass_good',
      }
    );
    const { access_token: accessToken } = itemImportResponse;

    const accountsReponse = await plaidClient.getAccounts(accessToken);
    const { accounts } = accountsReponse;
    const [account] = accounts;
    const { account_id: accountId } = account;

    const depositSwitchResponse = await plaidClient.createDepositSwitch(accountId, accessToken);
    const { deposit_switch_id: depositSwitchId } = depositSwitchResponse;

    const depositSwitchTokenReponse = await plaidClient.createDepositSwitchToken(depositSwitchId);
    const { deposit_switch_token: depositSwitchToken } = depositSwitchTokenReponse;

    res.json({ depositSwitchToken });
  } catch(e) {
    res.sendStatus(500);
  }
});

app.post('/create-link-token', async (request, response) => {
  try {
    const { link_token: linkToken } = await plaidClient.createLinkToken({
      user: {
        client_user_id: 'userID-123',
      },
      client_name: 'My App',
      // products: ['auth'],
      country_codes: ['US'],
      language: 'en',
      webhook: 'https://sample.webhook.com',
      access_token: 'access-sandbox-c6d4de54-c705-4cd4-9f71-5bca3a7cb8e9',
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
