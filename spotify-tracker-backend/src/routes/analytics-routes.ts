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

app.get("/weekly", async (req: Request, res: Response) => {
  const now = new Date();

  const dayOfWeek = now.getDay();
  const diffToMonday = (dayOfWeek + 6) % 7;

  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - diffToMonday);
  startOfWeek.setHours(0, 0, 0, 0);

  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999);

  try {
    const tracks = await TrackPlay.aggregate([
      { $match: { playedAt: { $gte: startOfWeek, $lte: endOfWeek } } },
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

    res.json({ startOfWeek, endOfWeek, tracks });
  } catch (error) {
    res.status(500).json({ error: "Failed to get this week's analytics." });
  }
});

app.get("/monthly", async (req: Request, res: Response) => {
  const date = new Date();
  const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
  const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  lastDay.setHours(23, 59, 59, 999);

  try {
    const tracks = await TrackPlay.aggregate([
      { $match: { playedAt: { $gte: firstDay, $lte: lastDay } } },
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
    res.status(500).json({ error: "Failed to get this month's analytics." });
  }
});

app.get("/yearly", async (req: Request, res: Response) => {
  const date = new Date();
  const firstDay = new Date(date.getFullYear(), 0, 1);
  const lastDay = new Date(date.getFullYear(), 11, 31);
  lastDay.setHours(23, 59, 59, 999);

  try {
    const tracks = await TrackPlay.aggregate([
      { $match: { playedAt: { $gte: firstDay, $lte: lastDay } } },
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
    res.status(500).json({ error: "Failed to get this year's analytics." });
  }
});

export default app;
