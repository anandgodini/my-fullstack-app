import { NextResponse } from "next/server";
import { getCurrentAdmin } from "@/src/lib/auth";
import { prisma } from "@/src/prisma";
import { z } from "zod";

const categorySchema = z.object({
  name: z.string().min(1, "Name is required"),
  slug: z.string().min(1, "Slug is required"),
  description: z.string().optional().nullable(),
  seoTitle: z.string().optional().nullable(),
  seoDescription: z.string().optional().nullable(),
  status: z.enum(["active", "inactive"]).default("active"),
});

export async function GET() {
  const categories = await prisma.blogCategory.findMany({
    orderBy: { name: "asc" },
    include: {
      _count: { select: { blogs: true } },
    },
  });

  return NextResponse.json({ success: true, data: categories });
}

export async function POST(request: Request) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const parsed = categorySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, errors: parsed.error.flatten().fieldErrors }, { status: 400 });
    }

    const existing = await prisma.blogCategory.findUnique({ where: { slug: parsed.data.slug } });
    if (existing) {
      return NextResponse.json({ success: false, message: "Category with this slug already exists" }, { status: 400 });
    }

    const category = await prisma.blogCategory.create({ data: parsed.data });
    return NextResponse.json({ success: true, data: category });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
