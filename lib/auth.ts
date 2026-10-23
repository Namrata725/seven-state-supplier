import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { MongoClient } from "mongodb";

// Get the MongoDB connection string from environment variables.
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error("Please define MONGODB_URI in your .env file");
}

// Create a MongoDB client for Better Auth.
const client = new MongoClient(MONGODB_URI);

// Select the database Better Auth will use.
// If your connection string already specifies a database,
// you can use that database instead.
const db = client.db("seven-state-suppliers");

// Configure Better Auth.
export const auth = betterAuth({
  // Tell Better Auth to use MongoDB for storing
  // users, sessions, accounts, and other auth data.
  database: mongodbAdapter(db, {
    client,
  }),

  // Email/password authentication.
  emailAndPassword: {
    enabled: true,
  },

  // Additional information stored on each user.
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: false,
        defaultValue: "user",
        input: false,
      },
    },
  },
});