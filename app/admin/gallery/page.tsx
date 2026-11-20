"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Image as ImageIcon,
  Plus,
  Trash2,
  Edit,
  FolderOpen,
  Upload,
  Loader2,
  X,
  ExternalLink,
  Search,
} from "lucide-react";
import { toast } from "sonner";
import MediaPickerModal from "@/src/components/media/MediaPickerModal";

export default function GalleryManagementPage() {
  const [images, setImages] = useState<any[]>([]);
  const [albums, setAlbums] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedAlbum, setSelectedAlbum] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");

  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingImage, setEditingImage] = useState<any | null>(null);

  useEffect(() => {
    fetchAlbums();
  }, []);

  useEffect(() => {
    fetchImages();
  }, [search, selectedAlbum, selectedStatus]);

  const fetchAlbums = async () => {
    try {
      const res = await fetch("/api/admin/albums");
      const json = await res.json();
      if (json.success) setAlbums(json.data);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchImages = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams({
        search,
        albumId: selectedAlbum,
        status: selectedStatus,
      });
      const res = await fetch(`/api/admin/gallery?${query.toString()}`);
      const json = await res.json();
      if (json.success) setImages(json.data);
    } catch {
      toast.error("Failed to load gallery items");
    } finally {
      setLoading(false);
    }
  };

  const handleInsertFromMedia = async (url: string, media?: any) => {
    try {
      const res = await fetch("/api/admin/gallery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: media?.title || "Gallery Photo",
          imageUrl: url,
          altText: media?.altText || "",
          albumId: selectedAlbum || null,
          status: "published",
        }),
      });
      const json = await res.json();
      if (json.success) {
        toast.success("Image added to gallery");
        fetchImages();
      } else {
        toast.error(json.message || "Failed to add image");
      }
    } catch {
      toast.error("Error inserting image");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this gallery image?")) return;
    try {
      const res = await fetch(`/api/admin/gallery/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) {
        toast.success("Image deleted");
        fetchImages();
      } else {
        toast.error(json.message || "Failed to delete");
      }
    } catch {
      toast.error("Error deleting image");
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingImage) return;

    try {
      const res = await fetch(`/api/admin/gallery/${editingImage.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingImage),
      });
      const json = await res.json();
      if (json.success) {
        toast.success("Image details updated");
        setIsEditModalOpen(false);
        fetchImages();
      } else {
        toast.error(json.message || "Update failed");
      }
    } catch {
      toast.error("Error updating image");
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Photo Gallery
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
            Manage your high-resolution portfolio, albums, and display ordering.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/admin/albums"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <FolderOpen className="w-3.5 h-3.5" />
            <span>Manage Albums</span>
          </Link>
          <button
            onClick={() => setIsMediaPickerOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add from Media</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 absolute left-3 top-3 text-zinc-400" />
          <input
            type="text"
            placeholder="Search gallery by title or category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <select
          value={selectedAlbum}
          onChange={(e) => setSelectedAlbum(e.target.value)}
          className="px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs text-zinc-700 dark:text-zinc-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">All Albums</option>
          {albums.map((a) => (
            <option key={a.id} value={a.id}>
              {a.name}
            </option>
          ))}
        </select>

        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs text-zinc-700 dark:text-zinc-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">All Statuses</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
        </select>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center text-zinc-400 gap-2">
          <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
          <span className="text-xs">Loading images...</span>
        </div>
      ) : images.length === 0 ? (
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-16 text-center">
          <ImageIcon className="w-12 h-12 text-zinc-300 dark:text-zinc-700 mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            No images in gallery
          </h3>
          <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto">
            Upload images to your media library, then add them directly into your public gallery albums.
          </p>
          <button
            onClick={() => setIsMediaPickerOpen(true)}
            className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700"
          >
            <Plus className="w-4 h-4" />
            <span>Add Photo</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {images.map((img) => (
            <div
              key={img.id}
              className="group bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-sm flex flex-col"
            >
              <div className="relative aspect-square overflow-hidden bg-zinc-100 dark:bg-zinc-800">
                <img
                  src={img.imageUrl}
                  alt={img.altText || img.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => {
                      setEditingImage(img);
                      setIsEditModalOpen(true);
                    }}
                    className="p-1.5 rounded-lg bg-white/90 dark:bg-zinc-800/90 text-zinc-800 dark:text-zinc-100 shadow hover:bg-white transition-colors"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(img.id)}
                    className="p-1.5 rounded-lg bg-rose-600 text-white shadow hover:bg-rose-700 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="p-3 flex-1 flex flex-col justify-between">
                <div>
                  <h4 className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                    {img.title}
                  </h4>
                  <p className="text-[11px] text-zinc-400 truncate mt-0.5">
                    {img.album?.name || "Unassigned Album"}
                  </p>
                </div>
                <div className="mt-2 pt-2 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-[10px]">
                  <span
                    className={`font-semibold uppercase tracking-wider ${
                      img.status === "published" ? "text-emerald-600" : "text-zinc-400"
                    }`}
                  >
                    {img.status}
                  </span>
                  <span className="text-zinc-400">Order: {img.displayOrder}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Details Modal */}
      {isEditModalOpen && editingImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-zinc-900 w-full max-w-md rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-2xl p-6">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-100 dark:border-zinc-800">
              <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                Edit Image Details
              </h3>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdate} className="space-y-4 pt-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  required
                  value={editingImage.title}
                  onChange={(e) => setEditingImage({ ...editingImage, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Alt Text
                </label>
                <input
                  type="text"
                  value={editingImage.altText || ""}
                  onChange={(e) => setEditingImage({ ...editingImage, altText: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Album Assignment
                </label>
                <select
                  value={editingImage.albumId || ""}
                  onChange={(e) => setEditingImage({ ...editingImage, albumId: e.target.value || null })}
                  className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs"
                >
                  <option value="">-- No Album --</option>
                  {albums.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    Display Order
                  </label>
                  <input
                    type="number"
                    value={editingImage.displayOrder}
                    onChange={(e) => setEditingImage({ ...editingImage, displayOrder: parseInt(e.target.value, 10) || 0 })}
                    className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    Status
                  </label>
                  <select
                    value={editingImage.status}
                    onChange={(e) => setEditingImage({ ...editingImage, status: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs"
                  >
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold"
                >
                  Save Changes
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
        onSelect={handleInsertFromMedia}
        title="Add Image to Gallery"
      />
    </div>
  );
}
