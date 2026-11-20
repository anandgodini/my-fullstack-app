import { NextResponse } from "next/server";
import { getCurrentAdmin } from "@/src/lib/auth";
import { prisma } from "@/src/prisma";
import fs from "fs/promises";
import path from "path";

// Allowed MIME types
const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/svg+xml",
  "application/pdf",
];

// Max file size: 10MB
const MAX_FILE_SIZE = 10 * 1024 * 1024;

export async function GET(request: Request) {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search") || "";
  const type = searchParams.get("type") || "all";
  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = parseInt(searchParams.get("limit") || "24", 10);
  const skip = (page - 1) * limit;

  const where: any = {};
  if (search) {
    where.OR = [
      { fileName: { contains: search, mode: "insensitive" } },
      { title: { contains: search, mode: "insensitive" } },
      { altText: { contains: search, mode: "insensitive" } },
    ];
  }

  if (type === "images") {
    where.mimeType = { startsWith: "image/" };
  } else if (type === "documents") {
    where.mimeType = { not: { startsWith: "image/" } };
  }

  const [items, total] = await Promise.all([
    prisma.media.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.media.count({ where }),
  ]);

  return NextResponse.json({
    success: true,
    data: items,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
}

export async function POST(request: Request) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const contentType = request.headers.get("content-type") || "";

    // Support JSON body for files uploaded directly to Supabase / cloud storage
    if (contentType.includes("application/json")) {
      const body = await request.json();
      const filesToSave = Array.isArray(body) ? body : body.files ? body.files : [body];

      const savedMedia = [];
      for (const item of filesToSave) {
        if (!item.fileUrl || !item.fileName) continue;
        const mediaRecord = await prisma.media.create({
          data: {
            fileName: item.fileName,
            fileUrl: item.fileUrl,
            mimeType: item.mimeType || "application/octet-stream",
            fileSize: item.fileSize || 0,
            title: item.title || item.fileName.split(".")[0],
            altText: item.altText || item.fileName.split(".")[0],
          },
        });
        savedMedia.push(mediaRecord);
      }

      return NextResponse.json({
        success: true,
        message: `Registered ${savedMedia.length} media item(s)`,
        data: savedMedia,
      });
    }

    const formData = await request.formData();
    const files = formData.getAll("files") as File[];

    if (!files || files.length === 0) {
      return NextResponse.json({ success: false, message: "No files provided" }, { status: 400 });
    }

    const savedMedia = [];

    for (const file of files) {
      if (!ALLOWED_TYPES.includes(file.type)) {
        continue;
      }
      if (file.size > MAX_FILE_SIZE) {
        continue;
      }

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Convert buffer to Base64 data URL so it's permanently stored in Postgres
      // and doesn't fail on Vercel's read-only ephemeral filesystem
      const base64 = buffer.toString("base64");
      const dataUrl = `data:${file.type};base64,${base64}`;

      const originalExt = path.extname(file.name).toLowerCase();
      const baseName = path.basename(file.name, originalExt).replace(/[^a-zA-Z0-9_-]/g, "_");

      const mediaRecord = await prisma.media.create({
        data: {
          fileName: file.name,
          fileUrl: dataUrl,
          mimeType: file.type,
          fileSize: file.size,
          title: baseName.replace(/_/g, " "),
          altText: baseName.replace(/_/g, " "),
        },
      });

      savedMedia.push(mediaRecord);
    }

    return NextResponse.json({
      success: true,
      message: `Uploaded ${savedMedia.length} file(s) successfully`,
      data: savedMedia,
    });
  } catch (error: any) {
    console.error("Media upload error:", error);
    return NextResponse.json({ success: false, message: error.message || "Upload failed" }, { status: 500 });
  }
}
