import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI as string;
    const conn = await mongoose.connect(mongoUri);
    console.log(`Mongo db connected: ${conn.connection.host}`);
  } catch (error) {
    console.log("MongoDB connection failed:", error);
    process.exit(1);
  }
};
export default connectDB;
