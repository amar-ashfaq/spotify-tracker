import cron from "node-cron";

const runTracker = () => {
  // Every hour at minute 0
  cron.schedule("0 * * * *", async () => {
    console.log("⏰ Running Spotify tracker...");
    // We'll call your Spotify logic here
  });

  console.log("📆 Cron job scheduled: Running every hour");
};
export default runTracker;
