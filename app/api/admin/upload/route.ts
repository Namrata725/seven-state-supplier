
import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import cloudinary from "@/lib/cloudinary";
import type { UploadApiResponse } from "cloudinary";

const ALLOWED_FOLDERS = [
  "general",
  "brands",
  "products",
  "categories",
  "packages",
  "galleries",
] as const;

const MAX_FILE_SIZE = 5 * 1024 * 1024;

const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

function isValidImage(buffer: Buffer, mimeType: string) {
  if (mimeType === "image/jpeg") {
    return (
      buffer[0] === 0xff &&
      buffer[1] === 0xd8 &&
      buffer[2] === 0xff
    );
  }

  if (mimeType === "image/png") {
    return buffer.subarray(0, 8).equals(
      Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])
    );
  }

  if (mimeType === "image/webp") {
    return (
      buffer.toString("ascii", 0, 4) === "RIFF" &&
      buffer.toString("ascii", 8, 12) === "WEBP"
    );
  }

  return false;
}

export async function POST(request: Request) {
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

    // Parse form data
    const formData = await request.formData();

    const file = formData.get("file");
    const folder = formData.get("folder");

    if (!(file instanceof File)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid file",
        },
        { status: 400 }
      );
    }

    // Folder validation
    if (
      typeof folder !== "string" ||
      !(ALLOWED_FOLDERS as readonly string[]).includes(folder)
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid upload folder",
        },
        { status: 400 }
      );
    }

    // General folder permission
    if (folder === "general" && role !== "super_admin") {
      return NextResponse.json(
        {
          success: false,
          message: "Only super admin can upload general images",
        },
        { status: 403 }
      );
    }

    // File type validation
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        {
          success: false,
          message: "Only JPEG, PNG, and WEBP are allowed",
        },
        { status: 400 }
      );
    }

    // File size validation
    if (file.size === 0 || file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          success: false,
          message: "File size must be between 1 byte and 5MB",
        },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Verify actual image content
    if (!isValidImage(buffer, file.type)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid image content",
        },
        { status: 400 }
      );
    }

    // Upload to Cloudinary
    const result = await new Promise<UploadApiResponse>(
      (resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder: `seven-state-suppliers/${folder}`,
            resource_type: "image",
          },
          (error, result) => {
            if (error) {
              reject(error);
            } else if (!result) {
              reject(new Error("Cloudinary upload failed"));
            } else {
              resolve(result);
            }
          }
        );

        stream.end(buffer);
      }
    );

    return NextResponse.json(
      {
        success: true,
        message: "File uploaded successfully",
        data: {
          url: result.secure_url,
          public_id: result.public_id,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("File upload error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to upload file",
      },
      { status: 500 }
    );
  }
}
