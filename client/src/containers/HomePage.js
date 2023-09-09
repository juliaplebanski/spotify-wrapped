import { useState, useEffect } from "react";
import Loader from "../components/Loader";
import useAuth from "../services/useAuth";
import defaultImage from "../components/icons/default-image.jpeg";
import SpotifyWebApi from "spotify-web-api-node";
import axios from "axios";
import { fetchUserProfile, fetchUserTopArtists } from "../services/api";
import "./HomePage.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlay } from "@fortawesome/free-solid-svg-icons";

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
      fetchUserProfile(accessToken)
        .then((data) => {
          setProfile(data);
          setIsLoading(false);
        })
        .catch((error) => {
          console.error("Error fetching user profile:", error);
        });
    }
  }, [accessToken]);

  useEffect(() => {
    if (accessToken) {
      fetchUserTopArtists(accessToken)
        .then((data) => {
          setTopArtists(data.items);
          setIsLoading(false);
        })
        .catch((error) => {
          console.error("Error fetching user profile:", error);
        });
    }
  }, [accessToken]);

  const handleSchedule = async () => {
    const topArtistNames = topArtists.map((artist) => artist.name).join(", ");
    try {
      await axios.post("http://localhost:3001/schedule-email", {
        email: profile.email,
        topArtists: topArtistNames,
      });
      setScheduled(true);
    } catch (error) {
      console.error("Error scheduling email:", error);
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
          <h1 className="display-name">Hi {profile.display_name} 👋</h1>
        </div>

        <div class="top-artists">
          <h2>Top artists this month</h2>
          {topArtists ? (
            <div className="list">
              {topArtists.slice(0, 5).map((artist, i) => (
                <div className="item" key={i}>
                  {artist.images.length && (
                    <img src={artist.images[2].url} alt="Artist" />
                  )}
                  <div class="play">
                    <FontAwesomeIcon icon={faPlay} />
                  </div>
                  <h4>{artist.name}</h4>
                </div>
              ))}
            </div>
          ) : (
            <Loader />
          )}
        </div>
        <div class="top-artists">
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
            <button onClick={handleSchedule}>Schedule Email</button>
          )}
        </div>
      </div>
    </div>
  );
}

export default HomePage;
