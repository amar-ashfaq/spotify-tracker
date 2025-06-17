import express, { Request, Response } from "express";
import TrackPlay from "../models/TrackPlay";

const app = express.Router();

// GET all track plays
app.get("/", async (request: Request, response: Response) => {
  try {
    const tracks = await TrackPlay.find();
    response.json(tracks);
  } catch (error) {
    response.status(500).json({ message: "Error fetching track plays", error });
  }
});

// POST a new track play
app.post("/", async (request: Request, response: Response) => {
  try {
    const newTrack = new TrackPlay(request.body);
    const savedTrack = await newTrack.save();
    response.status(201).json(savedTrack);
  } catch (error) {
    response.status(400).json({ message: "Error saving track play", error });
  }
});

// GET a single track by ID
app.get("/:id", async (request: Request, response: Response) => {
  try {
    const id = request.params.id;
    const track = await TrackPlay.findById(id);

    if (!track) {
      response.status(404).json({ message: "Track not found" });
    }

    response.json(track);
  } catch (error) {
    response.status(500).json({ message: "Error fetching track", error });
  }
});

// DELETE a track by ID
app.delete("/:id", async (request: Request, response: Response) => {
  try {
    const deleted = await TrackPlay.findByIdAndDelete(request.params.id);

    if (!deleted) {
      response.status(404).json({ message: "Track not found" });
    }

    response.json({ message: "Track deleted" });
  } catch (error) {
    response.status(500).json({ message: "Error deleting track", error });
  }
});

export default app;
