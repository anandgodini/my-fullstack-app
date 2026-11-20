import React from "react";
import Link from "next/link";
import { getFooterNavigation, getSiteSettings } from "@/src/lib/public-data";
import { Sliders } from "lucide-react";
import {
  FacebookIcon,
  InstagramIcon,
  LinkedinIcon,
  TwitterIcon,
  YoutubeIcon,
} from "@/src/components/ui/SocialIcons";

export default async function PublicFooter() {
  const [footerNav, settings] = await Promise.all([
    getFooterNavigation(),
    getSiteSettings(),
  ]);

  const siteName = settings.site_name || "Antigravity CMS";
  const footerDesc = settings.footer_description || "A high-performance modern CMS powered by Next.js and PostgreSQL.";
  const copyright = settings.copyright_text || `© ${new Date().getFullYear()} ${siteName}. All rights reserved.`;

  const socialLinks = [
    { key: "facebook", url: settings.facebook, icon: FacebookIcon },
    { key: "instagram", url: settings.instagram, icon: InstagramIcon },
    { key: "linkedin", url: settings.linkedin, icon: LinkedinIcon },
    { key: "x_twitter", url: settings.x_twitter, icon: TwitterIcon },
    { key: "youtube", url: settings.youtube, icon: YoutubeIcon },
  ].filter((item) => item.url && item.url.trim().length > 0);

  return (
    <footer className="bg-white dark:bg-zinc-950 border-t border-zinc-200 dark:border-zinc-800 pt-12 pb-8 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand & Summary */}
          <div className="md:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold">
                <Sliders className="w-3.5 h-3.5" />
              </div>
              <span className="font-bold text-base tracking-tight text-zinc-900 dark:text-zinc-50">
                {siteName}
              </span>
            </Link>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-sm leading-relaxed">
              {footerDesc}
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">
              Quick Links
            </h4>
            <ul className="space-y-2">
              {footerNav.map((link: any) => (
                <li key={link.id}>
                  <Link
                    href={link.url}
                    target={link.target || "_self"}
                    className="text-xs text-zinc-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Social Channels */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">
              Connect With Us
            </h4>
            <div className="flex items-center gap-3">
              {socialLinks.map((s) => {
                const Icon = s.icon;
                return (
                  <a
                    key={s.key}
                    href={s.url}
                    target="_blank"
                    rel="noreferrer"
                    className="w-8 h-8 rounded-lg border border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-zinc-500 hover:text-indigo-600 hover:border-indigo-400 transition-colors"
                  >
                    <Icon className="w-4 h-4" />
                  </a>
                );
              })}
            </div>
            {settings.contact_email && (
              <p className="text-[11px] text-zinc-400 mt-2">
                Inquiries: {settings.contact_email}
              </p>
            )}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-zinc-100 dark:border-zinc-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-400">
          <p>{copyright}</p>
          <div className="flex items-center gap-4">
            <Link href="/login" className="hover:text-zinc-600 dark:hover:text-zinc-300">
              Admin Portal
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
