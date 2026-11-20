import { NextResponse } from "next/server";
import { getCurrentAdmin } from "@/src/lib/auth";
import { prisma } from "@/src/prisma";
import { z } from "zod";

const tagSchema = z.object({
  name: z.string().min(1, "Name is required"),
  slug: z.string().min(1, "Slug is required"),
});

export async function GET() {
  const tags = await prisma.blogTag.findMany({
    orderBy: { name: "asc" },
    include: {
      _count: { select: { blogRelations: true } },
    },
  });
  return NextResponse.json({ success: true, data: tags });
}

export async function POST(request: Request) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const parsed = tagSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, errors: parsed.error.flatten().fieldErrors }, { status: 400 });
    }

    const tag = await prisma.blogTag.create({ data: parsed.data });
    return NextResponse.json({ success: true, data: tag });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
