import mongoose from "mongoose";

const TrackStatsSchema = new mongoose.Schema(
  {
    period: { type: String, required: true },
    type: {
      type: String,
      enum: ["daily", "weekly", "monthly", "yearly"],
      required: true,
    },
    topTracks: [
      {
        trackId: String,
        trackName: String,
        artistName: String,
        count: Number,
      },
    ],
  },
  { timestamps: true }
);

TrackStatsSchema.index({ period: 1, type: 1 }, { unique: true });

export default mongoose.model("TrackStats", TrackStatsSchema);
