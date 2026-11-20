"use client";

import React, { useState, useEffect } from "react";
import {
  Menu as MenuIcon,
  Plus,
  Trash2,
  Save,
  Loader2,
  ExternalLink,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { toast } from "sonner";

export default function MenuManagementPage() {
  const [menus, setMenus] = useState<any[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<string>("header");
  const [currentMenu, setCurrentMenu] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchMenus();
  }, []);

  useEffect(() => {
    if (menus.length > 0) {
      const found = menus.find((m) => m.location === selectedLocation) || menus[0];
      setCurrentMenu(found);
    }
  }, [selectedLocation, menus]);

  const fetchMenus = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/menus");
      const json = await res.json();
      if (json.success) {
        setMenus(json.data);
      }
    } catch {
      toast.error("Failed to load menus");
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = () => {
    if (!currentMenu) return;
    const newItem = {
      label: "New Link",
      url: "/",
      target: "_self",
      displayOrder: (currentMenu.items?.length || 0) + 1,
      isActive: true,
      children: [],
    };

    setCurrentMenu({
      ...currentMenu,
      items: [...(currentMenu.items || []), newItem],
    });
  };

  const handleUpdateItem = (index: number, fields: any) => {
    if (!currentMenu) return;
    const items = [...currentMenu.items];
    items[index] = { ...items[index], ...fields };
    setCurrentMenu({ ...currentMenu, items });
  };

  const handleRemoveItem = (index: number) => {
    if (!currentMenu) return;
    const items = currentMenu.items.filter((_: any, i: number) => i !== index);
    setCurrentMenu({ ...currentMenu, items });
  };

  const handleMove = (index: number, direction: "up" | "down") => {
    if (!currentMenu) return;
    const items = [...currentMenu.items];
    if (direction === "up" && index === 0) return;
    if (direction === "down" && index === items.length - 1) return;

    const targetIdx = direction === "up" ? index - 1 : index + 1;
    const temp = items[index];
    items[index] = items[targetIdx];
    items[targetIdx] = temp;

    setCurrentMenu({ ...currentMenu, items });
  };

  const handleSave = async () => {
    if (!currentMenu) return;
    setSaving(true);
    try {
      const res = await fetch("/api/admin/menus", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: currentMenu.name,
          location: currentMenu.location,
          items: currentMenu.items,
        }),
      });
      const json = await res.json();
      if (json.success) {
        toast.success("Navigation menu saved successfully");
        fetchMenus();
      } else {
        toast.error(json.message || "Failed to save menu");
      }
    } catch {
      toast.error("Error saving menu");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Menu Navigation
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
            Configure header bars, footer quick links, and external references.
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={saving || !currentMenu}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-semibold shadow-sm transition-colors"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          <span>Save Menu Changes</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-zinc-200 dark:border-zinc-800 gap-6">
        <button
          onClick={() => setSelectedLocation("header")}
          className={`pb-3 text-xs font-semibold transition-colors border-b-2 -mb-px ${
            selectedLocation === "header"
              ? "border-indigo-600 text-indigo-600 dark:text-indigo-400"
              : "border-transparent text-zinc-500 hover:text-zinc-800"
          }`}
        >
          Header Navigation
        </button>
        <button
          onClick={() => setSelectedLocation("footer")}
          className={`pb-3 text-xs font-semibold transition-colors border-b-2 -mb-px ${
            selectedLocation === "footer"
              ? "border-indigo-600 text-indigo-600 dark:text-indigo-400"
              : "border-transparent text-zinc-500 hover:text-zinc-800"
          }`}
        >
          Footer Quick Links
        </button>
      </div>

      {/* Menu Builder Content */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-4">
          <div>
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
              {currentMenu?.name || "Navigation Items"}
            </h3>
            <p className="text-xs text-zinc-500">
              Reorder items, adjust URLs, or enable external links.
            </p>
          </div>
          <button
            onClick={handleAddItem}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 text-xs font-semibold transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Item</span>
          </button>
        </div>

        {loading ? (
          <div className="py-12 flex justify-center text-zinc-400">
            <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
          </div>
        ) : !currentMenu || currentMenu.items?.length === 0 ? (
          <div className="py-12 text-center text-zinc-400 text-xs">
            No items in this menu yet. Click &quot;Add Item&quot; to begin.
          </div>
        ) : (
          <div className="space-y-3">
            {currentMenu.items.map((item: any, idx: number) => (
              <div
                key={idx}
                className="p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/20 flex flex-wrap items-center gap-3"
              >
                <div className="flex items-center gap-1">
                  <button
                    disabled={idx === 0}
                    onClick={() => handleMove(idx, "up")}
                    className="p-1 text-zinc-400 hover:text-zinc-700 disabled:opacity-20"
                  >
                    <ChevronUp className="w-4 h-4" />
                  </button>
                  <button
                    disabled={idx === currentMenu.items.length - 1}
                    onClick={() => handleMove(idx, "down")}
                    className="p-1 text-zinc-400 hover:text-zinc-700 disabled:opacity-20"
                  >
                    <ChevronDown className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex-1 min-w-[150px]">
                  <input
                    type="text"
                    value={item.label}
                    onChange={(e) => handleUpdateItem(idx, { label: e.target.value })}
                    placeholder="Link Label"
                    className="w-full px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs font-semibold"
                  />
                </div>

                <div className="flex-1 min-w-[200px]">
                  <input
                    type="text"
                    value={item.url}
                    onChange={(e) => handleUpdateItem(idx, { url: e.target.value })}
                    placeholder="/path or https://"
                    className="w-full px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs font-mono"
                  />
                </div>

                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-1.5 text-xs text-zinc-600 dark:text-zinc-400 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={item.target === "_blank"}
                      onChange={(e) => handleUpdateItem(idx, { target: e.target.checked ? "_blank" : "_self" })}
                      className="rounded text-indigo-600 focus:ring-indigo-500"
                    />
                    <span>New Tab</span>
                  </label>

                  <label className="flex items-center gap-1.5 text-xs text-zinc-600 dark:text-zinc-400 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={item.isActive}
                      onChange={(e) => handleUpdateItem(idx, { isActive: e.target.checked })}
                      className="rounded text-indigo-600 focus:ring-indigo-500"
                    />
                    <span>Active</span>
                  </label>

                  <button
                    onClick={() => handleRemoveItem(idx)}
                    className="p-1.5 text-zinc-400 hover:text-rose-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
