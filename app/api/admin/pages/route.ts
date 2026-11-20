import { NextResponse } from "next/server";
import { getCurrentAdmin } from "@/src/lib/auth";
import { prisma } from "@/src/prisma";
import { z } from "zod";

const cmsPageSchema = z.object({
  title: z.string().min(1, "Title is required"),
  slug: z.string().min(1, "Slug is required"),
  shortDescription: z.string().optional().nullable(),
  featuredImage: z.string().optional().nullable(),
  sections: z.any().default([]), // array of validated section objects
  seoTitle: z.string().optional().nullable(),
  seoDescription: z.string().optional().nullable(),
  canonicalUrl: z.string().optional().nullable(),
  ogImage: z.string().optional().nullable(),
  status: z.enum(["draft", "published"]).default("draft"),
  publishedAt: z.string().optional().nullable(),
});

export async function GET(request: Request) {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search") || "";
  const status = searchParams.get("status") || "";

  const where: any = {};
  if (search) {
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { slug: { contains: search, mode: "insensitive" } },
    ];
  }
  if (status) where.status = status;

  const pages = await prisma.cMSPage.findMany({
    where,
    orderBy: { updatedAt: "desc" },
  });

  return NextResponse.json({ success: true, data: pages });
}

export async function POST(request: Request) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const parsed = cmsPageSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, errors: parsed.error.flatten().fieldErrors }, { status: 400 });
    }

    const { publishedAt, ...data } = parsed.data;

    const existing = await prisma.cMSPage.findUnique({ where: { slug: data.slug } });
    if (existing) {
      return NextResponse.json({ success: false, message: "A page with this slug already exists" }, { status: 400 });
    }

    const page = await prisma.cMSPage.create({
      data: {
        ...data,
        publishedAt: data.status === "published" && !publishedAt ? new Date() : (publishedAt ? new Date(publishedAt) : null),
      },
    });

    return NextResponse.json({ success: true, data: page });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
