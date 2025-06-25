import axios from "axios";
import refreshAccessToken from "./refreshAccessToken";

const SPOTIFY_BASE_URL = "https://api.spotify.com/v1";

interface SpotifyTrack {
  name: string;
  album: {
    name: string;
    artists: { name: string }[];
  };
  duration_ms: number;
  played_at: string;
  id: string;
}

interface RecentlyPlayedItem {
  track: {
    name: string;
    album: {
      name: string;
      artists: { name: string }[];
    };
    duration_ms: number;
    id: string;
  };
  played_at: string;
}

async function getTopTracks(
  accessToken: string,
  timeRange: "short_term" | "medium_term" | "long_term" = "short_term",
  limit: number = 10
) {
  try {
    const response = await axios.get(`${SPOTIFY_BASE_URL}/me/top/tracks`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      params: {
        time_range: timeRange,
        limit: limit,
      },
    });

    const result = response.data.items.map((track: SpotifyTrack) => ({
      trackName: track.name,
      artistName: track.album.artists[0].name,
      albumName: track.album.name,
      durationMs: track.duration_ms,
      trackId: track.id,
    }));

    return result;
  } catch (error: any) {
    if (error.response?.status === 401) {
      console.warn("Access token expired. Refreshing...");

      try {
        const newAccessToken = await refreshAccessToken();

        const retryResponse = await axios.get(
          `${SPOTIFY_BASE_URL}/me/top/tracks`,
          {
            headers: {
              Authorization: `Bearer ${newAccessToken}`,
            },
            params: {
              time_range: timeRange,
              limit,
            },
          }
        );

        return retryResponse.data.items.map((track: SpotifyTrack) => ({
          trackName: track.name,
          artistName: track.album.artists[0].name,
          albumName: track.album.name,
          durationMs: track.duration_ms,
          trackId: track.id,
        }));
      } catch (refreshError: any) {
        console.error("Failed after token refresh:", refreshError.message);
        return Promise.reject(refreshError);
      }
    }

    if (error.response) {
      console.error("Spotify API Error:", {
        status: error.response.status,
        data: error.response.data,
      });
    } else if (error.request) {
      console.error("No response received from Spotify API", error.request);
    } else {
      console.error("Error setting up request", error.message);
    }
    return Promise.reject(error);
  }
}

async function getRecentlyPlayed(accessToken: string, limit: number = 50) {
  console.log("Get recently played tracks...");

  try {
    const response = await axios.get(
      `${SPOTIFY_BASE_URL}/me/player/recently-played`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        params: {
          limit,
        },
      }
    );

    return response.data.items.map((item: RecentlyPlayedItem) => ({
      trackId: item.track.id,
      trackName: item.track.name,
      artistName: item.track.album.artists[0].name,
      albumName: item.track.album.name,
      durationMs: item.track.duration_ms,
      playedAt: item.played_at,
    }));
  } catch (error: any) {
    if (error.response?.status === 401) {
      console.warn("Access token expired. Refreshing...");

      try {
        const newAccessToken = await refreshAccessToken();

        const retryResponse = await axios.get(
          `${SPOTIFY_BASE_URL}/me/player/recently-played`,
          {
            headers: {
              Authorization: `Bearer ${newAccessToken}`,
            },
            params: {
              limit,
            },
          }
        );

        return retryResponse.data.items.map((item: RecentlyPlayedItem) => ({
          trackId: item.track.id,
          trackName: item.track.name,
          artistName: item.track.album.artists[0].name,
          albumName: item.track.album.name,
          durationMs: item.track.duration_ms,
          playedAt: item.played_at,
        }));
      } catch (refreshError: any) {
        console.error("Failed after token refresh:", refreshError.message);
        return Promise.reject(refreshError);
      }
    }

    if (error.response) {
      console.error("Spotify API Error:", {
        status: error.response.status,
        data: error.response.data,
      });
    } else if (error.request) {
      console.error("No response received from Spotify API", error.request);
    } else {
      console.error("Error setting up request", error.message);
    }

    return Promise.reject(error);
  }
}

export { getTopTracks, getRecentlyPlayed };
