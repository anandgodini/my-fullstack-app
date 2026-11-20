"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Save,
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
  Copy,
  Layers,
  Image as ImageIcon,
  Sparkles,
  Eye,
  Loader2,
  Globe,
  Settings,
} from "lucide-react";
import { toast } from "sonner";
import MediaPickerModal from "@/src/components/media/MediaPickerModal";

const AVAILABLE_SECTIONS = [
  { type: "hero", label: "Hero Banner", description: "Full-width headline, subtitle, background image, and CTA buttons" },
  { type: "about", label: "About Section", description: "Narrative story with side photo and key achievement stats" },
  { type: "text", label: "Text Section", description: "Standard editorial content area" },
  { type: "image", label: "Image Showcase", description: "Large featured image or banner" },
  { type: "text_image", label: "Text + Image", description: "Two-column side-by-side content and illustration" },
  { type: "services", label: "Services Grid", description: "Cards listing key offerings, icons, and summaries" },
  { type: "features", label: "Features List", description: "Highlighted capabilities with checkmarks and descriptions" },
  { type: "testimonials", label: "Testimonials Carousel", description: "Dynamic client quotes and satisfaction ratings" },
  { type: "team", label: "Team Showcase", description: "Leadership roster pulled dynamically or configured" },
  { type: "gallery", label: "Photo Gallery", description: "Visual grid of portfolio images" },
  { type: "stats", label: "Statistics Bar", description: "Key numbers, counters, and metrics" },
  { type: "faq", label: "FAQ Accordion", description: "Frequently asked questions and answers" },
  { type: "contact", label: "Contact Form Section", description: "Interactive enquiry submission block" },
  { type: "cta", label: "Call-to-Action", description: "High-conversion banner with prompt button" },
];

export default function PageBuilderForm({ initialData, isEdit }: { initialData?: any; isEdit?: boolean }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);
  const [pickerCallback, setPickerCallback] = useState<((url: string) => void) | null>(null);

  const [formData, setFormData] = useState({
    title: initialData?.title || "",
    slug: initialData?.slug || "",
    shortDescription: initialData?.shortDescription || "",
    featuredImage: initialData?.featuredImage || "",
    sections: Array.isArray(initialData?.sections) ? initialData.sections : [],
    seoTitle: initialData?.seoTitle || "",
    seoDescription: initialData?.seoDescription || "",
    canonicalUrl: initialData?.canonicalUrl || "",
    ogImage: initialData?.ogImage || "",
    status: initialData?.status || "draft",
  });

  const generateSlug = (val: string) => {
    return val
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");
  };

  const handleAddSection = (type: string) => {
    const newSection: any = {
      id: `section-${Date.now()}`,
      type,
      title: `${type.toUpperCase()} Heading`,
      subtitle: "Add descriptive text or subtitle here...",
      content: "",
      buttonText: "Learn More",
      buttonUrl: "#",
      imageUrl: "",
    };

    if (type === "hero") {
      newSection.title = "Transforming Digital Experiences";
      newSection.subtitle = "Empower your team with next-generation tools built for scale.";
      newSection.buttonText = "Get Started";
      newSection.buttonUrl = "/contact";
    } else if (type === "stats") {
      newSection.stats = [
        { label: "Active Users", value: "10,000+" },
        { label: "Global Locations", value: "24" },
        { label: "Uptime", value: "99.9%" },
      ];
    } else if (type === "services") {
      newSection.items = [
        { title: "Strategic Consulting", description: "Guiding product direction and digital transformation." },
        { title: "Custom Development", description: "High-performance fullstack systems engineered for agility." },
        { title: "Cloud Optimization", description: "Robust infrastructure with real-time scalability." },
      ];
    }

    setFormData((prev) => ({
      ...prev,
      sections: [...prev.sections, newSection],
    }));
    toast.success(`Added ${type} section`);
  };

  const handleUpdateSection = (index: number, updatedFields: any) => {
    setFormData((prev) => {
      const updated = [...prev.sections];
      updated[index] = { ...updated[index], ...updatedFields };
      return { ...prev, sections: updated };
    });
  };

  const handleRemoveSection = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      sections: prev.sections.filter((_: any, i: number) => i !== index),
    }));
  };

  const handleDuplicateSection = (index: number) => {
    setFormData((prev) => {
      const target = prev.sections[index];
      const clone = { ...target, id: `section-${Date.now()}` };
      const updated = [...prev.sections];
      updated.splice(index + 1, 0, clone);
      return { ...prev, sections: updated };
    });
  };

  const handleMoveSection = (index: number, direction: "up" | "down") => {
    if (direction === "up" && index === 0) return;
    if (direction === "down" && index === formData.sections.length - 1) return;

    setFormData((prev) => {
      const updated = [...prev.sections];
      const targetIndex = direction === "up" ? index - 1 : index + 1;
      const temp = updated[index];
      updated[index] = updated[targetIndex];
      updated[targetIndex] = temp;
      return { ...prev, sections: updated };
    });
  };

  const openPickerFor = (cb: (url: string) => void) => {
    setPickerCallback(() => cb);
    setIsMediaPickerOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      toast.error("Page title is required");
      return;
    }
    if (!formData.slug.trim()) {
      toast.error("Slug is required");
      return;
    }

    setLoading(true);
    try {
      const url = isEdit ? `/api/admin/pages/${initialData.id}` : "/api/admin/pages";
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const json = await res.json();
      if (json.success) {
        toast.success(isEdit ? "Page updated" : "Page created");
        router.push("/admin/pages");
        router.refresh();
      } else {
        toast.error(json.message || "Failed to save page");
      }
    } catch {
      toast.error("Error saving page");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSave} className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/pages"
            className="p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
              {isEdit ? `Design: ${formData.title}` : "Create CMS Page"}
            </h1>
            <p className="text-xs text-zinc-500 mt-0.5">
              Add and arrange responsive sections with live database content.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {formData.status === "published" && formData.slug && (
            <Link
              href={`/${formData.slug}`}
              target="_blank"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100"
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
            <span>{isEdit ? "Update Page" : "Save Page"}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Main Section Builder Canvas (3 cols) */}
        <div className="lg:col-span-3 space-y-6">
          {/* Page Details Card */}
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Page Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => {
                    setFormData({
                      ...formData,
                      title: e.target.value,
                      slug: !isEdit ? generateSlug(e.target.value) : formData.slug,
                      seoTitle: !formData.seoTitle ? e.target.value : formData.seoTitle,
                    });
                  }}
                  className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs font-medium text-zinc-900 dark:text-zinc-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  URL Slug *
                </label>
                <div className="flex items-center rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 px-3 py-1.5 text-xs text-zinc-500 font-mono">
                  <span>/</span>
                  <input
                    type="text"
                    required
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: generateSlug(e.target.value) })}
                    className="w-full bg-transparent border-0 px-1 py-1 text-zinc-900 dark:text-zinc-100 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Short Description
              </label>
              <textarea
                rows={2}
                value={formData.shortDescription}
                onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                placeholder="Optional description of this page..."
                className="w-full px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs text-zinc-900 dark:text-zinc-100"
              />
            </div>
          </div>

          {/* Builder Section Canvas */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <Layers className="w-5 h-5 text-indigo-600" />
                <span>Page Sections ({formData.sections.length})</span>
              </h2>
              <span className="text-xs text-zinc-400">Reorder, edit, or duplicate sections</span>
            </div>

            {formData.sections.length === 0 ? (
              <div className="bg-white dark:bg-zinc-900 rounded-2xl border-2 border-dashed border-zinc-200 dark:border-zinc-800 p-12 text-center">
                <Layers className="w-10 h-10 text-zinc-300 dark:text-zinc-700 mx-auto mb-2 stroke-1" />
                <h4 className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  No sections on this page yet
                </h4>
                <p className="text-[11px] text-zinc-400 mt-1 max-w-xs mx-auto">
                  Click any section type in the sidebar to add it to your canvas.
                </p>
              </div>
            ) : (
              formData.sections.map((sec: any, index: number) => (
                <div
                  key={sec.id || index}
                  className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden"
                >
                  {/* Section Bar */}
                  <div className="p-3 px-4 bg-zinc-50 dark:bg-zinc-800/40 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-md bg-indigo-100 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-[10px]">
                        {index + 1}
                      </span>
                      <span className="text-xs font-bold uppercase tracking-wider text-zinc-800 dark:text-zinc-200">
                        {sec.type.replace("_", " ")} Section
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        disabled={index === 0}
                        onClick={() => handleMoveSection(index, "up")}
                        className="p-1 rounded text-zinc-400 hover:text-zinc-700 disabled:opacity-30"
                      >
                        <ChevronUp className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        disabled={index === formData.sections.length - 1}
                        onClick={() => handleMoveSection(index, "down")}
                        className="p-1 rounded text-zinc-400 hover:text-zinc-700 disabled:opacity-30"
                      >
                        <ChevronDown className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDuplicateSection(index)}
                        className="p-1 rounded text-zinc-400 hover:text-indigo-600"
                        title="Duplicate"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemoveSection(index)}
                        className="p-1 rounded text-zinc-400 hover:text-rose-600"
                        title="Remove"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Section Fields */}
                  <div className="p-5 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                          Heading / Title
                        </label>
                        <input
                          type="text"
                          value={sec.title || ""}
                          onChange={(e) => handleUpdateSection(index, { title: e.target.value })}
                          className="w-full px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                          Subtitle
                        </label>
                        <input
                          type="text"
                          value={sec.subtitle || ""}
                          onChange={(e) => handleUpdateSection(index, { subtitle: e.target.value })}
                          className="w-full px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs"
                        />
                      </div>
                    </div>

                    {(sec.type === "about" || sec.type === "text" || sec.type === "text_image") && (
                      <div>
                        <label className="block text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                          Content Narrative
                        </label>
                        <textarea
                          rows={3}
                          value={sec.content || ""}
                          onChange={(e) => handleUpdateSection(index, { content: e.target.value })}
                          className="w-full px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs"
                        />
                      </div>
                    )}

                    {(sec.type === "hero" || sec.type === "cta" || sec.type === "about" || sec.type === "image" || sec.type === "text_image") && (
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="sm:col-span-2">
                          <label className="block text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                            Image / Background URL
                          </label>
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={sec.imageUrl || sec.bgImage || sec.image || ""}
                              onChange={(e) => handleUpdateSection(index, { imageUrl: e.target.value, bgImage: e.target.value, image: e.target.value })}
                              placeholder="Image URL"
                              className="flex-1 px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs"
                            />
                            <button
                              type="button"
                              onClick={() => openPickerFor((url) => handleUpdateSection(index, { imageUrl: url, bgImage: url, image: url }))}
                              className="px-2.5 py-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-xs font-semibold"
                            >
                              Pick
                            </button>
                          </div>
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                            CTA Button Text & Link
                          </label>
                          <div className="flex gap-1.5">
                            <input
                              type="text"
                              value={sec.buttonText || sec.ctaText || ""}
                              onChange={(e) => handleUpdateSection(index, { buttonText: e.target.value, ctaText: e.target.value })}
                              placeholder="Text"
                              className="w-1/2 px-2 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs"
                            />
                            <input
                              type="text"
                              value={sec.buttonUrl || sec.ctaUrl || ""}
                              onChange={(e) => handleUpdateSection(index, { buttonUrl: e.target.value, ctaUrl: e.target.value })}
                              placeholder="URL"
                              className="w-1/2 px-2 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Sidebar Palette & Settings (1 col) */}
        <div className="space-y-6">
          {/* Status */}
          <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500 border-b border-zinc-100 dark:border-zinc-800 pb-2">
              Page Status
            </h3>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs font-semibold"
            >
              <option value="draft">Draft (Unpublished)</option>
              <option value="published">Published (Live)</option>
            </select>
          </div>

          {/* Section Library Palette */}
          <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500 border-b border-zinc-100 dark:border-zinc-800 pb-2">
              Add New Section
            </h3>
            <p className="text-[11px] text-zinc-400">
              Select any block below to append it to your dynamic page.
            </p>
            <div className="space-y-2 max-h-[480px] overflow-y-auto pr-1">
              {AVAILABLE_SECTIONS.map((sec) => (
                <button
                  key={sec.type}
                  type="button"
                  onClick={() => handleAddSection(sec.type)}
                  className="w-full text-left p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:border-indigo-500 dark:hover:border-indigo-400 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/20 transition-all group flex items-start gap-2.5"
                >
                  <Plus className="w-4 h-4 text-zinc-400 group-hover:text-indigo-600 mt-0.5 shrink-0" />
                  <div>
                    <h5 className="text-xs font-bold text-zinc-800 dark:text-zinc-200 group-hover:text-indigo-600">
                      {sec.label}
                    </h5>
                    <p className="text-[10px] text-zinc-400 line-clamp-1">
                      {sec.description}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Media Picker Modal */}
      <MediaPickerModal
        isOpen={isMediaPickerOpen}
        onClose={() => setIsMediaPickerOpen(false)}
        onSelect={(url) => {
          if (pickerCallback) pickerCallback(url);
        }}
      />
    </form>
  );
}
