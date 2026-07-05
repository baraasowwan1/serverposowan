import mongoose from "mongoose";

export const connectDB = async (): Promise<void> => {
  console.log("========== MongoDB Debug ==========");
  console.log("MONGODB_URI exists:", !!process.env.MONGODB_URI);

  if (process.env.MONGODB_URI) {
    console.log(
      "URI Preview:",
      process.env.MONGODB_URI.substring(0, 30) + "..."
    );
  } else {
    console.log("❌ MONGODB_URI = undefined");
  }

  try {
    const uri = process.env.MONGODB_URI;

    if (!uri) {
      throw new Error("MONGODB_URI is undefined");
    }

    const conn = await mongoose.connect(uri);

    console.log("✅ MongoDB Connected");
    console.log("Host:", conn.connection.host);
  } catch (err) {
    console.error("Mongo Error:", err);
    process.exit(1);
  }
};
