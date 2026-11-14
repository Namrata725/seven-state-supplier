import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import {auth} from "@/lib/auth";
import GeneralSettings from "@/models/GeneralSettings";
import{headers} from "next/headers";
import {
  generalSettingsSchema,
  updateGeneralSettingsSchema,
} from "@/lib/validations/general-settings";


import { success } from "better-auth";



// this is the fixed identifiers for our single general settings document

const SETTINGS_KEY ="general";

// reusable authorizatio helper.

async function requireSuperAdmin() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return {
      response: NextResponse.json(
        {
          success: false,
          message: "Authentication required",
        },
        { status: 401 }
      ),
    };
  }

  if (session.user.role !== "super_admin") {
    return {
      response: NextResponse.json(
        {
          success: false,
          message: "You are not authorized to perform this action",
        },
        { status: 403 }
      ),
    };
  }

  return { session };
}


// get : fetch general settings document
// this function does not create or modify database

// export async function GET() {
//   try {
//     const authResult = await requireSuperAdmin();

//     if ("response" in authResult) {
//       return authResult.response;
//     }

//     await connectDB();

//     const settings = await GeneralSettings.findOne({
//       key: SETTINGS_KEY,
//     }).lean();

//     return NextResponse.json({
//       success: true,
//       data: settings,
//     });
//   } catch (error) {
//     console.error("General Settings GET error:", error);

//     return NextResponse.json(
//       {
//         success: false,
//         message: "Failed to fetch General Settings",
//       },
//       { status: 500 }
//     );
//   }
// }


// post : create or update general settings document

export async function POST(request: Request) {
  try {
    const authResult = await requireSuperAdmin();

    if ("response" in authResult) {
      return authResult.response;
    }

    const body: unknown = await request.json();

    const validation = generalSettingsSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Validation failed",
          errors: validation.error.flatten(),
        },
        { status: 400 }
      );
    }

    await connectDB();

    const existingSettings = await GeneralSettings.findOne({
      key: SETTINGS_KEY,
    });

    if (existingSettings) {
      return NextResponse.json(
        {
          success: false,
          message: "General Settings already exist. Use PUT to update.",
        },
        { status: 409 }
      );
    }

    const settings = await GeneralSettings.create({
      ...validation.data,
      key: SETTINGS_KEY,
    });

    return NextResponse.json(
      {
        success: true,
        message: "General Settings created successfully",
        data: settings,
      },
      { status: 201 }
    );
  } catch (error) {
    // A concurrent request may have created the document first.
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === 11000
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "General Settings already exist. Use PUT to update.",
        },
        { status: 409 }
      );
    }

    console.error("General Settings POST error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to create General Settings",
      },
      { status: 500 }
    );
  }
}


// put : update general settings document

export async function PUT(request: Request) {
  try {
    const authResult = await requireSuperAdmin();

    if ("response" in authResult) {
      return authResult.response;
    }

    // Broken JSON bhaye 500 hoina, 400 dine
    const body: unknown = await request.json().catch(() => null);

    if (typeof body !== "object" || body === null || Array.isArray(body)) {
      return NextResponse.json(
        { success: false, message: "Invalid JSON body" },
        { status: 400 }
      );
    }

    const validation = updateGeneralSettingsSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          // Frontend toast ma "Validation failed" ko thau ma asli message dekhaucha
          message: validation.error.issues[0]?.message ?? "Validation failed",
          errors: validation.error.flatten(),
        },
        { status: 400 }
      );
    }

    // Frontend le actually pathayeko paths matra (Zod default le thapeko haina)
    const sentPaths = new Set<string>();

    function collectPaths(obj: Record<string, unknown>, prefix = "") {
      for (const [key, value] of Object.entries(obj)) {
        const path = prefix ? `${prefix}.${key}` : key;

        if (
          value !== null &&
          typeof value === "object" &&
          !Array.isArray(value)
        ) {
          collectPaths(value as Record<string, unknown>, path);
        } else {
          sentPaths.add(path);
        }
      }
    }

    collectPaths(body as Record<string, unknown>);

    const updateData: Record<string, unknown> = {};

    function flattenObject(obj: Record<string, unknown>, prefix = "") {
      for (const [key, value] of Object.entries(obj)) {
        if (value === undefined) continue;

        const path = prefix ? `${prefix}.${key}` : key;

        if (
          value !== null &&
          typeof value === "object" &&
          !Array.isArray(value) &&
          !(value instanceof Date)
        ) {
          flattenObject(value as Record<string, unknown>, path);
        } else if (sentPaths.has(path)) {
          updateData[path] = value;
        }
      }
    }

    flattenObject(validation.data as Record<string, unknown>);

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "No valid fields provided for update",
        },
        { status: 400 }
      );
    }

    await connectDB();

    const settings = await GeneralSettings.findOneAndUpdate(
      { key: SETTINGS_KEY },
      { $set: updateData },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!settings) {
      return NextResponse.json(
        {
          success: false,
          message: "General Settings not found. Create it first using POST.",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "General Settings updated successfully",
      data: settings,
    });
  } catch (error) {
    console.error("General Settings PUT error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to update General Settings",
      },
      { status: 500 }
    );
  }
}