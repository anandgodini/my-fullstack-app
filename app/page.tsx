import React from "react";
import Link from "next/link";
import { prisma } from "@/src/prisma";
import PublicHeader from "@/src/components/public/PublicHeader";
import PublicFooter from "@/src/components/public/PublicFooter";
import {
  ArrowRight,
  Sparkles,
  Layers,
  FileText,
  Users,
  Image as ImageIcon,
  CheckCircle2,
  Star,
  HelpCircle,
} from "lucide-react";

export default async function HomePage() {
  const [
    featuredBlogs,
    testimonials,
    faqs,
    teamMembers,
    galleryImages,
    siteSettings,
  ] = await Promise.all([
    prisma.blog.findMany({
      where: { status: "published" },
      take: 3,
      orderBy: { createdAt: "desc" },
      include: { category: true },
    }),
    prisma.testimonial.findMany({
      where: { isPublished: true },
      take: 3,
      orderBy: { displayOrder: "asc" },
    }),
    prisma.fAQ.findMany({
      where: { isPublished: true },
      take: 4,
      orderBy: { displayOrder: "asc" },
    }),
    prisma.teamMember.findMany({
      where: { isActive: true },
      take: 4,
      orderBy: { displayOrder: "asc" },
      include: { department: true },
    }),
    prisma.galleryImage.findMany({
      where: { status: "published" },
      take: 6,
      orderBy: { displayOrder: "asc" },
    }),
    prisma.siteSetting.findMany(),
  ]);

  const settingsMap: Record<string, string> = {};
  for (const s of siteSettings) {
    settingsMap[s.key] = s.value;
  }

  const siteName = settingsMap.site_name || "Antigravity Dynamic CMS";
  const siteDesc = settingsMap.site_description || "A modern dynamic web platform with full real-time database management.";

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 antialiased">
      <PublicHeader />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-20 sm:py-28 bg-gradient-to-b from-indigo-50/50 via-white to-white dark:from-indigo-950/20 dark:via-zinc-950 dark:to-zinc-950 border-b border-zinc-200 dark:border-zinc-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 text-xs font-semibold ring-1 ring-indigo-500/20 shadow-sm">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Database Driven Fullstack Experience</span>
            </div>

            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50 max-w-3xl mx-auto leading-tight">
              {siteName}
            </h1>

            <p className="text-base sm:text-lg text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto leading-relaxed">
              {siteDesc}
            </p>

            <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/blogs"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-lg shadow-indigo-600/25 transition-transform hover:scale-105"
              >
                <span>Read Latest Articles</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/about"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-200 text-xs font-bold transition-colors"
              >
                <span>Discover Our Story</span>
              </Link>
            </div>
          </div>
        </section>

        {/* Dynamic Featured Blogs */}
        {featuredBlogs.length > 0 && (
          <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                  Insights & Updates
                </span>
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 mt-1">
                  Featured Publications
                </h2>
              </div>
              <Link
                href="/blogs"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                <span>View all articles</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {featuredBlogs.map((blog) => (
                <article
                  key={blog.id}
                  className="group bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-sm flex flex-col justify-between hover:shadow-xl transition-all"
                >
                  <div className="relative aspect-video overflow-hidden bg-zinc-100 dark:bg-zinc-800">
                    {blog.featuredImage ? (
                      <img
                        src={blog.featuredImage}
                        alt={blog.imageAltText || blog.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-zinc-400">
                        <FileText className="w-8 h-8 stroke-1" />
                      </div>
                    )}
                    {blog.category && (
                      <span className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-white/90 dark:bg-zinc-900/90 backdrop-blur-sm text-[10px] font-bold text-indigo-600 shadow-sm">
                        {blog.category.name}
                      </span>
                    )}
                  </div>

                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-indigo-600 transition-colors line-clamp-2">
                        <Link href={`/blogs/${blog.slug}`}>{blog.title}</Link>
                      </h3>
                      {blog.shortDescription && (
                        <p className="text-xs text-zinc-500 mt-2 line-clamp-2 leading-relaxed">
                          {blog.shortDescription}
                        </p>
                      )}
                    </div>

                    <div className="pt-4 mt-4 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-[11px] text-zinc-400">
                      <span>By {blog.authorName || "Editorial Team"}</span>
                      <span>{new Date(blog.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        {/* Visual Gallery Grid Showcase */}
        {galleryImages.length > 0 && (
          <section className="py-20 bg-zinc-50 dark:bg-zinc-900/50 border-y border-zinc-200 dark:border-zinc-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-4">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                    Visual Portfolio
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 mt-1">
                    Featured Photography & Moments
                  </h2>
                </div>
                <Link
                  href="/gallery"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  <span>Explore full gallery</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {galleryImages.map((img) => (
                  <div
                    key={img.id}
                    className="group relative aspect-square rounded-2xl overflow-hidden shadow-sm bg-zinc-200 dark:bg-zinc-800"
                  >
                    <img
                      src={img.imageUrl}
                      alt={img.altText || img.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                      <span className="text-xs text-white font-medium truncate block w-full">
                        {img.title}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Dynamic Team Members */}
        {teamMembers.length > 0 && (
          <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-xl mx-auto mb-16 space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                Our Leadership
              </span>
              <h2 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                Meet the Experts Behind Our Vision
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
              {teamMembers.map((m) => (
                <div
                  key={m.id}
                  className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 p-6 text-center shadow-sm flex flex-col items-center justify-between"
                >
                  <div className="flex flex-col items-center">
                    <div className="w-24 h-24 rounded-full overflow-hidden bg-zinc-100 dark:bg-zinc-800 mb-4 ring-2 ring-indigo-500/20">
                      {m.profilePhoto ? (
                        <img src={m.profilePhoto} alt={m.fullName} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center font-bold text-xl text-zinc-400">
                          {m.fullName.charAt(0)}
                        </div>
                      )}
                    </div>
                    <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                      {m.fullName}
                    </h3>
                    <p className="text-xs text-indigo-600 dark:text-indigo-400 font-medium mt-0.5">
                      {m.designation}
                    </p>
                    {m.department && (
                      <span className="mt-2 text-[10px] px-2.5 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500">
                        {m.department.name}
                      </span>
                    )}
                  </div>
                  {m.bio && (
                    <p className="text-xs text-zinc-500 mt-4 line-clamp-2">
                      {m.bio}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Testimonials */}
        {testimonials.length > 0 && (
          <section className="py-20 bg-zinc-50 dark:bg-zinc-900/50 border-t border-zinc-200 dark:border-zinc-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center max-w-xl mx-auto mb-16 space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                  Client Testimonials
                </span>
                <h2 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                  Trusted by Forward-Thinking Partners
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {testimonials.map((t) => (
                  <div
                    key={t.id}
                    className="bg-white dark:bg-zinc-900 p-8 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-1 text-amber-500 mb-4">
                        {Array.from({ length: t.rating }).map((_, i) => (
                          <Star key={i} className="w-4 h-4 fill-current" />
                        ))}
                      </div>
                      <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed italic mb-6">
                        &ldquo;{t.content}&rdquo;
                      </p>
                    </div>

                    <div className="flex items-center gap-3 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                      <div className="w-10 h-10 rounded-full overflow-hidden bg-zinc-100 shrink-0">
                        {t.profileImage ? (
                          <img src={t.profileImage} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center font-bold text-xs text-zinc-400">
                            {t.customerName.charAt(0)}
                          </div>
                        )}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                          {t.customerName}
                        </h4>
                        <p className="text-[11px] text-zinc-400">
                          {t.designation} {t.company && `at ${t.company}`}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* FAQs */}
        {faqs.length > 0 && (
          <section className="py-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12 space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                Help & Answers
              </span>
              <h2 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                Frequently Asked Questions
              </h2>
            </div>

            <div className="space-y-4">
              {faqs.map((f) => (
                <div
                  key={f.id}
                  className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-2"
                >
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                    <HelpCircle className="w-4 h-4 text-indigo-600 shrink-0" />
                    <span>{f.question}</span>
                  </h3>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed pl-6">
                    {f.answer}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>

      <PublicFooter />
    </div>
  );
}
