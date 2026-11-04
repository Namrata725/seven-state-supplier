import { NextResponse } from "next/server";
import {headers} from "next/headers";
import { auth } from "@/lib/auth";

import cloudinary from "@/lib/cloudinary";

const ALLOWED_FOLDERS = ["general",
  "brands",
  "products",
  "categories",
  "packages",
  "galleries",] as const;

  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

  const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"] ;

  export async function POST (request : Request){
    try{
        // authentication check

        const session =await auth.api.getSession({
            headers: await headers(),
            });
    if(!session){
        return NextResponse.json(
            {
                success: false,
                message: "Authentication required",
            },
            {status: 401}
        );
    
    }

    // admin role check

    if(
        session.user.role !== "admin" &&
        session.user.role !== "super_admin"
         ){
            return NextResponse.json(
                {
                    success: false,
                    message:"Your are not authorized to perform this action",
                },
                {status: 403}
            );
         }

         // parse the form data from the request

        const formData =await request.formData();
        
        const file =formData.get("file");
        const folder =formData.get("folder");

        // validation file

        if(!(file instanceof File)){
            return NextResponse.json(
            {
                success: false,
                message: "Invalid file",
            },
            {status: 400}
        );
        
    }  

    if(!ALLOWED_TYPES.includes(file.type)){
        return NextResponse.json(
            {
                success: false,
                message: "Invalid file type. Only JPEG, PNG, and WEBP are allowed",
            },
            {status: 400}
        );
    }

    if(file.size > MAX_FILE_SIZE){
        return NextResponse.json(
            {success: false,
            message: "File size exceeds the maximum limit of 5MB",
            },
            {status: 400}
        );
    }

    // validte cloudinary folder

    if (
        typeof folder !== "string" ||
        !ALLOWED_FOLDERS.includes(
            folder as (typeof ALLOWED_FOLDERS)[number]
        )
        ) {
                return NextResponse.json(
                    {
                        success: false,
                        message: "Invalid folder. Allowed folders are: " 
                    },
                    {status: 400}
                );
            }
  

            // convert image to buffer for cloudinary upload

            const bytes = await file.arrayBuffer();
            const buffer = Buffer.from(bytes);

            // upload the image to cloudinary

            const result = await new Promise<any>((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
                {
                folder: `seven-state-suppliers/${folder}`,
                resource_type: "image",
                },
                (error, result) => {
                if (error) reject(error);
                else resolve(result);
                }
            );

            stream.end(buffer);
            });

    // reurn to uploaded image URL

    return NextResponse.json(
        {
            success: true,
            message: "File uploaded successfully",
            data:{
                url: result.secure_url,
                public_id: result.public_id,
            },
        },
        {status: 201}
    );
    
  }catch (error) {
    console.error("File upload error:", error);
    return NextResponse.json(
        {
            success: false,
            message: "Failed to upload file",
        },
        {status: 500}
    );
  }
  }