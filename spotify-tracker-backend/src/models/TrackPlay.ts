import mongoose from "mongoose";

const TrackPlaySchema = new mongoose.Schema({
  trackId: { type: String, required: true },
  trackName: String,
  artistName: String,
  albumName: String,
  playedAt: { type: Date, required: true },
  durationMs: Number,
});

TrackPlaySchema.index({ trackId: 1, playedAt: 1 }, { unique: true });

export default mongoose.model("TrackPlay", TrackPlaySchema);
