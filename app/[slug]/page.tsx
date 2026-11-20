import React from "react";
import { prisma } from "@/src/prisma";
import { notFound } from "next/navigation";
import PublicHeader from "@/src/components/public/PublicHeader";
import PublicFooter from "@/src/components/public/PublicFooter";
import SectionRenderer from "@/src/components/public/SectionRenderer";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const page = await prisma.cMSPage.findUnique({
    where: { slug },
  });

  if (!page || page.status !== "published") {
    return { title: "Page Not Found" };
  }

  return {
    title: page.seoTitle || page.title,
    description: page.seoDescription || page.shortDescription || undefined,
    openGraph: {
      title: page.seoTitle || page.title,
      description: page.seoDescription || page.shortDescription || undefined,
      images: page.ogImage || page.featuredImage ? [page.ogImage || page.featuredImage!] : [],
    },
  };
}

export default async function DynamicCMSPageRoute({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  // Protect system routes
  const reservedSlugs = ["login", "admin", "api", "blogs", "gallery", "team", "contact"];
  if (reservedSlugs.includes(slug)) {
    notFound();
  }

  const page = await prisma.cMSPage.findUnique({
    where: { slug },
  });

  if (!page || page.status !== "published") {
    notFound();
  }

  const sections = Array.isArray(page.sections) ? (page.sections as any[]) : [];

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 antialiased">
      <PublicHeader />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        {/* Render Saved Section Data */}
        <SectionRenderer sections={sections} />
      </main>

      <PublicFooter />
    </div>
  );
}
