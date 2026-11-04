import { NextResponse } from "next/server";
import {headers} from "next/headers";
import { auth } from "@/lib/auth";
import cloudinary from "@/lib/cloudinary";

export async function DELETE(request: Request) {
    try{
        // authentication check

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

        // admin role check

        if (
      session.user.role !== "admin" &&
      session.user.role !== "super_admin"
        ) {
        return NextResponse.json(
            {
            success: false,
            message: "You are not authorized to perform this action",
            },
            { status: 403 }
        );
        }

        // get public_id from request body

        const body: unknown = await request.json();

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

        const publicId = body.public_id;


        // delete image from cloudinary

       const result = await cloudinary.uploader.destroy(publicId, {
        resource_type: "image",
        });

        // check deletion result

        if (result.result !== "ok") {
        return NextResponse.json(
            {
            success: false,
            message: "Image not found or already deleted",
            data: result,
            },
            { status: 404 }
        );
        }

        // resturn success response

        return NextResponse.json({
        success: true,
        message: "Image deleted successfully",
        data: result,
        });
    } catch (error) {
        console.error("Image Delete Error:", error);

        return NextResponse.json(
        {
            success: false,
            message: "Failed to delete image",
        },
        { status: 500 }
        );
    }
    }
