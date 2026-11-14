
import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import cloudinary from "@/lib/cloudinary";

const ALLOWED_PREFIXES = [
  "seven-state-suppliers/brands/",
  "seven-state-suppliers/products/",
  "seven-state-suppliers/categories/",
  "seven-state-suppliers/packages/",
  "seven-state-suppliers/galleries/",
];

const GENERAL_PREFIX = "seven-state-suppliers/general/";

export async function DELETE(request: Request) {
  try {
    // Authentication
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json(
        {
          success: false,
          message: "Authentication required",
        },
        { status: 401 }
      );
    }

    const role = session.user.role;

    if (role !== "admin" && role !== "super_admin") {
      return NextResponse.json(
        {
          success: false,
          message: "You are not authorized",
        },
        { status: 403 }
      );
    }

    // Parse request body
    const body: unknown = await request.json().catch(() => null);

    if (
      typeof body !== "object" ||
      body === null ||
      !("public_id" in body) ||
      typeof body.public_id !== "string" ||
      !body.public_id.trim()
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Valid public_id is required",
        },
        { status: 400 }
      );
    }

    const publicId = body.public_id.trim();

    // Prevent invalid paths
    if (
      publicId.includes("..") ||
      publicId.includes("\\") ||
      publicId.startsWith("/")
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid image public_id",
        },
        { status: 400 }
      );
    }

    // General folder permission
    const isGeneralImage = publicId.startsWith(GENERAL_PREFIX);

    if (isGeneralImage && role !== "super_admin") {
      return NextResponse.json(
        {
          success: false,
          message: "Only super admin can delete general images",
        },
        { status: 403 }
      );
    }

    // Check allowed folder ownership
    const hasAllowedPrefix = ALLOWED_PREFIXES.some((prefix) =>
      publicId.startsWith(prefix)
    );

    if (!isGeneralImage && !hasAllowedPrefix) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid image folder",
        },
        { status: 400 }
      );
    }

    // Delete from Cloudinary
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: "image",
    });

    if (result.result !== "ok") {
      return NextResponse.json(
        {
          success: false,
          message: "Image not found or already deleted",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Image deleted successfully",
    });
  } catch (error) {
    console.error("Image delete error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to delete image",
      },
      { status: 500 }
    );
  }
}
