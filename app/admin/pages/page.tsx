"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Layers,
  Plus,
  Edit,
  Trash2,
  ExternalLink,
  Search,
  Loader2,
  Copy,
} from "lucide-react";
import { toast } from "sonner";

export default function CMSPagesManagementPage() {
  const [pages, setPages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");

  useEffect(() => {
    fetchPages();
  }, [search, selectedStatus]);

  const fetchPages = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams({ search, status: selectedStatus });
      const res = await fetch(`/api/admin/pages?${query.toString()}`);
      const json = await res.json();
      if (json.success) setPages(json.data);
    } catch {
      toast.error("Failed to load CMS pages");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this page?")) return;
    try {
      const res = await fetch(`/api/admin/pages/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) {
        toast.success("Page deleted");
        fetchPages();
      } else {
        toast.error(json.message || "Failed to delete");
      }
    } catch {
      toast.error("Error deleting page");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            CMS Pages & Page Builder
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
            Construct landing pages, about stories, and service showcases with dynamic visual sections.
          </p>
        </div>
        <Link
          href="/admin/pages/new"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Page</span>
        </Link>
      </div>

      {/* Toolbar */}
      <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 absolute left-3 top-3 text-zinc-400" />
          <input
            type="text"
            placeholder="Search pages by title or slug..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

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

      {/* Table */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-20 flex justify-center text-zinc-400">
            <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
          </div>
        ) : pages.length === 0 ? (
          <div className="py-20 text-center text-zinc-400">
            <Layers className="w-12 h-12 mx-auto mb-3 stroke-1 text-zinc-300" />
            <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              No custom pages yet.
            </p>
            <p className="text-xs text-zinc-500 mt-1">
              Create your first page to start assembling sections with the visual builder.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50 text-zinc-500 font-medium">
                  <th className="py-3 px-4">Page Title</th>
                  <th className="py-3 px-4">Slug Route</th>
                  <th className="py-3 px-4">Sections</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Last Updated</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {pages.map((p) => {
                  const sectionCount = Array.isArray(p.sections) ? p.sections.length : 0;
                  return (
                    <tr key={p.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30">
                      <td className="py-3.5 px-4">
                        <Link
                          href={`/admin/pages/${p.id}`}
                          className="font-semibold text-zinc-900 dark:text-zinc-100 hover:text-indigo-600"
                        >
                          {p.title}
                        </Link>
                        {p.shortDescription && (
                          <p className="text-[11px] text-zinc-400 truncate max-w-sm mt-0.5">
                            {p.shortDescription}
                          </p>
                        )}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-zinc-500">
                        /{p.slug}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="inline-block px-2.5 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-medium text-[11px]">
                          {sectionCount} section(s)
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-wider ${
                            p.status === "published"
                              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400"
                              : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
                          }`}
                        >
                          {p.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-zinc-500 text-[11px]">
                        {new Date(p.updatedAt).toLocaleDateString()}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {p.status === "published" && (
                            <Link
                              href={`/${p.slug}`}
                              target="_blank"
                              title="View Public Page"
                              className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </Link>
                          )}
                          <Link
                            href={`/admin/pages/${p.id}`}
                            title="Edit & Design Page"
                            className="p-1.5 rounded-lg text-zinc-400 hover:text-indigo-600"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </Link>
                          <button
                            onClick={() => handleDelete(p.id)}
                            title="Delete Page"
                            className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-600 hover:bg-rose-50"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
