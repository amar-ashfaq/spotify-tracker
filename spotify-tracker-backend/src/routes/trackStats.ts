import express, { Request, Response } from "express";
import TrackPlay from "../models/TrackPlay";
import TrackStats from "../models/TrackStats";

const app = express.Router();

// POST a new track stat
app.post("/generate", async (request: Request, response: Response) => {
  const type = request.query.type || "daily";

  let period: string;
  let startDate: Date;
  let endDate: Date;

  const now = new Date();

  if (type === "daily") {
    startDate = new Date(now);
    startDate.setHours(0, 0, 0, 0);
    endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 1);

    period = now.toISOString().split("T")[0]; // e.g. "2025-06-17"
  } else if (type === "weekly") {
    const day = now.getDay() || 7;
    startDate = new Date(now);
    startDate.setDate(now.getDate() - day + 1);
    startDate.setHours(0, 0, 0, 0);
    const isoYear = startDate.getFullYear();
    const week = Math.ceil(
      ((+startDate - +new Date(isoYear, 0, 1)) / 86400000 +
        new Date(isoYear, 0, 1).getDay() +
        1) /
        7
    );
    period = `${isoYear}-W${week.toString().padStart(2, "0")}`; // e.g. "2025-W25"

    endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 7);
  } else if (type === "monthly") {
    startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    endDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);

    period = `${now.getFullYear()}-${(now.getMonth() + 1)
      .toString()
      .padStart(2, "0")}`; // "2025-06"
  } else if (type === "yearly") {
    startDate = new Date(now.getFullYear(), 0, 1);
    endDate = new Date(now.getFullYear() + 1, 0, 1);

    period = `${now.getFullYear()}`; // "2025"
  } else {
    response.status(400).json({
      message:
        "Only 'daily', 'weekly', 'monthly', and 'yearly' types are supported",
    });

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

    // Calculate overall stats
    const allTracks = await TrackPlay.find({
      playedAt: { $gte: startDate, $lt: endDate },
    });

    const totalPlays = allTracks.length;
    const totalDuration = allTracks.reduce(
      (sum, track) => sum + (track.durationMs || 0),
      0
    );
    const averageDurationMs =
      totalPlays > 0 ? Math.round(totalDuration / totalPlays) : 0;

    // Build stats doc
    const statsDoc = {
      period: period,
      type: type,
      topTracks: results.map((r) => ({
        trackId: r._id,
        trackName: r.trackName,
        artistName: r.artistName,
        count: r.count,
      })),
      totalPlays,
      averageDurationMs,
      uniqueTrackCount: results.length,
    };

    // Upsert into TrackStats
    const updated = await TrackStats.findOneAndUpdate(
      { type, period },
      { $set: statsDoc },
      { upsert: true, new: true }
    );

    response
      .status(201)
      .json({ message: "Track stats generated", data: updated });
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
