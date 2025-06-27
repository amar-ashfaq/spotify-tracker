import express, { Request, Response } from "express";
import TrackPlay from "../models/TrackPlay";

const app = express.Router();

app.get("/day", async (req: Request, res: Response) => {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);

  try {
    const tracks = await TrackPlay.aggregate([
      { $match: { playedAt: { $gte: startOfDay, $lte: endOfDay } } },
      {
        $group: {
          _id: "$trackId",
          trackName: { $first: "$trackName" },
          artistName: { $first: "$artistName" },
          playCount: { $sum: 1 },
        },
      },
      {
        $sort: { playCount: -1 }, // show most played first
      },
    ]);

    res.json(tracks);
  } catch (error) {
    res.status(500).json({ error: "Failed to get today's analytics." });
  }
});

export default app;
