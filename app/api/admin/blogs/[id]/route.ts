import { NextResponse } from "next/server";
import { getCurrentAdmin } from "@/src/lib/auth";
import { prisma } from "@/src/prisma";
import { z } from "zod";

const blogSchema = z.object({
  title: z.string().min(1, "Title is required"),
  slug: z.string().min(1, "Slug is required"),
  shortDescription: z.string().optional().nullable(),
  content: z.string().min(1, "Content is required"),
  featuredImage: z.string().optional().nullable(),
  imageAltText: z.string().optional().nullable(),
  categoryId: z
    .string()
    .optional()
    .nullable()
    .transform((val) => (val && val.trim() !== "" ? val.trim() : null)),
  authorName: z.string().optional().default("Admin"),
  seoTitle: z.string().optional().nullable(),
  seoDescription: z.string().optional().nullable(),
  canonicalUrl: z.string().optional().nullable(),
  ogImage: z.string().optional().nullable(),
  status: z.enum(["draft", "published", "scheduled"]).default("draft"),
  isFeatured: z.boolean().default(false),
  publishedAt: z.string().optional().nullable(),
  tags: z.array(z.string()).optional().default([]),
});

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const blog = await prisma.blog.findUnique({
    where: { id },
    include: {
      category: true,
      tags: { include: { tag: true } },
    },
  });

  if (!blog) {
    return NextResponse.json({ success: false, message: "Blog not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true, data: blog });
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
    const parsed = blogSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, message: "Validation failed", errors: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { tags, publishedAt, categoryId, ...data } = parsed.data;

    // Check slug collision
    const existing = await prisma.blog.findUnique({ where: { slug: data.slug } });
    if (existing && existing.id !== id) {
      return NextResponse.json({ success: false, message: "A blog post with this slug already exists" }, { status: 400 });
    }

    // Verify category exists if provided
    let validCategoryId: string | null = null;
    if (categoryId) {
      const cat = await prisma.blogCategory.findUnique({ where: { id: categoryId } });
      if (cat) validCategoryId = cat.id;
    }

    // Verify tag IDs exist
    let validTagIds: string[] = [];
    if (tags && tags.length > 0) {
      const existingTags = await prisma.blogTag.findMany({
        where: { id: { in: tags } },
        select: { id: true },
      });
      validTagIds = existingTags.map((t) => t.id);
    }

    // Update tags with transaction
    await prisma.$transaction(async (tx) => {
      await tx.blogTagRelation.deleteMany({ where: { blogId: id } });

      await tx.blog.update({
        where: { id },
        data: {
          ...data,
          categoryId: validCategoryId,
          publishedAt: publishedAt ? new Date(publishedAt) : (data.status === "published" ? new Date() : null),
          tags: validTagIds.length > 0 ? {
            create: validTagIds.map((tId) => ({
              tag: { connect: { id: tId } },
            })),
          } : undefined,
        },
      });
    });

    const updated = await prisma.blog.findUnique({
      where: { id },
      include: { category: true, tags: { include: { tag: true } } },
    });

    return NextResponse.json({ success: true, message: "Blog updated successfully", data: updated });
  } catch (error: any) {
    console.error("Update blog error:", error);
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
    await prisma.blog.delete({ where: { id } });

    return NextResponse.json({ success: true, message: "Blog deleted successfully" });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
