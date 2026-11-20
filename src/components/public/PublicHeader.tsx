import React from "react";
import Link from "next/link";
import { getHeaderNavigation, getSiteSettings } from "@/src/lib/public-data";
import { Sliders, ArrowRight, ShieldCheck } from "lucide-react";

export default async function PublicHeader() {
  const [navItems, settings] = await Promise.all([
    getHeaderNavigation(),
    getSiteSettings(),
  ]);

  const siteName = settings.site_name || "Antigravity CMS";
  const siteLogo = settings.site_logo;
  const ctaText = settings.cta_text || "Get in Touch";
  const ctaUrl = settings.cta_url || "/contact";
  const isSticky = settings.sticky_header !== "false";

  return (
    <header
      className={`w-full z-40 bg-white/90 dark:bg-zinc-950/90 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 transition-all ${
        isSticky ? "sticky top-0" : "relative"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-3">
          {siteLogo ? (
            <img src={siteLogo} alt={siteName} className="h-8 w-auto object-contain" />
          ) : (
            <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold shadow-md shadow-indigo-600/30">
              <Sliders className="w-4 h-4" />
            </div>
          )}
          <span className="font-bold text-base tracking-tight text-zinc-900 dark:text-zinc-50">
            {siteName}
          </span>
        </Link>

        {/* Dynamic Navigation Links */}
        <nav className="hidden md:flex items-center gap-6">
          {navItems.map((item: any) => (
            <Link
              key={item.id}
              href={item.url}
              target={item.target || "_self"}
              className="text-xs font-semibold text-zinc-600 dark:text-zinc-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* CTA & Admin Shortcuts */}
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="text-xs font-medium text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors hidden sm:block"
          >
            Admin Sign In
          </Link>
          <Link
            href={ctaUrl}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition-colors"
          >
            <span>{ctaText}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </header>
  );
}
