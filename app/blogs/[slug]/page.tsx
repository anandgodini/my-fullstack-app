import React from "react";
import { prisma } from "@/src/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import PublicHeader from "@/src/components/public/PublicHeader";
import PublicFooter from "@/src/components/public/PublicFooter";
import { ArrowLeft, Calendar, User, Tag } from "lucide-react";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const blog = await prisma.blog.findUnique({
    where: { slug },
  });

  if (!blog || blog.status !== "published") {
    return { title: "Blog Not Found" };
  }

  return {
    title: blog.seoTitle || blog.title,
    description: blog.seoDescription || blog.shortDescription || undefined,
    openGraph: {
      title: blog.seoTitle || blog.title,
      description: blog.seoDescription || blog.shortDescription || undefined,
      images: blog.ogImage || blog.featuredImage ? [blog.ogImage || blog.featuredImage!] : [],
    },
  };
}

export default async function BlogPostDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const blog = await prisma.blog.findUnique({
    where: { slug },
    include: {
      category: true,
      tags: { include: { tag: true } },
    },
  });

  if (!blog || blog.status !== "published") {
    notFound();
  }

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 antialiased">
      <PublicHeader />

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
        {/* Back Link */}
        <Link
          href="/blogs"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-500 hover:text-indigo-600 transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to all articles</span>
        </Link>

        {/* Article Meta */}
        <div className="space-y-4 mb-8">
          {blog.category && (
            <span className="inline-block px-3 py-1 rounded-full text-xs font-bold text-indigo-600 bg-indigo-50 dark:bg-indigo-950/60 ring-1 ring-indigo-500/20">
              {blog.category.name}
            </span>
          )}

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight">
            {blog.title}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-xs text-zinc-500 pt-2 border-y border-zinc-100 dark:border-zinc-800 py-3">
            <span className="flex items-center gap-1.5 font-medium">
              <User className="w-3.5 h-3.5" />
              <span>{blog.authorName || "Editorial Staff"}</span>
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              <span>
                {new Date(blog.publishedAt || blog.createdAt).toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
            </span>
          </div>
        </div>

        {/* Featured Image */}
        {blog.featuredImage && (
          <div className="aspect-video rounded-3xl overflow-hidden shadow-xl mb-12 border border-zinc-200 dark:border-zinc-800">
            <img
              src={blog.featuredImage}
              alt={blog.imageAltText || blog.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Content Body */}
        <div
          className="prose prose-zinc dark:prose-invert max-w-none text-sm sm:text-base leading-relaxed space-y-4"
          dangerouslySetInnerHTML={{ __html: blog.content }}
        />

        {/* Tags */}
        {blog.tags.length > 0 && (
          <div className="mt-12 pt-6 border-t border-zinc-200 dark:border-zinc-800 flex items-center gap-2 flex-wrap">
            <Tag className="w-4 h-4 text-zinc-400" />
            {blog.tags.map((t) => (
              <span
                key={t.tag.id}
                className="px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-xs text-zinc-600 dark:text-zinc-300 font-medium"
              >
                #{t.tag.name}
              </span>
            ))}
          </div>
        )}
      </main>

      <PublicFooter />
    </div>
  );
}
