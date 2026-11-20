import { NextResponse } from "next/server";
import { getCurrentAdmin } from "@/src/lib/auth";
import { prisma } from "@/src/prisma";
import { z } from "zod";

const cmsPageSchema = z.object({
  title: z.string().min(1, "Title is required"),
  slug: z.string().min(1, "Slug is required"),
  shortDescription: z.string().optional().nullable(),
  featuredImage: z.string().optional().nullable(),
  sections: z.any().default([]),
  seoTitle: z.string().optional().nullable(),
  seoDescription: z.string().optional().nullable(),
  canonicalUrl: z.string().optional().nullable(),
  ogImage: z.string().optional().nullable(),
  status: z.enum(["draft", "published"]).default("draft"),
  publishedAt: z.string().optional().nullable(),
});

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const page = await prisma.cMSPage.findUnique({ where: { id } });

  if (!page) {
    return NextResponse.json({ success: false, message: "Page not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true, data: page });
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const body = await request.json();
    const parsed = cmsPageSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, errors: parsed.error.flatten().fieldErrors }, { status: 400 });
    }

    const { publishedAt, ...data } = parsed.data;

    const existing = await prisma.cMSPage.findUnique({ where: { slug: data.slug } });
    if (existing && existing.id !== id) {
      return NextResponse.json({ success: false, message: "A page with this slug already exists" }, { status: 400 });
    }

    const updated = await prisma.cMSPage.update({
      where: { id },
      data: {
        ...data,
        publishedAt: publishedAt ? new Date(publishedAt) : (data.status === "published" ? new Date() : null),
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
    await prisma.cMSPage.delete({ where: { id } });

    return NextResponse.json({ success: true, message: "Page deleted successfully" });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
