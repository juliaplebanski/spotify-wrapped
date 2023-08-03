require("dotenv").config()
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const SpotifyWebApi = require('spotify-web-api-node');

const app = express();
app.use(cors());
app.use(bodyParser.json());


app.post("/refresh", (req, res) => {
    const refreshToken = req.body.refreshToken
    const spotifyApi = new SpotifyWebApi({
      redirectUri: process.env.REDIRECT_URI,
      clientId: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
      refreshToken,
    })
    // clientId, clientSecret and refreshToken has been set on the api object previous to this call.
    spotifyApi.refreshAccessToken().then(
    (data) => {
            res.json({
                accessToken: data.body.access_token,
                expiresIn: data.body.expires_in
        })
        // Save the access token so that it's used in future calls
        //spotifyApi.setAccessToken(data.body['access_token']);
        }).catch((err) => {
        console.log(err)
        res.sendStatus(400);
    })
})


app.post("/login", (req, res) => {
  const code = req.body.code
  const spotifyApi = new SpotifyWebApi({
    redirectUri: process.env.REDIRECT_URI,
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
  })

  // Retrieve an access token
  spotifyApi.clientCredentialsGrant().then(
    (data) => {
      console.log('The access token expires in ' + data.body['expires_in']);
      console.log('The access token is ' + data.body['access_token']);

      // Save the access token so that it's used in future calls
      spotifyApi.setAccessToken(data.body['access_token']);
    }).catch((err) => {
      console.log(
        'Something went wrong when retrieving an access token',
        err.message
      );
    }
  );
})

app.listen(3001)