"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Save,
  Image as ImageIcon,
  Sparkles,
  Eye,
  Loader2,
  Calendar,
  Tag as TagIcon,
  Globe,
} from "lucide-react";
import { toast } from "sonner";
import MediaPickerModal from "@/src/components/media/MediaPickerModal";

interface BlogEditorProps {
  initialData?: any;
  isEdit?: boolean;
}

export default function BlogEditorForm({ initialData, isEdit }: BlogEditorProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [availableTags, setAvailableTags] = useState<any[]>([]);
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);
  const [activeImageField, setActiveImageField] = useState<"featuredImage" | "ogImage">("featuredImage");

  const [formData, setFormData] = useState({
    title: initialData?.title || "",
    slug: initialData?.slug || "",
    shortDescription: initialData?.shortDescription || "",
    content: initialData?.content || "",
    featuredImage: initialData?.featuredImage || "",
    imageAltText: initialData?.imageAltText || "",
    categoryId: initialData?.categoryId || "",
    authorName: initialData?.authorName || "Admin",
    seoTitle: initialData?.seoTitle || "",
    seoDescription: initialData?.seoDescription || "",
    canonicalUrl: initialData?.canonicalUrl || "",
    ogImage: initialData?.ogImage || "",
    status: initialData?.status || "draft",
    isFeatured: initialData?.isFeatured ?? false,
    publishedAt: initialData?.publishedAt
      ? new Date(initialData.publishedAt).toISOString().slice(0, 16)
      : "",
    tags: initialData?.tags?.map((t: any) => t.tagId || t.id) || [],
  });

  useEffect(() => {
    fetchMeta();
  }, []);

  const fetchMeta = async () => {
    try {
      const [catRes, tagRes] = await Promise.all([
        fetch("/api/admin/categories"),
        fetch("/api/admin/tags"),
      ]);
      const [catJson, tagJson] = await Promise.all([catRes.json(), tagRes.json()]);
      if (catJson.success) setCategories(catJson.data);
      if (tagJson.success) setAvailableTags(tagJson.data);
    } catch (e) {
      console.error(e);
    }
  };

  const generateSlug = (val: string) => {
    return val
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");
  };

  const handleTitleChange = (val: string) => {
    setFormData((prev) => ({
      ...prev,
      title: val,
      slug: !isEdit && (!prev.slug || prev.slug === generateSlug(prev.title)) ? generateSlug(val) : prev.slug,
      seoTitle: !prev.seoTitle ? val : prev.seoTitle,
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      toast.error("Title is required");
      return;
    }
    if (!formData.slug.trim()) {
      toast.error("Slug is required");
      return;
    }
    if (!formData.content.trim()) {
      toast.error("Full content is required");
      return;
    }

    setLoading(true);
    try {
      const url = isEdit ? `/api/admin/blogs/${initialData.id}` : "/api/admin/blogs";
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const json = await res.json();
      if (json.success) {
        toast.success(isEdit ? "Blog updated successfully" : "Blog created successfully");
        router.push("/admin/blogs");
        router.refresh();
      } else {
        toast.error(json.message || "Failed to save blog post");
      }
    } catch {
      toast.error("Network error while saving");
    } finally {
      setLoading(false);
    }
  };

  const handleImageSelect = (url: string) => {
    if (activeImageField === "featuredImage") {
      setFormData((prev) => ({ ...prev, featuredImage: url, ogImage: prev.ogImage || url }));
    } else {
      setFormData((prev) => ({ ...prev, ogImage: url }));
    }
  };

  return (
    <form onSubmit={handleSave} className="space-y-8">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/blogs"
            className="p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
              {isEdit ? "Edit Blog Post" : "Create New Blog Post"}
            </h1>
            <p className="text-xs text-zinc-500 mt-0.5">
              Configure content, featured media, categories, and SEO.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {formData.status === "published" && formData.slug && (
            <Link
              href={`/blogs/${formData.slug}`}
              target="_blank"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              <Eye className="w-4 h-4" />
              <span>Preview Live</span>
            </Link>
          )}
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-semibold shadow-sm transition-colors"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>{isEdit ? "Update Post" : "Save & Publish"}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-6">
          {/* Title & Slug */}
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                Post Title *
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="e.g. 10 Design Principles for Modern Web Applications"
                className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm font-medium text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                URL Slug *
              </label>
              <div className="flex items-center rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 px-3 py-1.5 text-xs text-zinc-500 font-mono">
                <span>/blogs/</span>
                <input
                  type="text"
                  required
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: generateSlug(e.target.value) })}
                  className="w-full bg-transparent border-0 px-1 py-1 text-zinc-900 dark:text-zinc-100 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                Short Description / Excerpt
              </label>
              <textarea
                rows={2}
                value={formData.shortDescription}
                onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                placeholder="Brief summary shown on blog cards and search results..."
                className="w-full px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Full Content (Markdown / HTML) */}
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Full Article Content (HTML / Rich Format) *
              </label>
              <span className="text-[11px] text-zinc-400">Supports HTML formatting</span>
            </div>
            <textarea
              rows={15}
              required
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              placeholder="Write your article content here in rich HTML or markdown format..."
              className="w-full font-mono text-xs p-4 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* SEO Metadata Card */}
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4">
            <div className="flex items-center gap-2 border-b border-zinc-100 dark:border-zinc-800 pb-3">
              <Globe className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                Search Engine Optimization (SEO)
              </h3>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Meta Title
                </label>
                <input
                  type="text"
                  value={formData.seoTitle}
                  onChange={(e) => setFormData({ ...formData, seoTitle: e.target.value })}
                  placeholder="Defaults to article title"
                  className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Meta Description
                </label>
                <textarea
                  rows={2}
                  value={formData.seoDescription}
                  onChange={(e) => setFormData({ ...formData, seoDescription: e.target.value })}
                  placeholder="Defaults to excerpt"
                  className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Canonical URL
                </label>
                <input
                  type="url"
                  value={formData.canonicalUrl}
                  onChange={(e) => setFormData({ ...formData, canonicalUrl: e.target.value })}
                  placeholder="https://example.com/blogs/original-post"
                  className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Controls */}
        <div className="space-y-6">
          {/* Status & Publication */}
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 border-b border-zinc-100 dark:border-zinc-800 pb-2">
              Publication Settings
            </h3>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="draft">Draft (Private)</option>
                <option value="published">Published (Live)</option>
                <option value="scheduled">Scheduled</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                Publish Date & Time
              </label>
              <input
                type="datetime-local"
                value={formData.publishedAt}
                onChange={(e) => setFormData({ ...formData, publishedAt: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                Author Name
              </label>
              <input
                type="text"
                value={formData.authorName}
                onChange={(e) => setFormData({ ...formData, authorName: e.target.value })}
                placeholder="Author Name"
                className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="pt-2 flex items-center justify-between">
              <div>
                <label className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 block">
                  Featured Blog
                </label>
                <span className="text-[11px] text-zinc-400">Highlight in hero sections</span>
              </div>
              <input
                type="checkbox"
                checked={formData.isFeatured}
                onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Category & Tags */}
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 border-b border-zinc-100 dark:border-zinc-800 pb-2">
              Taxonomy
            </h3>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                Category
              </label>
              <select
                value={formData.categoryId}
                onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">-- No Category --</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {availableTags.length > 0 && (
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                  Tags
                </label>
                <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-1.5 border border-zinc-200 dark:border-zinc-700 rounded-xl">
                  {availableTags.map((tag) => {
                    const isChecked = formData.tags.includes(tag.id);
                    return (
                      <button
                        key={tag.id}
                        type="button"
                        onClick={() => {
                          setFormData((prev) => ({
                            ...prev,
                            tags: isChecked
                              ? prev.tags.filter((id: string) => id !== tag.id)
                              : [...prev.tags, tag.id],
                          }));
                        }}
                        className={`text-[11px] px-2.5 py-1 rounded-lg border transition-colors ${
                          isChecked
                            ? "bg-indigo-600 border-indigo-600 text-white"
                            : "border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                        }`}
                      >
                        #{tag.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Featured Image */}
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 border-b border-zinc-100 dark:border-zinc-800 pb-2">
              Featured Media
            </h3>

            {formData.featuredImage ? (
              <div className="space-y-3">
                <div className="relative aspect-video rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-700 group">
                  <img
                    src={formData.featuredImage}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setActiveImageField("featuredImage");
                        setIsMediaPickerOpen(true);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-white/90 text-zinc-900 text-xs font-semibold shadow-md"
                    >
                      Change
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, featuredImage: "" })}
                      className="px-3 py-1.5 rounded-lg bg-rose-600 text-white text-xs font-semibold shadow-md"
                    >
                      Remove
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                    Alt Text
                  </label>
                  <input
                    type="text"
                    value={formData.imageAltText}
                    onChange={(e) => setFormData({ ...formData, imageAltText: e.target.value })}
                    placeholder="Describe image for accessibility"
                    className="w-full px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 text-xs bg-white dark:bg-zinc-800"
                  />
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setActiveImageField("featuredImage");
                  setIsMediaPickerOpen(true);
                }}
                className="w-full h-36 rounded-xl border-2 border-dashed border-zinc-200 dark:border-zinc-700 hover:border-indigo-500 dark:hover:border-indigo-400 flex flex-col items-center justify-center gap-2 text-zinc-400 hover:text-indigo-600 transition-colors"
              >
                <ImageIcon className="w-6 h-6 stroke-1" />
                <span className="text-xs font-medium">Select Image from Media Library</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Media Picker Modal */}
      <MediaPickerModal
        isOpen={isMediaPickerOpen}
        onClose={() => setIsMediaPickerOpen(false)}
        onSelect={handleImageSelect}
      />
    </form>
  );
}
