import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import GeneralSettings from "@/models/GeneralSettings";

const SETTINGS_KEY = "general";

// GET: Fetch public General Settings
export async function GET() {
  try {
    await connectDB();

    const settings = await GeneralSettings.findOne({
      key: SETTINGS_KEY,
    })
      .select(
        "organizationName slogan aboutShort aboutLong contact branding socialLinks"
      )
      .lean();

    if (!settings) {
      return NextResponse.json(
        {
          success: false,
          message: "General Settings not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: settings,
    });
  } catch (error) {
    console.error("Public General Settings GET error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch General Settings",
      },
      { status: 500 }
    );
  }
}