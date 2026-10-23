import mongoose from "mongoose";

// Get the MongoDB connection string from the environment variables.
const MONGODB_URI = process.env.MONGODB_URI;

// Stop the application if MONGODB_URI is not defined.
if (!MONGODB_URI) {
  throw new Error(
    "Please define the MONGODB_URI environment variable inside .env"
  );
}

// Define the structure of our cached Mongoose connection.
type MongooseCache = {
  // Stores the active Mongoose connection.
  conn: typeof mongoose | null;

  // Stores the connection promise while MongoDB is connecting.
  promise: Promise<typeof mongoose> | null;
};

// Extend the global object to allow storing our Mongoose cache.
type GlobalWithMongoose = typeof global & {
  mongoose?: MongooseCache;
};

// Cast the global object to our custom type.
const globalWithMongoose = global as GlobalWithMongoose;

// Get any existing cached connection.
let cached = globalWithMongoose.mongoose;

// If no cache exists, create one.
if (!cached) {
  cached = {
    // No active connection initially.
    conn: null,

    // No connection promise initially.
    promise: null,
  };

  // Store the cache globally so it can be reused.
  globalWithMongoose.mongoose = cached;
}

// Create and reuse a MongoDB connection.
export async function connectDB() {
  // If a connection already exists, return it.
  if (cached!.conn) {
    return cached!.conn;
  }

  // If a connection is not already in progress, start one.
  if (!cached!.promise) {
    cached!.promise = mongoose.connect(MONGODB_URI!);
  }

  // Wait for the connection to finish and save it.
  cached!.conn = await cached!.promise;

  // Return the connected Mongoose instance.
  return cached!.conn;
}