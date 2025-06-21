import express, { Request, Response } from "express";
import { getRecentlyPlayed } from "../services/spotifyService";

const app = express.Router();

app.get("/", async (req: Request, res: Response) => {
  const limit = parseInt(req.query.limit as string) || 10;
  let accessToken = req.headers.authorization?.split(" ")[1];

  if (!accessToken) {
    res.status(400).json({ error: "Access token is required." });
    return;
  }

  console.log("Access token:", accessToken);

  try {
    const recentlyPlayedTracks = await getRecentlyPlayed(accessToken, limit);
    res.json(recentlyPlayedTracks);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch recently played tracks." });
  }
});

export default app;
