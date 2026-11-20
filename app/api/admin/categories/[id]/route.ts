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

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const body = await request.json();
    const parsed = categorySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, errors: parsed.error.flatten().fieldErrors }, { status: 400 });
    }

    const existing = await prisma.blogCategory.findUnique({ where: { slug: parsed.data.slug } });
    if (existing && existing.id !== id) {
      return NextResponse.json({ success: false, message: "Category with this slug already exists" }, { status: 400 });
    }

    const updated = await prisma.blogCategory.update({
      where: { id },
      data: parsed.data,
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
    
    // Check if blogs reference this category
    const count = await prisma.blog.count({ where: { categoryId: id } });
    if (count > 0) {
      return NextResponse.json(
        { success: false, message: `Cannot delete category: ${count} blog(s) are currently assigned to it.` },
        { status: 400 }
      );
    }

    await prisma.blogCategory.delete({ where: { id } });
    return NextResponse.json({ success: true, message: "Category deleted successfully" });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
