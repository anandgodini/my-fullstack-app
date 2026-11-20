"use client";

import React, { useState, useEffect } from "react";
import {
  FolderTree,
  Plus,
  Edit,
  Trash2,
  Tag,
  Loader2,
  Check,
  X,
} from "lucide-react";
import { toast } from "sonner";

export default function CategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [tags, setTags] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Category Modal State
  const [isCatModalOpen, setIsCatModalOpen] = useState(false);
  const [editingCat, setEditingCat] = useState<any | null>(null);
  const [catForm, setCatForm] = useState({
    name: "",
    slug: "",
    description: "",
    seoTitle: "",
    seoDescription: "",
    status: "active",
  });

  // Tag Form State
  const [tagName, setTagName] = useState("");
  const [tagSlug, setTagSlug] = useState("");
  const [savingTag, setSavingTag] = useState(false);

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [catRes, tagRes] = await Promise.all([
        fetch("/api/admin/categories"),
        fetch("/api/admin/tags"),
      ]);
      const [catJson, tagJson] = await Promise.all([catRes.json(), tagRes.json()]);
      if (catJson.success) setCategories(catJson.data);
      if (tagJson.success) setTags(tagJson.data);
    } catch {
      toast.error("Failed to load taxonomy");
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

  const handleOpenCategoryModal = (cat?: any) => {
    if (cat) {
      setEditingCat(cat);
      setCatForm({
        name: cat.name,
        slug: cat.slug,
        description: cat.description || "",
        seoTitle: cat.seoTitle || "",
        seoDescription: cat.seoDescription || "",
        status: cat.status || "active",
      });
    } else {
      setEditingCat(null);
      setCatForm({
        name: "",
        slug: "",
        description: "",
        seoTitle: "",
        seoDescription: "",
        status: "active",
      });
    }
    setIsCatModalOpen(true);
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingCat ? `/api/admin/categories/${editingCat.id}` : "/api/admin/categories";
      const method = editingCat ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(catForm),
      });

      const json = await res.json();
      if (json.success) {
        toast.success(editingCat ? "Category updated" : "Category created");
        setIsCatModalOpen(false);
        loadAll();
      } else {
        toast.error(json.message || "Failed to save category");
      }
    } catch {
      toast.error("Error saving category");
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm("Are you sure you want to delete this category?")) return;
    try {
      const res = await fetch(`/api/admin/categories/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) {
        toast.success("Category deleted");
        loadAll();
      } else {
        toast.error(json.message || "Failed to delete");
      }
    } catch {
      toast.error("Error deleting category");
    }
  };

  const handleCreateTag = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tagName.trim()) return;
    setSavingTag(true);
    try {
      const res = await fetch("/api/admin/tags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: tagName,
          slug: tagSlug.trim() ? tagSlug : generateSlug(tagName),
        }),
      });
      const json = await res.json();
      if (json.success) {
        toast.success("Tag created");
        setTagName("");
        setTagSlug("");
        loadAll();
      } else {
        toast.error(json.message || "Failed to create tag");
      }
    } catch {
      toast.error("Error creating tag");
    } finally {
      setSavingTag(false);
    }
  };

  const handleDeleteTag = async (id: string) => {
    if (!confirm("Are you sure you want to delete this tag?")) return;
    try {
      const res = await fetch(`/api/admin/tags/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) {
        toast.success("Tag deleted");
        loadAll();
      } else {
        toast.error(json.message || "Failed to delete");
      }
    } catch {
      toast.error("Error deleting tag");
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Categories & Tags
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
            Organize blog content, filter by topics, and optimize search taxonomy.
          </p>
        </div>
        <button
          onClick={() => handleOpenCategoryModal()}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>New Category</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Categories List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/40 font-semibold text-xs text-zinc-700 dark:text-zinc-300 flex items-center justify-between">
              <span>Categories ({categories.length})</span>
            </div>

            {loading ? (
              <div className="py-12 flex justify-center text-zinc-400">
                <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
              </div>
            ) : categories.length === 0 ? (
              <div className="py-12 text-center text-zinc-400 text-xs">
                No categories created yet.
              </div>
            ) : (
              <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {categories.map((cat) => (
                  <div
                    key={cat.id}
                    className="p-4 flex items-center justify-between hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30 transition-colors"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-zinc-900 dark:text-zinc-100">
                          {cat.name}
                        </span>
                        <span className="text-[11px] font-mono text-zinc-400">
                          /{cat.slug}
                        </span>
                      </div>
                      {cat.description && (
                        <p className="text-xs text-zinc-500 mt-1 max-w-md line-clamp-1">
                          {cat.description}
                        </p>
                      )}
                      <div className="text-[11px] text-zinc-400 mt-1 flex items-center gap-3">
                        <span>{cat._count?.blogs || 0} post(s)</span>
                        <span>•</span>
                        <span
                          className={`uppercase font-bold ${
                            cat.status === "active" ? "text-emerald-600" : "text-zinc-400"
                          }`}
                        >
                          {cat.status}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleOpenCategoryModal(cat)}
                        className="p-1.5 rounded-lg text-zinc-400 hover:text-indigo-600 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteCategory(cat.id)}
                        className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Tags Management */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 border-b border-zinc-100 dark:border-zinc-800 pb-2">
              Add New Tag
            </h3>
            <form onSubmit={handleCreateTag} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Tag Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. NextJS"
                  value={tagName}
                  onChange={(e) => {
                    setTagName(e.target.value);
                    if (!tagSlug) setTagSlug(generateSlug(e.target.value));
                  }}
                  className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Tag Slug
                </label>
                <input
                  type="text"
                  placeholder="e.g. nextjs"
                  value={tagSlug}
                  onChange={(e) => setTagSlug(generateSlug(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <button
                type="submit"
                disabled={savingTag || !tagName.trim()}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-white text-white dark:text-zinc-900 text-xs font-semibold transition-colors disabled:opacity-50"
              >
                {savingTag ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                <span>Add Tag</span>
              </button>
            </form>
          </div>

          {/* Tags Cloud / Badges */}
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-3">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 border-b border-zinc-100 dark:border-zinc-800 pb-2">
              Existing Tags ({tags.length})
            </h3>
            {tags.length === 0 ? (
              <p className="text-xs text-zinc-400">No tags added yet.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {tags.map((t) => (
                  <span
                    key={t.id}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-xs text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700"
                  >
                    <span>#{t.name}</span>
                    <button
                      onClick={() => handleDeleteTag(t.id)}
                      className="text-zinc-400 hover:text-rose-500"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Category Modal */}
      {isCatModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-zinc-900 w-full max-w-lg rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-2xl p-6">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-100 dark:border-zinc-800">
              <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                {editingCat ? "Edit Category" : "Create Blog Category"}
              </h3>
              <button
                onClick={() => setIsCatModalOpen(false)}
                className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCategory} className="space-y-4 pt-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Category Name *
                </label>
                <input
                  type="text"
                  required
                  value={catForm.name}
                  onChange={(e) => {
                    setCatForm({
                      ...catForm,
                      name: e.target.value,
                      slug: !editingCat ? generateSlug(e.target.value) : catForm.slug,
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
                  value={catForm.slug}
                  onChange={(e) => setCatForm({ ...catForm, slug: generateSlug(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs text-zinc-900 dark:text-zinc-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={catForm.description}
                  onChange={(e) => setCatForm({ ...catForm, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs text-zinc-900 dark:text-zinc-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    SEO Title
                  </label>
                  <input
                    type="text"
                    value={catForm.seoTitle}
                    onChange={(e) => setCatForm({ ...catForm, seoTitle: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    Status
                  </label>
                  <select
                    value={catForm.status}
                    onChange={(e) => setCatForm({ ...catForm, status: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCatModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold"
                >
                  Save Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
