"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Album,
  Plus,
  Edit,
  Trash2,
  ArrowLeft,
  Loader2,
  X,
  Image as ImageIcon,
} from "lucide-react";
import { toast } from "sonner";
import MediaPickerModal from "@/src/components/media/MediaPickerModal";

export default function AlbumsPage() {
  const [albums, setAlbums] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);
  const [editingAlbum, setEditingAlbum] = useState<any | null>(null);

  const [form, setForm] = useState({
    name: "",
    slug: "",
    description: "",
    coverImage: "",
    displayOrder: 0,
    status: "published",
  });

  useEffect(() => {
    fetchAlbums();
  }, []);

  const fetchAlbums = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/albums");
      const json = await res.json();
      if (json.success) setAlbums(json.data);
    } catch {
      toast.error("Failed to load albums");
    } finally {
      setLoading(false);
    }
  };

  const generateSlug = (val: string) => {
    return val
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");
  };

  const handleOpenModal = (album?: any) => {
    if (album) {
      setEditingAlbum(album);
      setForm({
        name: album.name,
        slug: album.slug,
        description: album.description || "",
        coverImage: album.coverImage || "",
        displayOrder: album.displayOrder || 0,
        status: album.status || "published",
      });
    } else {
      setEditingAlbum(null);
      setForm({
        name: "",
        slug: "",
        description: "",
        coverImage: "",
        displayOrder: albums.length + 1,
        status: "published",
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingAlbum ? `/api/admin/albums/${editingAlbum.id}` : "/api/admin/albums";
      const method = editingAlbum ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const json = await res.json();
      if (json.success) {
        toast.success(editingAlbum ? "Album updated" : "Album created");
        setIsModalOpen(false);
        fetchAlbums();
      } else {
        toast.error(json.message || "Failed to save");
      }
    } catch {
      toast.error("Error saving album");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this album?")) return;
    try {
      const res = await fetch(`/api/admin/albums/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) {
        toast.success("Album deleted");
        fetchAlbums();
      } else {
        toast.error(json.message || "Failed to delete");
      }
    } catch {
      toast.error("Error deleting album");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/gallery"
            className="p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
              Gallery Albums
            </h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
              Group photos by events, portfolios, or collections.
            </p>
          </div>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>New Album</span>
        </button>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="py-20 flex justify-center text-zinc-400">
          <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
        </div>
      ) : albums.length === 0 ? (
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-16 text-center">
          <Album className="w-12 h-12 text-zinc-300 dark:text-zinc-700 mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            No albums created
          </h3>
          <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto">
            Create an album to organize your images into dedicated visual stories.
          </p>
          <button
            onClick={() => handleOpenModal()}
            className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700"
          >
            <Plus className="w-4 h-4" />
            <span>Create Album</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {albums.map((album) => (
            <div
              key={album.id}
              className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-sm flex flex-col justify-between"
            >
              <div className="relative aspect-video bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                {album.coverImage ? (
                  <img
                    src={album.coverImage}
                    alt={album.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-zinc-400 gap-1">
                    <Album className="w-8 h-8 stroke-1" />
                    <span className="text-[11px]">No cover image</span>
                  </div>
                )}
                <div className="absolute top-2 right-2 flex items-center gap-1">
                  <button
                    onClick={() => handleOpenModal(album)}
                    className="p-1.5 rounded-lg bg-white/90 dark:bg-zinc-800/90 text-zinc-800 dark:text-zinc-100 shadow hover:bg-white"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(album.id)}
                    className="p-1.5 rounded-lg bg-rose-600 text-white shadow hover:bg-rose-700"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 truncate">
                    {album.name}
                  </h3>
                  <span className="text-[11px] font-mono text-zinc-400">/{album.slug}</span>
                  {album.description && (
                    <p className="text-xs text-zinc-500 mt-2 line-clamp-2">
                      {album.description}
                    </p>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-xs text-zinc-400">
                  <span>{album._count?.images || 0} photo(s)</span>
                  <span
                    className={`font-semibold uppercase tracking-wider text-[10px] ${
                      album.status === "published" ? "text-emerald-600" : "text-zinc-400"
                    }`}
                  >
                    {album.status}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Album Form Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-zinc-900 w-full max-w-lg rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-2xl p-6">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-100 dark:border-zinc-800">
              <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                {editingAlbum ? "Edit Album" : "Create Gallery Album"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 pt-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Album Name *
                </label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => {
                    setForm({
                      ...form,
                      name: e.target.value,
                      slug: !editingAlbum ? generateSlug(e.target.value) : form.slug,
                    });
                  }}
                  className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs text-zinc-900 dark:text-zinc-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  URL Slug *
                </label>
                <input
                  type="text"
                  required
                  value={form.slug}
                  onChange={(e) => setForm({ ...form, slug: generateSlug(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs text-zinc-900 dark:text-zinc-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs text-zinc-900 dark:text-zinc-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Cover Image
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={form.coverImage}
                    onChange={(e) => setForm({ ...form, coverImage: e.target.value })}
                    placeholder="Cover Image URL"
                    className="flex-1 px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => setIsMediaPickerOpen(true)}
                    className="px-3 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200"
                  >
                    Select
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    Display Order
                  </label>
                  <input
                    type="number"
                    value={form.displayOrder}
                    onChange={(e) => setForm({ ...form, displayOrder: parseInt(e.target.value, 10) || 0 })}
                    className="w-full px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    Status
                  </label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs"
                  >
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold"
                >
                  Save Album
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Media Picker */}
      <MediaPickerModal
        isOpen={isMediaPickerOpen}
        onClose={() => setIsMediaPickerOpen(false)}
        onSelect={(url) => setForm({ ...form, coverImage: url })}
        title="Select Album Cover Image"
      />
    </div>
  );
}
