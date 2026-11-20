"use client";

import React, { useState, useEffect } from "react";
import {
  MessageSquareQuote,
  Plus,
  Edit,
  Trash2,
  Star,
  Loader2,
  X,
} from "lucide-react";
import { toast } from "sonner";
import MediaPickerModal from "@/src/components/media/MediaPickerModal";

export default function TestimonialsManagementPage() {
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any | null>(null);

  const [form, setForm] = useState({
    customerName: "",
    designation: "",
    company: "",
    profileImage: "",
    content: "",
    rating: 5,
    displayOrder: 0,
    isPublished: true,
  });

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const fetchTestimonials = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/testimonials");
      const json = await res.json();
      if (json.success) setTestimonials(json.data);
    } catch {
      toast.error("Failed to load testimonials");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (item?: any) => {
    if (item) {
      setEditingItem(item);
      setForm({
        customerName: item.customerName,
        designation: item.designation || "",
        company: item.company || "",
        profileImage: item.profileImage || "",
        content: item.content,
        rating: item.rating || 5,
        displayOrder: item.displayOrder || 0,
        isPublished: item.isPublished ?? true,
      });
    } else {
      setEditingItem(null);
      setForm({
        customerName: "",
        designation: "",
        company: "",
        profileImage: "",
        content: "",
        rating: 5,
        displayOrder: testimonials.length + 1,
        isPublished: true,
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingItem ? `/api/admin/testimonials/${editingItem.id}` : "/api/admin/testimonials";
      const method = editingItem ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const json = await res.json();
      if (json.success) {
        toast.success(editingItem ? "Testimonial updated" : "Testimonial created");
        setIsModalOpen(false);
        fetchTestimonials();
      } else {
        toast.error(json.message || "Failed to save");
      }
    } catch {
      toast.error("Error saving testimonial");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this testimonial?")) return;
    try {
      const res = await fetch(`/api/admin/testimonials/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) {
        toast.success("Testimonial deleted");
        fetchTestimonials();
      } else {
        toast.error(json.message || "Failed to delete");
      }
    } catch {
      toast.error("Error deleting testimonial");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Client Testimonials
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
            Manage customer reviews, company logos, and ratings shown on the landing page.
          </p>
        </div>

        <button
          onClick={() => handleOpenModal()}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add Testimonial</span>
        </button>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="py-20 flex justify-center text-zinc-400">
          <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
        </div>
      ) : testimonials.length === 0 ? (
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-16 text-center text-zinc-400">
          <MessageSquareQuote className="w-12 h-12 mx-auto mb-3 stroke-1 text-zinc-300" />
          <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            No testimonials added
          </p>
          <p className="text-xs text-zinc-500 mt-1">
            Build credibility by showcasing customer stories and verified ratings.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((item) => (
            <div
              key={item.id}
              className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-1 text-amber-500">
                    {Array.from({ length: item.rating }).map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-current" />
                    ))}
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenModal(item)}
                      className="p-1 rounded text-zinc-400 hover:text-indigo-600 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="p-1 rounded text-zinc-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <p className="text-xs text-zinc-700 dark:text-zinc-300 italic mb-4">
                  &ldquo;{item.content}&rdquo;
                </p>
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                <div className="w-9 h-9 rounded-full overflow-hidden bg-zinc-100 dark:bg-zinc-800 shrink-0">
                  {item.profileImage ? (
                    <img src={item.profileImage} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center font-bold text-xs text-zinc-400">
                      {item.customerName.charAt(0)}
                    </div>
                  )}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                    {item.customerName}
                  </h4>
                  <p className="text-[11px] text-zinc-400">
                    {item.designation} {item.company && `at ${item.company}`}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-zinc-900 w-full max-w-md rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-2xl p-6">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-100 dark:border-zinc-800">
              <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                {editingItem ? "Edit Testimonial" : "Add Testimonial"}
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
                  Customer / Client Name *
                </label>
                <input
                  type="text"
                  required
                  value={form.customerName}
                  onChange={(e) => setForm({ ...form, customerName: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    Designation
                  </label>
                  <input
                    type="text"
                    value={form.designation}
                    onChange={(e) => setForm({ ...form, designation: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    Company
                  </label>
                  <input
                    type="text"
                    value={form.company}
                    onChange={(e) => setForm({ ...form, company: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Testimonial Quote *
                </label>
                <textarea
                  rows={3}
                  required
                  value={form.content}
                  onChange={(e) => setForm({ ...form, content: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Profile Photo URL
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={form.profileImage}
                    onChange={(e) => setForm({ ...form, profileImage: e.target.value })}
                    className="flex-1 px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => setIsMediaPickerOpen(true)}
                    className="px-3 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-xs font-semibold"
                  >
                    Pick
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    Rating (1 to 5 Stars)
                  </label>
                  <select
                    value={form.rating}
                    onChange={(e) => setForm({ ...form, rating: parseInt(e.target.value, 10) || 5 })}
                    className="w-full px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs"
                  >
                    <option value={5}>⭐⭐⭐⭐⭐ (5 Stars)</option>
                    <option value={4}>⭐⭐⭐⭐ (4 Stars)</option>
                    <option value={3}>⭐⭐⭐ (3 Stars)</option>
                    <option value={2}>⭐⭐ (2 Stars)</option>
                    <option value={1}>⭐ (1 Star)</option>
                  </select>
                </div>
                <div className="flex items-center gap-2 pt-5">
                  <input
                    type="checkbox"
                    id="isPublished"
                    checked={form.isPublished}
                    onChange={(e) => setForm({ ...form, isPublished: e.target.checked })}
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                  />
                  <label htmlFor="isPublished" className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                    Published
                  </label>
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
                  Save Testimonial
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
        onSelect={(url) => setForm({ ...form, profileImage: url })}
        title="Select Client Photo"
      />
    </div>
  );
}
