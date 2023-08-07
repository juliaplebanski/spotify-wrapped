import { useState, useEffect } from "react";
import useAuth from "./useAuth";
import SpotifyWebApi from "spotify-web-api-node";
import axios from "axios";

const spotifyApi = new SpotifyWebApi({
  clientId: process.env.REACT_APP_CLIENT_ID,
});

function Home({ code }) {
  const accessToken = useAuth(code);
  const [data, setData] = useState("");
  const [topArtists, setTopArtists] = useState([]);

  useEffect(() => {
    if (!accessToken) return;
    spotifyApi.setAccessToken(accessToken);
  }, [accessToken]);

  useEffect(() => {
    if (!accessToken) return;
    spotifyApi.getMe().then((data) => {
      setData(data.body.display_name);
    });
  }, [data, accessToken]);

  const getTopArtists = async () => {
    const { data } = await axios.get(
      "https://api.spotify.com/v1/me/top/artists?time_range=short_term",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    setTopArtists(data.items);
  };

  return (
    <div className="py-10">
      <h1 className="text-center text-3xl sm:text-4xl lg:text-4xl">
        <span className="text-gray-500">Hi, </span>
        <span className="bg-gradient-to-r from-green-300 via-blue-500 to-purple-600 text-transparent bg-clip-text">
          {data}
        </span>
        <span>👋</span>
      </h1>
      <div>
        <button onClick={getTopArtists}>Get Top Artists</button>
        <div>
          <ul>
            {topArtists.map((topArtist) => (
              <li key="{id}">{topArtist.name}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default Home;
