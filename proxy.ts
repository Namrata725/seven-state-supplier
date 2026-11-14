
import { NextRequest, NextResponse } from "next/server";
import { auth } from "./lib/auth";

const ADMIN_ROLES = ["admin", "super_admin"];

export async function proxy(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return NextResponse.redirect(
        new URL("/login", request.url)
      );
    }

    if (!ADMIN_ROLES.includes(session.user.role ?? "")) {
      return NextResponse.redirect(
        new URL("/", request.url)
      );
    }

    return NextResponse.next();
  } catch (error) {
    console.error("Admin proxy authentication error:", error);

    return NextResponse.redirect(
      new URL("/login", request.url)
    );
  }
}

export const config = {
  matcher: ["/admin/:path*"],
};
