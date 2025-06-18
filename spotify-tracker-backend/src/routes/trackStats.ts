import express, { Request, Response } from "express";
import TrackPlay from "../models/TrackPlay";
import TrackStats from "../models/TrackStats";

const app = express.Router();

// POST a new track stat
app.post("/generate", async (request: Request, response: Response) => {
  const type = request.query.type || "daily";

  let startDate: Date;
  let endDate: Date;

  const now = new Date();

  if (type === "daily") {
    startDate = new Date(now.toISOString().slice(0, 10)); // midnight
    endDate = new Date(now.toISOString().slice(0, 10));
    endDate.setDate(endDate.getDate() + 1);
  } else {
    response.status(400).json({ message: "Only 'daily' is supported for now" });
    return;
  }

  try {
    const results = await TrackPlay.aggregate([
      { $match: { playedAt: { $gte: startDate, $lt: endDate } } },
      {
        $group: {
          _id: "$trackId",
          count: { $sum: 1 },
          trackName: { $first: "$trackName" },
          artistName: { $first: "$artistName" },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);

    const statsDoc = {
      period: now.toISOString().slice(0, 10),
      type: "daily",
      topTracks: results.map((r) => ({
        trackId: r._id,
        trackName: r.trackName,
        artistName: r.artistName,
        count: r.count,
      })),
    };

    await TrackStats.findOneAndUpdate(
      {
        period: statsDoc.period,
        type: "daily",
      },
      statsDoc,
      { upsert: true, new: true }
    );
    response
      .status(201)
      .json({ message: "Track stats generated", data: statsDoc });
  } catch (error) {
    console.error("Failed to generate stats", error);
    response.status(500).json({ message: "Internal error", error: error });
  }
});

// GET a single trackStat
app.get("/", async (request: Request, response: Response) => {
  const { type, period } = request.query;

  if (!type || !period) {
    response.status(400).json({ message: "Missing type or period" });
  }

  try {
    const trackStat = await TrackStats.findOne({
      type: type?.toString(),
      period: period?.toString(),
    });

    if (!trackStat) {
      response.status(404).json({ message: "No stats found" });
      return;
    }

    response.json(trackStat);
  } catch (error) {
    response.status(500).json({ message: "Error fetching track", error });
  }
});

export default app;
