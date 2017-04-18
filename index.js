'use strict';

const express = require('express');
const simpleOauthModule = require('simple-oauth2');

const listenToPort = process.env.LISTEN_TO || '3000';
const app = express();
const oauth2 = simpleOauthModule.create({
  client: {
    id: process.env.CLIENT_ID,
    secret: process.env.CLIENT_SECRET
  },
  auth: {
    tokenHost: process.env.CLUSTER_URL,
    tokenPath: '/oauth2/token',
    authorizePath: '/oauth2/auth',
  },
});

// Authorization uri definition
const authorizationUri = oauth2.authorizationCode.authorizeURL({
  redirect_uri: 'http://localhost:'+listenToPort+'/callback',
  scope: 'offline',
  state: '3(#0/!~ABCDEFGHIJKLMNOPQRSTUVWXYZ',
});

// Initial page redirecting to Github
app.get('/auth', (req, res) => {
  console.log(authorizationUri);
  res.redirect(authorizationUri);
});

// Callback service parsing the authorization token and asking for the access token
app.get('/callback', (req, res) => {
  const code = req.query.code;
  const options = {
    code,
  };

  options.redirect_uri = 'http://localhost:3000/callback';
  oauth2.authorizationCode.getToken(options, (error, result) => {
    if (error) {
      console.error('Access Token Error', error.message);
      return res.json('Authentication failed');
    }

    console.log('The resulting token: ', result);
    const token = oauth2.accessToken.create(result);

    return res
      .status(200)
      .json(token);
  });
});

app.get('/success', (req, res) => {
  res.send('');
});

app.get('/', (req, res) => {
  res.send('<div style="border:1px solid #333;background-color:#d9d9d9;width:300px;margin:25px auto;padding:20px;"><h3>OAuth 2.0 Example</h3><p>Welcome to an example user consent application.</p><div style="text-align:center;"><button style="margin:5px auto;padding:5px 10px;text-align:center;font-size:16px;" href="/auth">Log in with Unite US</button></div></div>');
});

app.listen(listenToPort, () => {
  console.log('Express server started on port '+listenToPort); // eslint-disable-line
});


// Credits to [@lazybean](https://github.com/lazybean)
