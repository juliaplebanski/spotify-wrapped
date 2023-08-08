import { useState, useEffect } from "react";
import Loader from "./Loader";
import useAuth from "../useAuth";
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
  const [data, setData] = useState("");
  const [topArtists, setTopArtists] = useState([]);

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
      setData(data.body.display_name);
    });
  }, [data, accessToken]);

  const getTopArtists = async () => {
    const { data } = await axios.get(
      "https://api.spotify.com/v1/me/top/artists?time_range=short_term",
      {
        headers,
      }
    );
    setTopArtists(data.items);
  };

  return (
    <Main>
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
    </Main>
  );
}

export default Home;
