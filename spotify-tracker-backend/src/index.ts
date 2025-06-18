import dotenv from "dotenv";
import connectDB from "./db";
import runTracker from "./tracker";
import express, { Request, Response } from "express";
import trackRoutes from "./routes/tracks";
import trackStatsRoutes from "./routes/trackStats";

dotenv.config();
console.log("MONGO_URI:", process.env.MONGO_URI);

const app = express();
const port = process.env.PORT || 3000;

// Connect to MongoDB
connectDB();

// Middleware
app.use(express.json());

// Test route
app.get("/", (_: Request, res: Response) => {
  res.send("Spotify Tracker API is running...");
});

// Mount the routes
app.use("/api/tracks", trackRoutes);
app.use("/api/track-stats", trackStatsRoutes);

// Start cron job
runTracker();

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
