import { NextResponse } from "next/server";
import { getCurrentAdmin } from "@/src/lib/auth";
import { prisma } from "@/src/prisma";

export async function GET() {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  const [
    totalBlogs,
    publishedBlogs,
    draftBlogs,
    totalGalleryImages,
    totalGalleryAlbums,
    totalTeamMembers,
    totalCMSPages,
    publishedCMSPages,
    totalContactEnquiries,
    pendingEnquiries,
    recentBlogs,
    recentPages,
    recentImages,
    recentEnquiries,
  ] = await Promise.all([
    prisma.blog.count(),
    prisma.blog.count({ where: { status: "published" } }),
    prisma.blog.count({ where: { status: "draft" } }),
    prisma.galleryImage.count(),
    prisma.galleryAlbum.count(),
    prisma.teamMember.count(),
    prisma.cMSPage.count(),
    prisma.cMSPage.count({ where: { status: "published" } }),
    prisma.contactEnquiry.count(),
    prisma.contactEnquiry.count({ where: { status: "new" } }),

    prisma.blog.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      select: { id: true, title: true, slug: true, status: true, createdAt: true, authorName: true },
    }),
    prisma.cMSPage.findMany({
      take: 5,
      orderBy: { updatedAt: "desc" },
      select: { id: true, title: true, slug: true, status: true, updatedAt: true },
    }),
    prisma.galleryImage.findMany({
      take: 6,
      orderBy: { createdAt: "desc" },
      select: { id: true, title: true, imageUrl: true, createdAt: true },
    }),
    prisma.contactEnquiry.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      select: { id: true, name: true, email: true, subject: true, status: true, createdAt: true },
    }),
  ]);

  return NextResponse.json({
    success: true,
    stats: {
      totalBlogs,
      publishedBlogs,
      draftBlogs,
      totalGalleryImages,
      totalGalleryAlbums,
      totalTeamMembers,
      totalCMSPages,
      publishedCMSPages,
      totalContactEnquiries,
      pendingEnquiries,
    },
    recentBlogs,
    recentPages,
    recentImages,
    recentEnquiries,
  });
}
