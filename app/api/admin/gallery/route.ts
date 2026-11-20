import { NextResponse } from "next/server";
import { getCurrentAdmin } from "@/src/lib/auth";
import { prisma } from "@/src/prisma";
import { z } from "zod";

const galleryImageSchema = z.object({
  title: z.string().min(1, "Title is required"),
  imageUrl: z.string().min(1, "Image URL is required"),
  description: z.string().optional().nullable(),
  altText: z.string().optional().nullable(),
  category: z.string().optional().nullable(),
  albumId: z.string().optional().nullable(),
  displayOrder: z.number().int().default(0),
  status: z.enum(["draft", "published"]).default("published"),
});

export async function GET(request: Request) {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const albumId = searchParams.get("albumId") || "";
  const category = searchParams.get("category") || "";
  const status = searchParams.get("status") || "";
  const search = searchParams.get("search") || "";

  const where: any = {};
  if (albumId) where.albumId = albumId;
  if (category) where.category = category;
  if (status) where.status = status;
  if (search) {
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
    ];
  }

  const images = await prisma.galleryImage.findMany({
    where,
    orderBy: { displayOrder: "asc" },
    include: { album: { select: { id: true, name: true } } },
  });

  return NextResponse.json({ success: true, data: images });
}

export async function POST(request: Request) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

    const body = await request.json();

    // Check if bulk insert
    if (Array.isArray(body)) {
      const created = [];
      for (const item of body) {
        const parsed = galleryImageSchema.safeParse(item);
        if (parsed.success) {
          const img = await prisma.galleryImage.create({ data: parsed.data });
          created.push(img);
        }
      }
      return NextResponse.json({ success: true, message: `Added ${created.length} images`, data: created });
    }

    const parsed = galleryImageSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, errors: parsed.error.flatten().fieldErrors }, { status: 400 });
    }

    const image = await prisma.galleryImage.create({
      data: parsed.data,
      include: { album: true },
    });

    return NextResponse.json({ success: true, data: image });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
