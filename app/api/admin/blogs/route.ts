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
  tags: z.array(z.string()).optional().default([]), // array of tag IDs
});

export async function GET(request: Request) {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search") || "";
  const categoryId = searchParams.get("categoryId") || "";
  const status = searchParams.get("status") || "";
  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = parseInt(searchParams.get("limit") || "10", 10);
  const skip = (page - 1) * limit;

  const where: any = {};
  if (search) {
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { shortDescription: { contains: search, mode: "insensitive" } },
    ];
  }
  if (categoryId) {
    where.categoryId = categoryId;
  }
  if (status) {
    where.status = status;
  }

  const [blogs, total] = await Promise.all([
    prisma.blog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
      include: {
        category: { select: { id: true, name: true, slug: true } },
        tags: { include: { tag: true } },
      },
    }),
    prisma.blog.count({ where }),
  ]);

  return NextResponse.json({
    success: true,
    data: blogs,
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
    if (!admin) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const parsed = blogSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, message: "Validation failed", errors: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { tags, publishedAt, categoryId, ...data } = parsed.data;

    // Check unique slug
    const existing = await prisma.blog.findUnique({ where: { slug: data.slug } });
    if (existing) {
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

    const blog = await prisma.blog.create({
      data: {
        ...data,
        categoryId: validCategoryId,
        publishedAt: data.status === "published" && !publishedAt ? new Date() : (publishedAt ? new Date(publishedAt) : null),
        tags: validTagIds.length > 0 ? {
          create: validTagIds.map((tagId) => ({
            tag: { connect: { id: tagId } },
          })),
        } : undefined,
      },
      include: {
        category: true,
        tags: { include: { tag: true } },
      },
    });

    return NextResponse.json({ success: true, message: "Blog created successfully", data: blog });
  } catch (error: any) {
    console.error("Create blog error:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
