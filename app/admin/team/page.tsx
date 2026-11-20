"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Users,
  Plus,
  Edit,
  Trash2,
  Briefcase,
  Search,
  Loader2,
  Mail,
  Phone,
  X,
} from "lucide-react";
import { toast } from "sonner";
import MediaPickerModal from "@/src/components/media/MediaPickerModal";

export default function TeamManagementPage() {
  const [members, setMembers] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedDept, setSelectedDept] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<any | null>(null);

  const [form, setForm] = useState({
    fullName: "",
    designation: "",
    departmentId: "",
    profilePhoto: "",
    bio: "",
    email: "",
    phone: "",
    linkedinUrl: "",
    facebookUrl: "",
    instagramUrl: "",
    displayOrder: 0,
    isActive: true,
  });

  useEffect(() => {
    fetchDepartments();
  }, []);

  useEffect(() => {
    fetchMembers();
  }, [search, selectedDept]);

  const fetchDepartments = async () => {
    try {
      const res = await fetch("/api/admin/departments");
      const json = await res.json();
      if (json.success) setDepartments(json.data);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchMembers = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams({ search, departmentId: selectedDept });
      const res = await fetch(`/api/admin/team?${query.toString()}`);
      const json = await res.json();
      if (json.success) setMembers(json.data);
    } catch {
      toast.error("Failed to load team members");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (member?: any) => {
    if (member) {
      setEditingMember(member);
      setForm({
        fullName: member.fullName,
        designation: member.designation,
        departmentId: member.departmentId || "",
        profilePhoto: member.profilePhoto || "",
        bio: member.bio || "",
        email: member.email || "",
        phone: member.phone || "",
        linkedinUrl: member.linkedinUrl || "",
        facebookUrl: member.facebookUrl || "",
        instagramUrl: member.instagramUrl || "",
        displayOrder: member.displayOrder || 0,
        isActive: member.isActive ?? true,
      });
    } else {
      setEditingMember(null);
      setForm({
        fullName: "",
        designation: "",
        departmentId: "",
        profilePhoto: "",
        bio: "",
        email: "",
        phone: "",
        linkedinUrl: "",
        facebookUrl: "",
        instagramUrl: "",
        displayOrder: members.length + 1,
        isActive: true,
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingMember ? `/api/admin/team/${editingMember.id}` : "/api/admin/team";
      const method = editingMember ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const json = await res.json();
      if (json.success) {
        toast.success(editingMember ? "Team member updated" : "Team member added");
        setIsModalOpen(false);
        fetchMembers();
      } else {
        toast.error(json.message || "Failed to save member");
      }
    } catch {
      toast.error("Error saving team member");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this team member?")) return;
    try {
      const res = await fetch(`/api/admin/team/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) {
        toast.success("Team member deleted");
        fetchMembers();
      } else {
        toast.error(json.message || "Failed to delete");
      }
    } catch {
      toast.error("Error deleting member");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Team Members
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
            Manage executive profiles, staff rosters, and department assignments.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/admin/departments"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <Briefcase className="w-3.5 h-3.5" />
            <span>Departments</span>
          </Link>
          <button
            onClick={() => handleOpenModal()}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Member</span>
          </button>
        </div>
      </div>

      {/* Filter toolbar */}
      <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 absolute left-3 top-3 text-zinc-400" />
          <input
            type="text"
            placeholder="Search by name or designation..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <select
          value={selectedDept}
          onChange={(e) => setSelectedDept(e.target.value)}
          className="px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs text-zinc-700 dark:text-zinc-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">All Departments</option>
          {departments.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name}
            </option>
          ))}
        </select>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="py-20 flex justify-center text-zinc-400">
          <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
        </div>
      ) : members.length === 0 ? (
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-16 text-center">
          <Users className="w-12 h-12 text-zinc-300 dark:text-zinc-700 mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            No team members added
          </h3>
          <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto">
            Introduce your leadership and team to public website visitors.
          </p>
          <button
            onClick={() => handleOpenModal()}
            className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700"
          >
            <Plus className="w-4 h-4" />
            <span>Add Member</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {members.map((member) => (
            <div
              key={member.id}
              className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-sm flex flex-col justify-between"
            >
              <div className="p-6 text-center flex flex-col items-center">
                <div className="relative w-24 h-24 rounded-full overflow-hidden mb-4 bg-zinc-100 dark:bg-zinc-800 ring-2 ring-zinc-200 dark:ring-zinc-700">
                  {member.profilePhoto ? (
                    <img
                      src={member.profilePhoto}
                      alt={member.fullName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center font-bold text-xl text-zinc-400">
                      {member.fullName.charAt(0)}
                    </div>
                  )}
                </div>

                <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                  {member.fullName}
                </h3>
                <p className="text-xs text-indigo-600 dark:text-indigo-400 font-medium mt-0.5">
                  {member.designation}
                </p>
                {member.department && (
                  <span className="mt-2 inline-block px-2.5 py-0.5 rounded-full text-[10px] bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 font-medium">
                    {member.department.name}
                  </span>
                )}
                {member.bio && (
                  <p className="text-xs text-zinc-500 mt-3 line-clamp-2 text-center">
                    {member.bio}
                  </p>
                )}
              </div>

              <div className="px-6 py-3 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/20 flex items-center justify-between text-xs">
                <span
                  className={`text-[10px] font-bold uppercase tracking-wider ${
                    member.isActive ? "text-emerald-600" : "text-zinc-400"
                  }`}
                >
                  {member.isActive ? "Active" : "Inactive"}
                </span>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenModal(member)}
                    className="p-1 rounded-lg text-zinc-400 hover:text-indigo-600 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(member.id)}
                    className="p-1 rounded-lg text-zinc-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Member Form Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-zinc-900 w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-2xl p-6">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-100 dark:border-zinc-800">
              <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                {editingMember ? "Edit Team Member" : "Add Team Member"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={form.fullName}
                    onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    Designation *
                  </label>
                  <input
                    type="text"
                    required
                    value={form.designation}
                    onChange={(e) => setForm({ ...form, designation: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    Department
                  </label>
                  <select
                    value={form.departmentId}
                    onChange={(e) => setForm({ ...form, departmentId: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs"
                  >
                    <option value="">-- No Department --</option>
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    Profile Photo
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={form.profilePhoto}
                      onChange={(e) => setForm({ ...form, profilePhoto: e.target.value })}
                      placeholder="Photo URL"
                      className="flex-1 px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs"
                    />
                    <button
                      type="button"
                      onClick={() => setIsMediaPickerOpen(true)}
                      className="px-3 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-xs font-semibold hover:bg-zinc-200"
                    >
                      Pick
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Biography
                </label>
                <textarea
                  rows={2}
                  value={form.bio}
                  onChange={(e) => setForm({ ...form, bio: e.target.value })}
                  placeholder="Short professional biography..."
                  className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    Phone
                  </label>
                  <input
                    type="text"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    LinkedIn URL
                  </label>
                  <input
                    type="url"
                    value={form.linkedinUrl}
                    onChange={(e) => setForm({ ...form, linkedinUrl: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    Facebook URL
                  </label>
                  <input
                    type="url"
                    value={form.facebookUrl}
                    onChange={(e) => setForm({ ...form, facebookUrl: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    Instagram URL
                  </label>
                  <input
                    type="url"
                    value={form.instagramUrl}
                    onChange={(e) => setForm({ ...form, instagramUrl: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
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
                <div className="flex items-center gap-2 pt-5">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={form.isActive}
                    onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                  />
                  <label htmlFor="isActive" className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                    Active / Publicly Visible
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
                  Save Member
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
        onSelect={(url) => setForm({ ...form, profilePhoto: url })}
        title="Select Member Profile Photo"
      />
    </div>
  );
}
