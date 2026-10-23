import { createAuthClient } from "better-auth/react";

// Create the Better Auth client.
// This is used inside client-side React components.
export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL,
});