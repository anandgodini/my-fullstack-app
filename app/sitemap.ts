import { prisma } from "@/src/prisma";
import type { MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  // Public static routes
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date() },
    { url: `${baseUrl}/blogs`, lastModified: new Date() },
    { url: `${baseUrl}/gallery`, lastModified: new Date() },
    { url: `${baseUrl}/team`, lastModified: new Date() },
    { url: `${baseUrl}/contact`, lastModified: new Date() },
  ];

  try {
    // Dynamic published blogs
    const blogs = await prisma.blog.findMany({
      where: { status: "published" },
      select: { slug: true, updatedAt: true },
    });

    const blogRoutes: MetadataRoute.Sitemap = blogs.map((b) => ({
      url: `${baseUrl}/blogs/${b.slug}`,
      lastModified: b.updatedAt,
    }));

    // Dynamic published CMS Pages
    const pages = await prisma.cMSPage.findMany({
      where: { status: "published" },
      select: { slug: true, updatedAt: true },
    });

    const pageRoutes: MetadataRoute.Sitemap = pages.map((p) => ({
      url: `${baseUrl}/${p.slug}`,
      lastModified: p.updatedAt,
    }));

    return [...staticRoutes, ...blogRoutes, ...pageRoutes];
  } catch (error) {
    console.warn("Database not yet migrated or populated during static prerender, returning static routes.", error);
    return staticRoutes;
  }
}
