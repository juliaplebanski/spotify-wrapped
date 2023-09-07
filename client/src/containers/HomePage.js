import { useState, useEffect, useMemo } from "react";
import Loader from "../components/Loader";
import useAuth from "../services/useAuth";
import defaultImage from "../components/icons/default-image.jpeg";
import SpotifyWebApi from "spotify-web-api-node";
import axios from "axios";
import styled from "styled-components/macro";
import { mixins, media, Main } from "../styles";
import { fetchUserProfile, fetchUserTopArtists } from "../services/api";

const spotifyApi = new SpotifyWebApi({
  clientId: process.env.REACT_APP_CLIENT_ID,
});

const ProfileHeader = styled.header`
  ${mixins.flexCenter};
  ${media.tablet`
    display: block;
  `};
  h2 {
    margin: 0;
  }
`;

const TopArtistsHeader = styled.header`
  ${mixins.flexLeft};
  ${media.tablet`
    display: block;
  `};
  h2 {
    margin: 0;
  }
`;

const Preview = styled.section`
  display: grid;
  grid-template-columns: 1fr, 1fr, 1fr;
  width: 100%;
  ${media.tablet`
    display: block;
  `};
`;

const Avatar = styled.div`
  margin-right: $margin;
  width: 250px;
  height: 250px;
  img {
    border-radius: 100%;
  }
`;

const ArtistArtwork = styled.div`
  width: 100%;
  border-radius: 6px;
  margin-bottom: 10px;
`;

const ArtistName = styled.div`
  color: #ffffff;
  font-size: 14px;
  margin-bottom: 10px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const TopArtists = styled.div`
  padding: 20px 40px;
`;

const List = styled.div`
  display: flex;
  gap: 20px;
  overflow: hidden;
`;
const Item = styled.div`
  min-width: 140px;
  width: 160px;
  padding: 15px;
  background-color: #181818;
  border-radius: 6px;
  cursor: pointer;
  transition: all ease 0.4s;
`;

function HomePage({ code }) {
  const accessToken = useAuth(code);
  const [profile, setProfile] = useState("");
  const [topArtists, setTopArtists] = useState([]);
  const [scheduled, setScheduled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const headers = useMemo(() => {
    return {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    };
  }, [accessToken]);

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
    <Main>
      <div className="py-10">
        <ProfileHeader>
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
        </ProfileHeader>
        <h1 className="text-center text-3xl sm:text-4xl lg:text-4xl">
          <h1 className="bg-gradient-to-r from-green-300 via-blue-500 to-purple-600 text-transparent bg-clip-text">
            Hi {profile.display_name} 👋
          </h1>
        </h1>
      </div>
      <Preview>
        <TopArtistsHeader>
          <h2>Top artists this month</h2>
        </TopArtistsHeader>
        <TopArtists>
          {topArtists ? (
            <List>
              {topArtists.slice(0, 5).map((artist, i) => (
                <Item key={i}>
                  <ArtistArtwork>
                    {artist.images.length && (
                      <img src={artist.images[2].url} alt="Artist" />
                    )}
                  </ArtistArtwork>
                  <ArtistName>
                    <span>{artist.name}</span>
                  </ArtistName>
                </Item>
              ))}
            </List>
          ) : (
            <Loader />
          )}
        </TopArtists>
      </Preview>
      <div>
        <TopArtistsHeader>
          <h2>Email Scheduler</h2>
        </TopArtistsHeader>
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

export default HomePage;
