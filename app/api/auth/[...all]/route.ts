import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";

// Connect Better Auth with Next.js API routes.
export const { GET, POST } = toNextJsHandler(auth);