import { NextResponse } from "next/server";
import { getCurrentAdmin } from "@/src/lib/auth";
import { prisma } from "@/src/prisma";
import fs from "fs/promises";
import path from "path";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const body = await request.json();
    const { title, altText } = body;

    const updated = await prisma.media.update({
      where: { id },
      data: {
        title: title !== undefined ? title : undefined,
        altText: altText !== undefined ? altText : undefined,
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const media = await prisma.media.findUnique({ where: { id } });

    if (!media) {
      return NextResponse.json({ success: false, message: "File not found" }, { status: 404 });
    }

    // Try to remove from filesystem if local
    if (media.fileUrl.startsWith("/uploads/")) {
      const diskPath = path.join(process.cwd(), "public", media.fileUrl);
      try {
        await fs.unlink(diskPath);
      } catch (err) {
        // Ignored if file doesn't exist
      }
    }

    await prisma.media.delete({ where: { id } });

    return NextResponse.json({ success: true, message: "Media deleted successfully" });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
