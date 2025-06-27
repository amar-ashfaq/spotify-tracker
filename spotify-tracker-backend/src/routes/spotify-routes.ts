import express, { Request, Response } from "express";
import { getRecentlyPlayed, getTopTracks } from "../services/spotifyService";
import TrackPlay from "../models/TrackPlay";

type TrackPlay = {
  trackId: String;
  trackName: String;
  artistName: String;
  albumName: String;
  playedAt: Date;
  durationMs: Number;
};

const app = express.Router();

function getAccessToken(res: Response): string | undefined {
  const accessToken = process.env.SPOTIFY_ACCESS_TOKEN as string;
  if (!accessToken) {
    res
      .status(500)
      .json({ error: "Server misconfiguration: access token missing." });

    return;
  }
  return accessToken;
}

app.get("/recently-played", async (req: Request, res: Response) => {
  const limit = parseInt(req.query.limit as string) || 10;
  const accessToken = getAccessToken(res);

  if (!accessToken) return;

  try {
    const recentlyPlayedTracks = await getRecentlyPlayed(accessToken, limit);

    // add this to the TrackPlay db
    await Promise.all(
      recentlyPlayedTracks.map(async (track: TrackPlay) => {
        const result = await TrackPlay.updateOne(
          {
            trackId: track.trackId,
            playedAt: track.playedAt,
          },
          { $setOnInsert: { ...track, userId: "default" } },
          { upsert: true }
        );
        console.log(`Inserted: ${result.upsertedCount > 0}`);
      })
    );
    // send response after DB insertion
    res.json(recentlyPlayedTracks);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch recently played tracks." });
  }
});

app.get("/top-tracks", async (req: Request, res: Response) => {
  const rawTimeRange = req.query.timeRange as string;
  const validTimeRanges = ["short_term", "medium_term", "long_term"];

  const timeRange = validTimeRanges.includes(rawTimeRange)
    ? (rawTimeRange as "short_term" | "medium_term" | "long_term")
    : "short_term";

  const limit = parseInt(req.query.limit as string) || 10;
  const accessToken = getAccessToken(res) as string;

  if (!accessToken) return;

  try {
    const topTracks = await getTopTracks(accessToken, timeRange, limit);
    res.json(topTracks);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch top tracks." });
  }
});

export default app;
