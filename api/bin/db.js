import dotenv from "dotenv"; // Import the dotenv library for managing environment variables
import mongoose from "mongoose"; // Import Mongoose for MongoDB interactions

dotenv.config();

// Function to establish a connection to the MongoDB database
export const connect = async () => {
  try {
    await mongoose.connect(process.env.MONGO); // Connect to MongoDB using the MONGO environment variable;
    console.log("Connected to DB server");
  } catch (error) {
    console.log("Error connecting to MongoDB: ", error);
  }
};
