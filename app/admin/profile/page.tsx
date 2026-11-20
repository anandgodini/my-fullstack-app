"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import {
  User,
  KeyRound,
  Save,
  Loader2,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";
import MediaPickerModal from "@/src/components/media/MediaPickerModal";

export default function MyProfilePage() {
  const searchParams = useSearchParams();
  const initialTab = searchParams.get("tab") || "profile";
  const [activeTab, setActiveTab] = useState(initialTab);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    avatar: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab) setActiveTab(tab);
  }, [searchParams]);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/profile");
      const json = await res.json();
      if (json.success && json.user) {
        setForm((prev) => ({
          ...prev,
          name: json.user.name || "",
          email: json.user.email || "",
          avatar: json.user.avatar || "",
        }));
      }
    } catch {
      toast.error("Failed to load admin profile");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (activeTab === "password") {
      if (!form.currentPassword) {
        toast.error("Please enter your current password");
        return;
      }
      if (form.newPassword.length < 6) {
        toast.error("New password must be at least 6 characters");
        return;
      }
      if (form.newPassword !== form.confirmPassword) {
        toast.error("New passwords do not match");
        return;
      }
    }

    setSaving(true);
    try {
      const payload: any = {
        name: form.name,
        email: form.email,
        avatar: form.avatar || null,
      };

      if (activeTab === "password" && form.newPassword) {
        payload.currentPassword = form.currentPassword;
        payload.newPassword = form.newPassword;
      }

      const res = await fetch("/api/admin/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (json.success) {
        toast.success(json.message || "Profile updated successfully");
        if (activeTab === "password") {
          setForm((prev) => ({
            ...prev,
            currentPassword: "",
            newPassword: "",
            confirmPassword: "",
          }));
        }
      } else {
        toast.error(json.message || "Failed to update profile");
      }
    } catch {
      toast.error("Error saving profile changes");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center text-zinc-400 gap-2">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
        <span className="text-xs">Loading profile...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          Admin Profile & Security
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
          Manage your system administrator credentials and access configuration.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-zinc-200 dark:border-zinc-800 gap-6">
        <button
          onClick={() => setActiveTab("profile")}
          className={`flex items-center gap-2 pb-3 text-xs font-semibold transition-colors border-b-2 -mb-px ${
            activeTab === "profile"
              ? "border-indigo-600 text-indigo-600 dark:text-indigo-400"
              : "border-transparent text-zinc-500 hover:text-zinc-800"
          }`}
        >
          <User className="w-4 h-4" />
          <span>My Profile</span>
        </button>

        <button
          onClick={() => setActiveTab("password")}
          className={`flex items-center gap-2 pb-3 text-xs font-semibold transition-colors border-b-2 -mb-px ${
            activeTab === "password"
              ? "border-indigo-600 text-indigo-600 dark:text-indigo-400"
              : "border-transparent text-zinc-500 hover:text-zinc-800"
          }`}
        >
          <KeyRound className="w-4 h-4" />
          <span>Change Password</span>
        </button>
      </div>

      {/* Form Card */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 sm:p-8 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-6">
          {activeTab === "profile" ? (
            <div className="space-y-5">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full overflow-hidden bg-indigo-100 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-xl ring-2 ring-indigo-500/20">
                  {form.avatar ? (
                    <img src={form.avatar} alt="" className="w-full h-full object-cover" />
                  ) : (
                    form.name?.charAt(0).toUpperCase() || "A"
                  )}
                </div>
                <div>
                  <button
                    type="button"
                    onClick={() => setIsMediaPickerOpen(true)}
                    className="px-3.5 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                  >
                    Change Photo
                  </button>
                  <p className="text-[11px] text-zinc-400 mt-1">
                    Select an avatar from your Media Library.
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs font-medium text-zinc-900 dark:text-zinc-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs font-medium text-zinc-900 dark:text-zinc-100"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                  Current Password *
                </label>
                <input
                  type="password"
                  required
                  value={form.currentPassword}
                  onChange={(e) => setForm({ ...form, currentPassword: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs text-zinc-900 dark:text-zinc-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                  New Password *
                </label>
                <input
                  type="password"
                  required
                  value={form.newPassword}
                  onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
                  placeholder="Minimum 6 characters"
                  className="w-full px-3.5 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs text-zinc-900 dark:text-zinc-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                  Confirm New Password *
                </label>
                <input
                  type="password"
                  required
                  value={form.confirmPassword}
                  onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs text-zinc-900 dark:text-zinc-100"
                />
              </div>
            </div>
          )}

          <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-semibold shadow-sm transition-colors"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>{activeTab === "profile" ? "Save Profile" : "Update Password"}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Media Picker */}
      <MediaPickerModal
        isOpen={isMediaPickerOpen}
        onClose={() => setIsMediaPickerOpen(false)}
        onSelect={(url) => setForm({ ...form, avatar: url })}
        title="Select Admin Avatar"
      />
    </div>
  );
}
