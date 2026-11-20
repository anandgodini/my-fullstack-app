import React from "react";
import Link from "next/link";
import { prisma } from "@/src/prisma";
import PublicHeader from "@/src/components/public/PublicHeader";
import PublicFooter from "@/src/components/public/PublicFooter";
import { FileText, ArrowRight, Sparkles } from "lucide-react";

export const metadata = {
  title: "Blog & Insights | Antigravity Platform",
  description: "Browse articles, updates, and deep dives published by our editorial team.",
};

export default async function PublicBlogListPage() {
  let blogs: any[] = [];
  let categories: any[] = [];

  try {
    const data = await Promise.all([
      prisma.blog.findMany({
        where: { status: "published" },
        orderBy: { createdAt: "desc" },
        include: {
          category: true,
        },
      }),
      prisma.blogCategory.findMany({
        where: { status: "active" },
        include: { _count: { select: { blogs: true } } },
      }),
    ]);
    blogs = data[0];
    categories = data[1];
  } catch (e) {
    console.warn("PublicBlogListPage: Failed to load from database", e);
  }

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 antialiased">
      <PublicHeader />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" /> Editorial Perspectives
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
            Latest Articles & Stories
          </h1>
          <p className="text-sm text-zinc-500 leading-relaxed">
            Discover technology deep-dives, product releases, and design tutorials directly from our authors.
          </p>
        </div>

        {/* Categories Bar */}
        {categories.length > 0 && (
          <div className="flex flex-wrap items-center justify-center gap-2 mb-12">
            <span className="px-3 py-1.5 rounded-full bg-indigo-600 text-white text-xs font-semibold">
              All Posts
            </span>
            {categories.map((c) => (
              <span
                key={c.id}
                className="px-3 py-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs font-medium"
              >
                {c.name} ({c._count.blogs})
              </span>
            ))}
          </div>
        )}

        {/* Blogs Grid */}
        {blogs.length === 0 ? (
          <div className="py-20 text-center text-zinc-400">
            <FileText className="w-12 h-12 mx-auto mb-3 stroke-1 text-zinc-300" />
            <p className="text-sm font-semibold">No published articles yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogs.map((b) => (
              <article
                key={b.id}
                className="group bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-sm flex flex-col justify-between hover:shadow-xl transition-all"
              >
                <div className="relative aspect-video overflow-hidden bg-zinc-100 dark:bg-zinc-800">
                  {b.featuredImage ? (
                    <img
                      src={b.featuredImage}
                      alt={b.imageAltText || b.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-zinc-400">
                      <FileText className="w-8 h-8 stroke-1" />
                    </div>
                  )}
                  {b.category && (
                    <span className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-white/90 dark:bg-zinc-900/90 backdrop-blur-sm text-[10px] font-bold text-indigo-600 shadow-sm">
                      {b.category.name}
                    </span>
                  )}
                </div>

                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-indigo-600 transition-colors line-clamp-2">
                      <Link href={`/blogs/${b.slug}`}>{b.title}</Link>
                    </h3>
                    {b.shortDescription && (
                      <p className="text-xs text-zinc-500 mt-2 line-clamp-3 leading-relaxed">
                        {b.shortDescription}
                      </p>
                    )}
                  </div>

                  <div className="pt-4 mt-6 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-[11px] text-zinc-400">
                    <span>By {b.authorName || "Editorial Staff"}</span>
                    <span>{new Date(b.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>

      <PublicFooter />
    </div>
  );
}
