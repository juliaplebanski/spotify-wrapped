require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const bodyParser = require("body-parser");
const SpotifyWebApi = require("spotify-web-api-node");
const schedule = require("node-schedule");
const sgMail = require("@sendgrid/mail");
const dbo = require("./db/connection");
const { MongoClient } = require("mongodb");
const mongoose = require("mongoose");
const Profile = require('./models/profiles');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const app = express();
app.use(cors());
app.use(bodyParser.json());
const pathToClientBuild = process.env.PATH_TO_CLIENT_BUILD;

app.use(express.static(path.join(__dirname, pathToClientBuild)));

const PORT = process.env.PORT || 3001;
const connectionString = process.env.ATLAS_URI || "";

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
      console.log(err);
    });
});

app.post("/schedule-email", async (req, res) => {
  const { display_name, email, topArtists } = req.body;

  const currentMonth = new Date().toLocaleString("default", {
    month: "long",
  });
  const emailSubject = `Your Top Artists - ${currentMonth}`;
  const emailContent = `Hi ${display_name}! Your top artists of the last month: ${topArtists}`;
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

app.post("/create-profile", async (req, res) => {
  const profile = new Profile(req.body);
  console.log("the profile: " + profile);
  // place this inside of a try catch block
  let dateToInsert = new Date(Date.now() + 2 * 1000);

  const client = new MongoClient(connectionString);
  
  const db = client.db("test");
  const prof = await db.collection("profiles");
  const query = { userId: profile.userId };
  const update = {
    $set: {
      userId: profile.userId,
      display_name: profile.display_name,
      email: profile.email,
      topArtists: profile.topArtists,
      date: dateToInsert,
    },
  };
  const options = { upsert: true };
  prof.updateOne(query, update, options);
  res.json({ message: "Profile created / updated successfully" });
});

async function main() {
  // create an instance of MongoClient
  const client = new MongoClient(connectionString);
  // connect to cluster
    try {
      mongoose.connect(connectionString);
      await client.connect(); // client.connect returns a promise
      console.log("Successfully connected to Atlas");
      app.listen(PORT, () => {
        console.log(`Node API app is running on port ${PORT}`);
      });
    } catch (e) {
      console.log(e);
    } finally {
      // close connection to cluster --> use finally statement
      await client.close();
    }
  }

main().catch(console.error);
