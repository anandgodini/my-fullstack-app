"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import {
  Settings,
  PanelTop,
  PanelBottom,
  Globe,
  Share2,
  Save,
  Loader2,
  Image as ImageIcon,
} from "lucide-react";
import { toast } from "sonner";
import MediaPickerModal from "@/src/components/media/MediaPickerModal";

export default function WebsiteSettingsPage() {
  const searchParams = useSearchParams();
  const initialTab = searchParams.get("tab") || "general";
  const [activeTab, setActiveTab] = useState(initialTab);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);
  const [activePickerField, setActivePickerField] = useState<string>("");

  const [settings, setSettings] = useState<Record<string, Record<string, string>>>({
    general: {},
    header: {},
    footer: {},
    seo: {},
    social: {},
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab) setActiveTab(tab);
  }, [searchParams]);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/settings");
      const json = await res.json();
      if (json.success) {
        setSettings(json.data);
      }
    } catch {
      toast.error("Failed to load site settings");
    } finally {
      setLoading(false);
    }
  };

  const handleFieldChange = (group: string, key: string, value: string) => {
    setSettings((prev) => ({
      ...prev,
      [group]: {
        ...(prev[group] || {}),
        [key]: value,
      },
    }));
  };

  const handleSave = async (group: string) => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          group,
          settings: settings[group] || {},
        }),
      });
      const json = await res.json();
      if (json.success) {
        toast.success(`${group.toUpperCase()} settings saved`);
      } else {
        toast.error(json.message || "Failed to save");
      }
    } catch {
      toast.error("Error saving settings");
    } finally {
      setSaving(false);
    }
  };

  const openPicker = (fieldKey: string) => {
    setActivePickerField(fieldKey);
    setIsMediaPickerOpen(true);
  };

  const tabs = [
    { id: "general", label: "General Settings", icon: Settings },
    { id: "header", label: "Header Settings", icon: PanelTop },
    { id: "footer", label: "Footer Settings", icon: PanelBottom },
    { id: "seo", label: "Global SEO", icon: Globe },
    { id: "social", label: "Social Media", icon: Share2 },
  ];

  if (loading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center text-zinc-400 gap-2">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
        <span className="text-xs">Loading settings...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          Website Settings
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
          Configure branding, header CTA buttons, global metadata, and company information.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-zinc-200 dark:border-zinc-800 gap-6 overflow-x-auto pb-px">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 pb-3 text-xs font-semibold whitespace-nowrap transition-colors border-b-2 -mb-px ${
                isActive
                  ? "border-indigo-600 text-indigo-600 dark:text-indigo-400"
                  : "border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Active Tab Panel */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 sm:p-8 shadow-sm space-y-6">
        {/* GENERAL SETTINGS */}
        {activeTab === "general" && (
          <div className="space-y-4 max-w-2xl">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 border-b border-zinc-100 dark:border-zinc-800 pb-2">
              Branding & Information
            </h3>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Website Name
              </label>
              <input
                type="text"
                value={settings.general?.site_name || ""}
                onChange={(e) => handleFieldChange("general", "site_name", e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Website Tagline / Description
              </label>
              <textarea
                rows={2}
                value={settings.general?.site_description || ""}
                onChange={(e) => handleFieldChange("general", "site_description", e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Contact Email
                </label>
                <input
                  type="email"
                  value={settings.general?.contact_email || ""}
                  onChange={(e) => handleFieldChange("general", "contact_email", e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Contact Phone
                </label>
                <input
                  type="text"
                  value={settings.general?.contact_phone || ""}
                  onChange={(e) => handleFieldChange("general", "contact_phone", e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Physical Address
              </label>
              <input
                type="text"
                value={settings.general?.contact_address || ""}
                onChange={(e) => handleFieldChange("general", "contact_address", e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Website Logo
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={settings.general?.site_logo || ""}
                  onChange={(e) => handleFieldChange("general", "site_logo", e.target.value)}
                  placeholder="Logo URL"
                  className="flex-1 px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs"
                />
                <button
                  type="button"
                  onClick={() => openPicker("site_logo")}
                  className="px-3 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-xs font-semibold"
                >
                  Pick Media
                </button>
              </div>
            </div>

            <div className="pt-4">
              <button
                onClick={() => handleSave("general")}
                disabled={saving}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition-colors"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                <span>Save General Settings</span>
              </button>
            </div>
          </div>
        )}

        {/* HEADER SETTINGS */}
        {activeTab === "header" && (
          <div className="space-y-4 max-w-2xl">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 border-b border-zinc-100 dark:border-zinc-800 pb-2">
              Header & Top Bar Options
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  CTA Button Label
                </label>
                <input
                  type="text"
                  value={settings.header?.cta_text || ""}
                  onChange={(e) => handleFieldChange("header", "cta_text", e.target.value)}
                  placeholder="e.g. Contact Us"
                  className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  CTA Button URL
                </label>
                <input
                  type="text"
                  value={settings.header?.cta_url || ""}
                  onChange={(e) => handleFieldChange("header", "cta_url", e.target.value)}
                  placeholder="/contact"
                  className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs font-mono"
                />
              </div>
            </div>

            <div className="pt-2">
              <label className="flex items-center gap-2 text-xs font-semibold text-zinc-700 dark:text-zinc-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.header?.sticky_header === "true"}
                  onChange={(e) => handleFieldChange("header", "sticky_header", e.target.checked ? "true" : "false")}
                  className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                />
                <span>Enable Sticky Header on Scroll</span>
              </label>
            </div>

            <div className="pt-4">
              <button
                onClick={() => handleSave("header")}
                disabled={saving}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition-colors"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                <span>Save Header Settings</span>
              </button>
            </div>
          </div>
        )}

        {/* FOOTER SETTINGS */}
        {activeTab === "footer" && (
          <div className="space-y-4 max-w-2xl">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 border-b border-zinc-100 dark:border-zinc-800 pb-2">
              Footer Configuration
            </h3>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Footer Brand Summary
              </label>
              <textarea
                rows={2}
                value={settings.footer?.footer_description || ""}
                onChange={(e) => handleFieldChange("footer", "footer_description", e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Copyright Notice
              </label>
              <input
                type="text"
                value={settings.footer?.copyright_text || ""}
                onChange={(e) => handleFieldChange("footer", "copyright_text", e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs"
              />
            </div>

            <div className="pt-4">
              <button
                onClick={() => handleSave("footer")}
                disabled={saving}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition-colors"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                <span>Save Footer Settings</span>
              </button>
            </div>
          </div>
        )}

        {/* SEO SETTINGS */}
        {activeTab === "seo" && (
          <div className="space-y-4 max-w-2xl">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 border-b border-zinc-100 dark:border-zinc-800 pb-2">
              Default SEO Metadata
            </h3>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Default Meta Title
              </label>
              <input
                type="text"
                value={settings.seo?.meta_title || ""}
                onChange={(e) => handleFieldChange("seo", "meta_title", e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Default Meta Description
              </label>
              <textarea
                rows={3}
                value={settings.seo?.meta_description || ""}
                onChange={(e) => handleFieldChange("seo", "meta_description", e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Google Site Verification Code
              </label>
              <input
                type="text"
                value={settings.seo?.google_verification || ""}
                onChange={(e) => handleFieldChange("seo", "google_verification", e.target.value)}
                placeholder="google-site-verification token"
                className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs font-mono"
              />
            </div>

            <div className="pt-4">
              <button
                onClick={() => handleSave("seo")}
                disabled={saving}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition-colors"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                <span>Save SEO Settings</span>
              </button>
            </div>
          </div>
        )}

        {/* SOCIAL MEDIA SETTINGS */}
        {activeTab === "social" && (
          <div className="space-y-4 max-w-2xl">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 border-b border-zinc-100 dark:border-zinc-800 pb-2">
              Social Media Channels
            </h3>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Facebook URL
              </label>
              <input
                type="url"
                value={settings.social?.facebook || ""}
                onChange={(e) => handleFieldChange("social", "facebook", e.target.value)}
                placeholder="https://facebook.com/..."
                className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Instagram URL
              </label>
              <input
                type="url"
                value={settings.social?.instagram || ""}
                onChange={(e) => handleFieldChange("social", "instagram", e.target.value)}
                placeholder="https://instagram.com/..."
                className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                LinkedIn URL
              </label>
              <input
                type="url"
                value={settings.social?.linkedin || ""}
                onChange={(e) => handleFieldChange("social", "linkedin", e.target.value)}
                placeholder="https://linkedin.com/company/..."
                className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                X / Twitter URL
              </label>
              <input
                type="url"
                value={settings.social?.x_twitter || ""}
                onChange={(e) => handleFieldChange("social", "x_twitter", e.target.value)}
                placeholder="https://x.com/..."
                className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs"
              />
            </div>

            <div className="pt-4">
              <button
                onClick={() => handleSave("social")}
                disabled={saving}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition-colors"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                <span>Save Social Links</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Media Picker */}
      <MediaPickerModal
        isOpen={isMediaPickerOpen}
        onClose={() => setIsMediaPickerOpen(false)}
        onSelect={(url) => {
          if (activePickerField === "site_logo") {
            handleFieldChange("general", "site_logo", url);
          }
        }}
        title="Select Image Asset"
      />
    </div>
  );
}
