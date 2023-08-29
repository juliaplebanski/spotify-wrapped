import { useState, useEffect } from "react";
import Loader from "./Loader";
import useAuth from "../useAuth";
import defaultImage from "./icons/default-image.jpeg";
import SpotifyWebApi from "spotify-web-api-node";
import axios from "axios";
import styled from "styled-components/macro";
import { theme, mixins, media, Main } from "../styles";
const { colors, fontSizes, spacing } = theme;

const spotifyApi = new SpotifyWebApi({
  clientId: process.env.REACT_APP_CLIENT_ID,
});

const Header = styled.header`
  ${mixins.flexBetween};
  ${media.tablet`
    display: block;
  `};
  h2 {
    margin: 0;
  }
`;

const Preview = styled.section`
  display: grid;
  grid-template-columns: 1fr;
  grid-gap: 70px;
  width: 100%;
  margin-top: 100px;
  ${media.tablet`
    display: block;
    margin-top: 70px;
  `};
`;

const Avatar = styled.div`
  width: 150px;
  height: 150px;
  img {
    border-radius: 100%;
  }
`;

const TopArtistsButton = styled.button`
  background-color: transparent;
  color: ${(props) => (props.isActive ? colors.white : colors.lightGrey)};
  font-size: ${fontSizes.base};
  font-weight: 500;
  padding: 10px;
  ${media.phablet`
    font-size: ${fontSizes.sm};
  `};
  span {
    padding-bottom: 2px;
    border-bottom: 1px solid
      ${(props) => (props.isActive ? colors.white : `transparent`)};
    line-height: 1.5;
    white-space: nowrap;
  }
`;

const ArtistsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  grid-gap: 20px;
  margin-top: 50px;
  ${media.tablet`
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  `};
  ${media.phablet`
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  `};
`;

const Artist = styled.li`
  display: flex;
  align-items: center;
  margin-bottom: ${spacing.md};
  ${media.tablet`
    margin-bottom: ${spacing.base};
  `};
`;

const ArtistArtwork = styled.div`
  display: inline-block;
  position: relative;
  width: 50px;
  min-width: 50px;
  margin-right: ${spacing.base};
  img {
    width: 50px;
    min-width: 50px;
    height: 50px;
    margin-right: ${spacing.base};
    border-radius: 100%;
  }
`;

const ArtistName = styled.div`
  flex-grow: 1;
`;

function Home({ code }) {
  const accessToken = useAuth(code);
  const [profile, setProfile] = useState("");
  const [topArtists, setTopArtists] = useState([]);
  const [scheduled, setScheduled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const headers = {
    Authorization: `Bearer ${accessToken}`,
    "Content-Type": "application/json",
  };

  useEffect(() => {
    if (!accessToken) return;
    spotifyApi.setAccessToken(accessToken);
  }, [accessToken]);

  useEffect(() => {
    if (!accessToken) return;
    spotifyApi.getMe().then((data) => {
      console.log(data.body);
      setProfile(data.body);
      setIsLoading(false);
    });
  }, [accessToken]);

  const getTopArtists = async () => {
    const { data } = await axios.get(
      "https://api.spotify.com/v1/me/top/artists?time_range=short_term",
      {
        headers,
      }
    );
    setTopArtists(data.items);
  };

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
    <Main>
      <div className="py-10">
        <h1 className="text-center text-3xl sm:text-4xl lg:text-4xl">
          <span className="text-gray-500">Hi, </span>
          <span className="bg-gradient-to-r from-green-300 via-blue-500 to-purple-600 text-transparent bg-clip-text">
            {profile.display_name}
          </span>
          <span>👋</span>
        </h1>
        <div>
          <Avatar>
            {isLoading ? (
              <Loader />
            ) : profile && profile.images.length > 0 ? (
              <img src={profile.images[1].url} alt="avatar" />
            ) : (
              <img src={defaultImage} alt="default-avatar" />
            )}
          </Avatar>
        </div>
      </div>
      <Preview>
        <Header>
          <h2>Top Artists</h2>
          <TopArtistsButton onClick={() => getTopArtists()}>
            <span>Last 4 Weeks</span>
          </TopArtistsButton>
        </Header>
        <ArtistsContainer>
          {topArtists ? (
            <ul>
              {topArtists.slice(0, 10).map((artist, i) => (
                <Artist key={i}>
                  <ArtistArtwork>
                    {artist.images.length && (
                      <img src={artist.images[2].url} alt="Artist" />
                    )}
                  </ArtistArtwork>
                  <ArtistName>
                    <span>{artist.name}</span>
                  </ArtistName>
                </Artist>
              ))}
            </ul>
          ) : (
            <Loader />
          )}
        </ArtistsContainer>
      </Preview>
      <div>
        <h1>Email Scheduler</h1>
        <p>Email: {profile?.email}</p>
        <p>Top Artists: {topArtists.map((artist) => artist.name).join(", ")}</p>
        {scheduled ? (
          <p>Email scheduled! You will receive your top artists email soon.</p>
        ) : (
          <button onClick={handleSchedule}>Schedule Email</button>
        )}
      </div>
    </Main>
  );
}

export default Home;
