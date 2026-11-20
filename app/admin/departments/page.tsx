"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Briefcase,
  Plus,
  Edit,
  Trash2,
  ArrowLeft,
  Loader2,
  X,
} from "lucide-react";
import { toast } from "sonner";

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDept, setEditingDept] = useState<any | null>(null);

  const [form, setForm] = useState({
    name: "",
    slug: "",
    displayOrder: 0,
    status: "active",
  });

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/departments");
      const json = await res.json();
      if (json.success) setDepartments(json.data);
    } catch {
      toast.error("Failed to load departments");
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

  const handleOpenModal = (dept?: any) => {
    if (dept) {
      setEditingDept(dept);
      setForm({
        name: dept.name,
        slug: dept.slug,
        displayOrder: dept.displayOrder || 0,
        status: dept.status || "active",
      });
    } else {
      setEditingDept(null);
      setForm({
        name: "",
        slug: "",
        displayOrder: departments.length + 1,
        status: "active",
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingDept ? `/api/admin/departments/${editingDept.id}` : "/api/admin/departments";
      const method = editingDept ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const json = await res.json();
      if (json.success) {
        toast.success(editingDept ? "Department updated" : "Department created");
        setIsModalOpen(false);
        fetchDepartments();
      } else {
        toast.error(json.message || "Failed to save");
      }
    } catch {
      toast.error("Error saving department");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this department?")) return;
    try {
      const res = await fetch(`/api/admin/departments/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) {
        toast.success("Department deleted");
        fetchDepartments();
      } else {
        toast.error(json.message || "Failed to delete");
      }
    } catch {
      toast.error("Error deleting department");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/team"
            className="p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
              Team Departments
            </h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
              Categorize staff into teams, divisions, and functional units.
            </p>
          </div>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>New Department</span>
        </button>
      </div>

      {/* List */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-16 flex justify-center text-zinc-400">
            <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
          </div>
        ) : departments.length === 0 ? (
          <div className="py-16 text-center text-zinc-400 text-xs">
            No departments found.
          </div>
        ) : (
          <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {departments.map((d) => (
              <div
                key={d.id}
                className="p-4 flex items-center justify-between hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30 transition-colors"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-zinc-900 dark:text-zinc-100">
                      {d.name}
                    </span>
                    <span className="text-[11px] font-mono text-zinc-400">
                      /{d.slug}
                    </span>
                  </div>
                  <div className="text-[11px] text-zinc-400 mt-1 flex items-center gap-3">
                    <span>{d._count?.members || 0} member(s)</span>
                    <span>•</span>
                    <span>Order: {d.displayOrder}</span>
                    <span>•</span>
                    <span
                      className={`uppercase font-bold ${
                        d.status === "active" ? "text-emerald-600" : "text-zinc-400"
                      }`}
                    >
                      {d.status}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleOpenModal(d)}
                    className="p-1.5 rounded-lg text-zinc-400 hover:text-indigo-600 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(d.id)}
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

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-zinc-900 w-full max-w-md rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-2xl p-6">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-100 dark:border-zinc-800">
              <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                {editingDept ? "Edit Department" : "New Department"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-zinc-400 hover:text-zinc-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 pt-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Department Name *
                </label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => {
                    setForm({
                      ...form,
                      name: e.target.value,
                      slug: !editingDept ? generateSlug(e.target.value) : form.slug,
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
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
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
                  Save Department
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
