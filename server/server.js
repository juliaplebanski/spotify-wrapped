require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const SpotifyWebApi = require("spotify-web-api-node");
const schedule = require("node-schedule");
const sgMail = require("@sendgrid/mail");

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const app = express();
app.use(cors());
app.use(bodyParser.json());

const scheduledEmails = [];

app.post("/refresh", (req, res) => {
  const refreshToken = req.body.refreshToken;
  const spotifyApi = new SpotifyWebApi({
    redirectUri: process.env.REDIRECT_URI,
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    refreshToken,
  });
  // clientId, clientSecret and refreshToken has been set on the api object previous to this call.
  spotifyApi
    .refreshAccessToken()
    .then((data) => {
      res.json({
        accessToken: data.body.access_token,
        expiresIn: data.body.expires_in,
      });
      // Save the access token so that it's used in future calls
      //spotifyApi.setAccessToken(data.body['access_token']);
    })
    .catch((err) => {
      console.log(err);
      res.sendStatus(400);
    });
});

app.post("/login", (req, res) => {
  const code = req.body.code;
  const spotifyApi = new SpotifyWebApi({
    redirectUri: process.env.REDIRECT_URI,
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
  });

  spotifyApi
    .authorizationCodeGrant(code)
    .then((data) => {
      res.json({
        accessToken: data.body.access_token,
        refreshToken: data.body.refresh_token,
        expiresIn: data.body.expires_in,
      });
    })
    .catch((err) => {
      res.sendStatus(400);
    });
});

app.post("/schedule-email", async (req, res) => {
  const { email, topArtists } = req.body;

  const currentMonth = new Date().toLocaleString("default", {
    month: "long",
  });

  const emailSubject = `Your Top Artists - ${currentMonth}`;

  const emailContent = `Your top artists of the last month: ${topArtists}`;

  const now = new Date();
  const scheduleDate = new Date(now.getTime() + 1 * 60 * 1000);

  const job = schedule.scheduleJob(scheduleDate, async () => {
    try {
      const msg = {
        to: email,
        from: process.env.SENDGRID_EMAIL,
        subject: emailSubject,
        text: emailContent,
        // html: '<p>Your HTML content here</p>' // Use HTML for a rich email content
      };
      console.log(msg);
      await sgMail.send(msg);
      console.log(`Email sent to ${email}`);
    } catch (error) {
      console.error("Error sending email:", error);
    }
  });

  scheduledEmails.push({ email, job });

  res.json({ message: "Email scheduled successfully." });
});

app.listen(3001);
