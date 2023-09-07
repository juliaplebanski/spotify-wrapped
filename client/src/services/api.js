import axios from "axios";

const SPOTIFY_API_BASE_URL = "https://api.spotify.com/v1";

export async function fetchUserProfile(accessToken) {
  try {
    const response = await axios.get(`${SPOTIFY_API_BASE_URL}/me`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
}

export async function fetchUserTopArtists(accessToken) {
  try {
    const response = await axios.get(
      `${SPOTIFY_API_BASE_URL}/me/top/artists?time_range=short_term`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
}