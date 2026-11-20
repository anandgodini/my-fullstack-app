import React from "react";
import Link from "next/link";
import { prisma } from "@/src/prisma";
import {
  FileText,
  Image as ImageIcon,
  Users,
  Layers,
  Mail,
  PlusCircle,
  Upload,
  UserPlus,
  FilePlus,
  ArrowRight,
  Clock,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

export default async function AdminDashboardOverview() {
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

  const statCards = [
    {
      title: "Total Blogs",
      value: totalBlogs,
      subtitle: `${publishedBlogs} published • ${draftBlogs} drafts`,
      icon: FileText,
      color: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
      href: "/admin/blogs",
    },
    {
      title: "Gallery Images",
      value: totalGalleryImages,
      subtitle: `Across ${totalGalleryAlbums} album(s)`,
      icon: ImageIcon,
      color: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
      href: "/admin/gallery",
    },
    {
      title: "Team Members",
      value: totalTeamMembers,
      subtitle: "Active profiles",
      icon: Users,
      color: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
      href: "/admin/team",
    },
    {
      title: "CMS Pages",
      value: totalCMSPages,
      subtitle: `${publishedCMSPages} live on site`,
      icon: Layers,
      color: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
      href: "/admin/pages",
    },
    {
      title: "Contact Enquiries",
      value: totalContactEnquiries,
      subtitle: `${pendingEnquiries} pending review`,
      icon: Mail,
      color: "bg-rose-500/10 text-rose-600 dark:text-rose-400",
      href: "/admin/enquiries",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Top Banner & Quick Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Website Overview
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Real-time content metrics and quick authoring shortcuts.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            href="/admin/blogs/new"
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition-colors"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create Blog</span>
          </Link>
          <Link
            href="/admin/media"
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 text-xs font-semibold transition-colors"
          >
            <Upload className="w-4 h-4" />
            <span>Upload Images</span>
          </Link>
          <Link
            href="/admin/team/new"
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 text-xs font-semibold transition-colors"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add Member</span>
          </Link>
          <Link
            href="/admin/pages/new"
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 text-xs font-semibold transition-colors"
          >
            <FilePlus className="w-4 h-4" />
            <span>Create Page</span>
          </Link>
        </div>
      </div>

      {/* Database Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {statCards.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <Link
              key={i}
              href={stat.href}
              className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm hover:border-indigo-300 dark:hover:border-indigo-800 transition-all group"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                  {stat.title}
                </span>
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${stat.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3">
                <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                  {stat.value}
                </div>
                <div className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                  {stat.subtitle}
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Recent Activity Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recently Created Blogs */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
              Recently Created Blogs
            </h2>
            <Link
              href="/admin/blogs"
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
            >
              View all <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {recentBlogs.length === 0 ? (
            <div className="py-8 text-center text-zinc-400 text-sm">
              No blogs created yet.
            </div>
          ) : (
            <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {recentBlogs.map((b) => (
                <div key={b.id} className="py-3 flex items-center justify-between">
                  <div className="min-w-0 pr-4">
                    <Link
                      href={`/admin/blogs/${b.id}`}
                      className="text-sm font-medium text-zinc-900 dark:text-zinc-100 hover:text-indigo-600 dark:hover:text-indigo-400 truncate block"
                    >
                      {b.title}
                    </Link>
                    <div className="text-[11px] text-zinc-400 flex items-center gap-2 mt-0.5">
                      <span>By {b.authorName || "Admin"}</span>
                      <span>•</span>
                      <span>{new Date(b.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <span
                    className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full ${
                      b.status === "published"
                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400"
                        : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
                    }`}
                  >
                    {b.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recently Updated CMS Pages */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
              Recently Updated CMS Pages
            </h2>
            <Link
              href="/admin/pages"
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
            >
              View all <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {recentPages.length === 0 ? (
            <div className="py-8 text-center text-zinc-400 text-sm">
              No custom pages yet.
            </div>
          ) : (
            <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {recentPages.map((p) => (
                <div key={p.id} className="py-3 flex items-center justify-between">
                  <div className="min-w-0 pr-4">
                    <Link
                      href={`/admin/pages/${p.id}`}
                      className="text-sm font-medium text-zinc-900 dark:text-zinc-100 hover:text-indigo-600 dark:hover:text-indigo-400 truncate block"
                    >
                      {p.title}
                    </Link>
                    <div className="text-[11px] text-zinc-400 mt-0.5">
                      Slug: /{p.slug} • Updated {new Date(p.updatedAt).toLocaleDateString()}
                    </div>
                  </div>
                  <span
                    className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full ${
                      p.status === "published"
                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400"
                        : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
                    }`}
                  >
                    {p.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Contact Enquiries */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
              Recent Contact Enquiries
            </h2>
            <Link
              href="/admin/enquiries"
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
            >
              View all <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {recentEnquiries.length === 0 ? (
            <div className="py-8 text-center text-zinc-400 text-sm">
              No enquiries submitted yet.
            </div>
          ) : (
            <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {recentEnquiries.map((e) => (
                <div key={e.id} className="py-3 flex items-center justify-between">
                  <div className="min-w-0 pr-4">
                    <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">
                      {e.name} <span className="text-xs text-zinc-400">({e.email})</span>
                    </p>
                    <p className="text-xs text-zinc-500 truncate mt-0.5">
                      {e.subject || "No subject"}
                    </p>
                  </div>
                  <span
                    className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full ${
                      e.status === "new"
                        ? "bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400"
                        : e.status === "in_progress"
                        ? "bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400"
                        : "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400"
                    }`}
                  >
                    {e.status.replace("_", " ")}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recently Uploaded Gallery & Media */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
              Recent Gallery Images
            </h2>
            <Link
              href="/admin/gallery"
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
            >
              View all <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {recentImages.length === 0 ? (
            <div className="py-8 text-center text-zinc-400 text-sm">
              No gallery images uploaded yet.
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-3">
              {recentImages.map((img) => (
                <div
                  key={img.id}
                  className="group relative aspect-square rounded-xl overflow-hidden bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700"
                >
                  <img
                    src={img.imageUrl}
                    alt={img.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
                    <span className="text-[10px] text-white font-medium truncate block w-full">
                      {img.title}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
