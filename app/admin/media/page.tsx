"use client";

import React, { useState, useEffect } from "react";
import {
  HardDrive,
  Upload,
  Search,
  Trash2,
  Copy,
  Check,
  File,
  Image as ImageIcon,
  Loader2,
  X,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";
import { uploadFiles } from "@/src/lib/mediaUpload";

export default function MediaLibraryPage() {
  const [mediaList, setMediaList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [selectedMedia, setSelectedMedia] = useState<any | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    fetchMedia();
  }, [search, filterType]);

  const fetchMedia = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams({ search, type: filterType, limit: "50" });
      const res = await fetch(`/api/admin/media?${query.toString()}`);
      const json = await res.json();
      if (json.success) setMediaList(json.data);
    } catch {
      toast.error("Failed to load media");
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      const result = await uploadFiles(files);
      if (result.success) {
        toast.success(result.message || "Files uploaded successfully");
        fetchMedia();
      } else {
        toast.error(result.message || "Upload failed");
      }
    } catch (err: any) {
      toast.error(err.message || "Error uploading files");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to permanently delete this media file?")) return;
    try {
      const res = await fetch(`/api/admin/media/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) {
        toast.success("File deleted");
        if (selectedMedia?.id === id) setSelectedMedia(null);
        fetchMedia();
      } else {
        toast.error(json.message || "Failed to delete");
      }
    } catch {
      toast.error("Error deleting file");
    }
  };

  const handleUpdateDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMedia) return;
    try {
      const res = await fetch(`/api/admin/media/${selectedMedia.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: selectedMedia.title,
          altText: selectedMedia.altText,
        }),
      });
      const json = await res.json();
      if (json.success) {
        toast.success("File details updated");
        fetchMedia();
      }
    } catch {
      toast.error("Failed to update details");
    }
  };

  const copyUrl = (url: string, id: string) => {
    const finalUrl = url.startsWith("data:")
      ? `${window.location.origin}/api/media/${id}`
      : url.startsWith("http")
      ? url
      : `${window.location.origin}${url}`;
    navigator.clipboard.writeText(finalUrl);
    setCopiedId(id);
    toast.success("URL copied to clipboard");
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Media Library
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
            Store, preview, and reuse images and documents across all website modules.
          </p>
        </div>

        <label className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm cursor-pointer transition-colors">
          {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
          <span>Upload Files</span>
          <input
            type="file"
            multiple
            accept="image/*,application/pdf"
            className="hidden"
            onChange={handleUpload}
            disabled={uploading}
          />
        </label>
      </div>

      {/* Toolbar */}
      <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 absolute left-3 top-3 text-zinc-400" />
          <input
            type="text"
            placeholder="Search media files..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs text-zinc-700 dark:text-zinc-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="all">All Media</option>
          <option value="images">Images Only</option>
          <option value="documents">Documents (PDF)</option>
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Media Grid */}
        <div className="lg:col-span-3">
          {loading ? (
            <div className="py-20 flex justify-center text-zinc-400">
              <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
            </div>
          ) : mediaList.length === 0 ? (
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-16 text-center text-zinc-400">
              <HardDrive className="w-12 h-12 mx-auto mb-3 stroke-1 text-zinc-300" />
              <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                No media files found
              </p>
              <p className="text-xs text-zinc-500 mt-1">
                Upload your brand assets, photography, or PDF brochures.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-4">
              {mediaList.map((item) => {
                const isSelected = selectedMedia?.id === item.id;
                const isImage = item.mimeType.startsWith("image/");
                return (
                  <div
                    key={item.id}
                    onClick={() => setSelectedMedia(item)}
                    className={`group relative aspect-square rounded-2xl overflow-hidden cursor-pointer border-2 transition-all ${
                      isSelected
                        ? "border-indigo-600 ring-2 ring-indigo-500/20"
                        : "border-zinc-200 dark:border-zinc-800 hover:border-indigo-400"
                    }`}
                  >
                    {isImage ? (
                      <img
                        src={item.fileUrl}
                        alt={item.altText || item.fileName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-zinc-100 dark:bg-zinc-800 flex flex-col items-center justify-center p-3 text-zinc-500">
                        <File className="w-8 h-8 stroke-1 mb-1" />
                        <span className="text-[11px] font-mono truncate max-w-full text-center">
                          {item.fileName}
                        </span>
                      </div>
                    )}

                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2.5">
                      <span className="text-[11px] text-white font-medium truncate block w-full">
                        {item.title || item.fileName}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Selected Media Details Panel */}
        <div className="space-y-4">
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4 sticky top-24">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 border-b border-zinc-100 dark:border-zinc-800 pb-2">
              File Details
            </h3>

            {selectedMedia ? (
              <form onSubmit={handleUpdateDetails} className="space-y-4">
                <div className="aspect-video rounded-xl overflow-hidden bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700">
                  {selectedMedia.mimeType.startsWith("image/") ? (
                    <img
                      src={selectedMedia.fileUrl}
                      alt=""
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-zinc-400">
                      <File className="w-10 h-10 stroke-1" />
                    </div>
                  )}
                </div>

                <div className="space-y-1 text-xs text-zinc-500">
                  <p className="truncate font-semibold text-zinc-900 dark:text-zinc-100">
                    {selectedMedia.fileName}
                  </p>
                  <p>Type: {selectedMedia.mimeType}</p>
                  <p>Size: {Math.round(selectedMedia.fileSize / 1024)} KB</p>
                  <p>Uploaded: {new Date(selectedMedia.createdAt).toLocaleDateString()}</p>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    Title / Caption
                  </label>
                  <input
                    type="text"
                    value={selectedMedia.title || ""}
                    onChange={(e) => setSelectedMedia({ ...selectedMedia, title: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    Alt Text
                  </label>
                  <input
                    type="text"
                    value={selectedMedia.altText || ""}
                    onChange={(e) => setSelectedMedia({ ...selectedMedia, altText: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs"
                  />
                </div>

                <div className="pt-2 flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={() => copyUrl(selectedMedia.fileUrl, selectedMedia.id)}
                    className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 text-xs font-semibold hover:bg-zinc-100 transition-colors"
                  >
                    {copiedId === selectedMedia.id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>Copy File URL</span>
                  </button>

                  <button
                    type="submit"
                    className="w-full px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold"
                  >
                    Save Details
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDelete(selectedMedia.id)}
                    className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 text-xs font-semibold"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete File</span>
                  </button>
                </div>
              </form>
            ) : (
              <p className="text-xs text-zinc-400 py-6 text-center">
                Click on any file to preview attributes and metadata.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
