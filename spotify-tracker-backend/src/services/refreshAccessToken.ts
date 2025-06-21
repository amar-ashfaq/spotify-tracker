import axios from "axios";

const client_id = process.env.SPOTIFY_CLIENT_ID!;
const client_secret = process.env.SPOTIFY_CLIENT_SECRET!;
const refresh_token = process.env.SPOTIFY_REFRESH_TOKEN!;

async function refreshAccessToken(): Promise<string> {
  const credentials = Buffer.from(`${client_id}:${client_secret}`).toString(
    "base64"
  );

  try {
    const response = await axios.post(
      "https://accounts.spotify.com/api/token",
      new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: refresh_token,
      }),
      {
        headers: {
          Authorization: `Basic ${credentials}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    const newAccessToken = response.data.access_token;
    console.log("Access token refreshed");
    return newAccessToken;
  } catch (error: any) {
    console.error(
      "Failed to refresh token:",
      error.response?.data || error.message
    );
    throw new Error("Could not refresh token");
  }
}

export default refreshAccessToken;
