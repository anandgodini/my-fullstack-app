"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  FolderTree,
  Image as ImageIcon,
  Album,
  Users,
  Briefcase,
  Layers,
  Menu as MenuIcon,
  HardDrive,
  Mail,
  MessageSquareQuote,
  HelpCircle,
  Settings,
  Sliders,
  PanelTop,
  PanelBottom,
  Globe,
  Share2,
  User,
  KeyRound,
  LogOut,
  ChevronDown,
  Search,
  Bell,
  ExternalLink,
  X,
} from "lucide-react";
import { toast } from "sonner";

interface AdminSidebarProps {
  adminUser: {
    name?: string | null;
    email: string;
    avatar?: string | null;
  };
  children: React.ReactNode;
}

export default function AdminLayoutShell({ adminUser, children }: AdminSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const handleLogout = async () => {
    try {
      const res = await fetch("/api/auth/logout", { method: "POST" });
      if (res.ok) {
        toast.success("Logged out successfully");
        router.push("/login");
        router.refresh();
      }
    } catch {
      toast.error("Failed to log out");
    }
  };

  const navGroups = [
    {
      title: "Overview",
      items: [
        { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
      ],
    },
    {
      title: "Content Management",
      items: [
        { label: "Blogs", href: "/admin/blogs", icon: FileText },
        { label: "Blog Categories", href: "/admin/categories", icon: FolderTree },
        { label: "Gallery", href: "/admin/gallery", icon: ImageIcon },
        { label: "Gallery Albums", href: "/admin/albums", icon: Album },
        { label: "Team Members", href: "/admin/team", icon: Users },
        { label: "Team Departments", href: "/admin/departments", icon: Briefcase },
        { label: "CMS Pages", href: "/admin/pages", icon: Layers },
      ],
    },
    {
      title: "Website Management",
      items: [
        { label: "Menu Management", href: "/admin/menus", icon: MenuIcon },
        { label: "Media Library", href: "/admin/media", icon: HardDrive },
        { label: "Contact Enquiries", href: "/admin/enquiries", icon: Mail },
        { label: "Testimonials", href: "/admin/testimonials", icon: MessageSquareQuote },
        { label: "FAQs", href: "/admin/faqs", icon: HelpCircle },
      ],
    },
    {
      title: "Settings",
      items: [
        { label: "General Settings", href: "/admin/settings?tab=general", icon: Settings },
        { label: "Header Settings", href: "/admin/settings?tab=header", icon: PanelTop },
        { label: "Footer Settings", href: "/admin/settings?tab=footer", icon: PanelBottom },
        { label: "SEO Settings", href: "/admin/settings?tab=seo", icon: Globe },
        { label: "Social Media", href: "/admin/settings?tab=social", icon: Share2 },
      ],
    },
    {
      title: "Account",
      items: [
        { label: "My Profile", href: "/admin/profile", icon: User },
        { label: "Change Password", href: "/admin/profile?tab=password", icon: KeyRound },
      ],
    },
  ];

  const currentBreadcrumb = () => {
    for (const group of navGroups) {
      for (const item of group.items) {
        if (pathname === item.href || (item.href !== "/admin/dashboard" && pathname.startsWith(item.href.split("?")[0]))) {
          return item.label;
        }
      }
    }
    return "Dashboard";
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col antialiased">
      {/* Mobile Sidebar Backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-zinc-900/60 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 px-6 flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm">
          <Link href="/admin/dashboard" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-600/30">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-zinc-900 dark:text-zinc-50 text-base tracking-tight block">
                CMS Studio
              </span>
              <span className="text-[10px] uppercase font-semibold tracking-wider text-indigo-600 dark:text-indigo-400 block -mt-1">
                Admin Panel
              </span>
            </div>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1.5 rounded-lg text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Navigation */}
        <div className="flex-1 overflow-y-auto px-4 py-5 space-y-6">
          {navGroups.map((group, idx) => (
            <div key={idx}>
              <h3 className="px-3 text-[11px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-2">
                {group.title}
              </h3>
              <div className="space-y-1">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive =
                    pathname === item.href ||
                    (item.href !== "/admin/dashboard" &&
                      !item.href.includes("?") &&
                      pathname.startsWith(item.href));

                  return (
                    <Link
                      key={item.label}
                      href={item.href}
                      onClick={() => setSidebarOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        isActive
                          ? "bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400"
                          : "text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:text-zinc-100 dark:hover:bg-zinc-800/60"
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${isActive ? "text-indigo-600 dark:text-indigo-400" : "text-zinc-400"}`} />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom User Bar */}
        <div className="p-4 border-t border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-3 px-2 py-2 rounded-lg bg-zinc-50 dark:bg-zinc-800/40">
            <div className="w-9 h-9 rounded-full bg-indigo-100 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-semibold text-sm">
              {adminUser.name ? adminUser.name.charAt(0).toUpperCase() : "A"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                {adminUser.name || "Administrator"}
              </p>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate">
                {adminUser.email}
              </p>
            </div>
            <button
              onClick={handleLogout}
              title="Logout"
              className="text-zinc-400 hover:text-rose-600 transition-colors p-1"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="lg:pl-72 flex flex-col flex-1">
        {/* Top Navigation */}
        <header className="sticky top-0 z-30 h-16 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 px-4 sm:px-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              <MenuIcon className="w-5 h-5" />
            </button>
            <div className="hidden sm:flex items-center gap-2 text-sm text-zinc-500">
              <span>Admin</span>
              <span>/</span>
              <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                {currentBreadcrumb()}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Live site link */}
            <Link
              href="/"
              target="_blank"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>View Live Website</span>
            </Link>

            {/* User Dropdown */}
            <div className="relative">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-sm">
                  {adminUser.name ? adminUser.name.charAt(0).toUpperCase() : "A"}
                </div>
                <ChevronDown className="w-4 h-4 text-zinc-500 hidden sm:block" />
              </button>

              {userDropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setUserDropdownOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-52 bg-white dark:bg-zinc-900 rounded-xl shadow-xl border border-zinc-200 dark:border-zinc-800 py-1.5 z-50">
                    <div className="px-4 py-2 border-b border-zinc-100 dark:border-zinc-800">
                      <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                        {adminUser.name || "Administrator"}
                      </p>
                      <p className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate">
                        {adminUser.email}
                      </p>
                    </div>
                    <Link
                      href="/admin/profile"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-xs text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                    >
                      <User className="w-4 h-4 text-zinc-400" />
                      <span>My Profile</span>
                    </Link>
                    <Link
                      href="/admin/profile?tab=password"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-xs text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                    >
                      <KeyRound className="w-4 h-4 text-zinc-400" />
                      <span>Change Password</span>
                    </Link>
                    <div className="border-t border-zinc-100 dark:border-zinc-800 my-1" />
                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        handleLogout();
                      }}
                      className="w-full flex items-center gap-2 px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-left"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Log Out</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Dynamic Page Body */}
        <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
