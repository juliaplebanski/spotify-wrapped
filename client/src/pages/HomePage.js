import { useState, useEffect } from "react";
import Loader from "../components/Loader";
import useAuth from "../services/useAuth";
import defaultImage from "../components/icons/default-image.jpeg";
import SpotifyWebApi from "spotify-web-api-node";
import axios from "axios";
import { fetchUserProfile, fetchUserTopArtists } from "../services/api";
import "../styles/HomePage.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const spotifyApi = new SpotifyWebApi({
  clientId: process.env.REACT_APP_CLIENT_ID,
});

function HomePage({ code }) {
  const accessToken = useAuth(code);
  const [profile, setProfile] = useState("");
  const [topArtists, setTopArtists] = useState([]);
  const [scheduled, setScheduled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!accessToken) return;
    spotifyApi.setAccessToken(accessToken);
  }, [accessToken]);

  useEffect(() => {
    if (accessToken) {
      const apiRequests = [
        fetchUserProfile(accessToken),
        fetchUserTopArtists(accessToken),
      ];
      Promise.all(apiRequests)
        .then((results) => {
          const profile = results[0];
          const topArtists = results[1].items;

          setProfile(profile);
          setTopArtists(topArtists);
          setIsLoading(false);
        })
        .catch((error) => {
          console.error("Error fetching data:", error);
          setIsLoading(false);
        });
    }
  }, [accessToken]);

  const handleSchedule = async () => {
    const topArtistNames = topArtists.map((artist) => artist.name).join(", ");
    try {
      await axios.post("http://localhost:3001/schedule-email", {
        display_name: profile.display_name,
        email: profile.email,
        topArtists: topArtistNames,
      });
      setScheduled(true);
    } catch (error) {
      console.error("Error scheduling email:", error);
    }
  };

  const handleProfile = async () => {
    const topArtistNames = topArtists.map((artist) => artist.name).join(", ");
    try {
      await axios.post("http://localhost:3001/create-profile", {
        userId: profile.id,
        display_name: profile.display_name,
        email: profile.email,
        topArtists: topArtistNames,
      });
    } catch (error) {
      console.log("Error handling profile data: ", error);
    }
  };

  return (
    <div className="home-page">
      <div className="main-container">
        <div className="user">
          {isLoading ? (
            <Loader />
          ) : profile && profile.images.length > 0 ? (
            <img src={profile.images[1].url} alt="avatar" />
          ) : (
            <img src={defaultImage} alt="default-avatar" />
          )}
          <button
            className="schedule-email-button"
            onClick={handleProfile}
          >
            Add profile info to database
          </button>
          <h1 className="display-name">Hi {profile.display_name} 👋</h1>
        </div>
        <div className="top-artists">
          <h2>Top artists this month</h2>
          {topArtists ? (
            <div className="list">
              {topArtists.slice(0, 5).map((artist, i) => (
                <div className="item" key={i}>
                  {artist.images.length && (
                    <img src={artist.images[2].url} alt="Artist" />
                  )}
                  <div class="play">
                    <div class="fa">
                      <FontAwesomeIcon
                        icon="fa-solid fa-circle-play"
                        size="2xl"
                        style={{ color: "#1DB954" }}
                      />
                    </div>
                  </div>
                  <h4>{artist.name}</h4>
                  <p>{artist.type}</p>
                </div>
              ))}
            </div>
          ) : (
            <Loader />
          )}
        </div>
        <div className="top-artists">
          <h2>Email Scheduler</h2>
          <p>Email: {profile?.email}</p>
          <p>
            Top Artists: {topArtists.map((artist) => artist.name).join(", ")}
          </p>
          {scheduled ? (
            <p>
              Email scheduled! You will receive your top artists email soon.
            </p>
          ) : (
            <button className="schedule-email-button" onClick={handleSchedule}>
              Schedule Email
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default HomePage;
