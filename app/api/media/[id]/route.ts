import { NextResponse } from "next/server";
import { prisma } from "@/src/prisma";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const media = await prisma.media.findUnique({
      where: { id },
    });

    if (!media) {
      return new NextResponse("Not Found", { status: 404 });
    }

    // If it's a data URI
    if (media.fileUrl.startsWith("data:")) {
      const match = media.fileUrl.match(/^data:([^;]+);base64,(.+)$/);
      if (match) {
        const mimeType = match[1];
        const base64Data = match[2];
        const buffer = Buffer.from(base64Data, "base64");

        return new NextResponse(buffer, {
          headers: {
            "Content-Type": mimeType,
            "Content-Length": buffer.length.toString(),
            "Cache-Control": "public, max-age=31536000, immutable",
          },
        });
      }
    }

    // If it's an external URL (Supabase, S3, CDN)
    if (media.fileUrl.startsWith("http://") || media.fileUrl.startsWith("https://")) {
      return NextResponse.redirect(media.fileUrl);
    }

    // Default redirect to stored URL
    return NextResponse.redirect(media.fileUrl);
  } catch (err: any) {
    console.error("Error serving media:", err);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
