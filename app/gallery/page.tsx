import React from "react";
import { prisma } from "@/src/prisma";
import PublicHeader from "@/src/components/public/PublicHeader";
import PublicFooter from "@/src/components/public/PublicFooter";
import { Image as ImageIcon, Sparkles } from "lucide-react";

export const metadata = {
  title: "Photo Gallery | Antigravity Platform",
  description: "Browse our dynamic visual album collections and creative showcases.",
};

export default async function PublicGalleryPage() {
  let images: any[] = [];
  let albums: any[] = [];

  try {
    const data = await Promise.all([
      prisma.galleryImage.findMany({
        where: { status: "published" },
        orderBy: { displayOrder: "asc" },
        include: { album: true },
      }),
      prisma.galleryAlbum.findMany({
        where: { status: "published" },
        orderBy: { displayOrder: "asc" },
        include: { _count: { select: { images: true } } },
      }),
    ]);
    images = data[0];
    albums = data[1];
  } catch (e) {
    console.warn("PublicGalleryPage: Failed to load from database", e);
  }

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 antialiased">
      <PublicHeader />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" /> Curated Imagery
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
            Visual Story Gallery
          </h1>
          <p className="text-sm text-zinc-500 leading-relaxed">
            High-resolution snapshots from our community, milestones, and design portfolios.
          </p>
        </div>

        {/* Albums Filter */}
        {albums.length > 0 && (
          <div className="flex flex-wrap items-center justify-center gap-2 mb-12">
            <span className="px-3.5 py-1.5 rounded-full bg-indigo-600 text-white text-xs font-semibold">
              All Photos ({images.length})
            </span>
            {albums.map((a) => (
              <span
                key={a.id}
                className="px-3.5 py-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs font-medium"
              >
                {a.name} ({a._count.images})
              </span>
            ))}
          </div>
        )}

        {/* Masonry / Grid */}
        {images.length === 0 ? (
          <div className="py-20 text-center text-zinc-400">
            <ImageIcon className="w-12 h-12 mx-auto mb-3 stroke-1 text-zinc-300" />
            <p className="text-sm font-semibold">No gallery images found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {images.map((img) => (
              <div
                key={img.id}
                className="group relative aspect-4/3 rounded-3xl overflow-hidden shadow-sm bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 hover:shadow-xl transition-all"
              >
                <img
                  src={img.imageUrl}
                  alt={img.altText || img.title}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-5 text-white">
                  <h4 className="text-sm font-bold truncate">{img.title}</h4>
                  {img.album && (
                    <span className="text-[10px] text-zinc-300 uppercase tracking-wider font-semibold">
                      {img.album.name}
                    </span>
                  )}
                  {img.description && (
                    <p className="text-xs text-zinc-300 mt-1 line-clamp-2">
                      {img.description}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <PublicFooter />
    </div>
  );
}
