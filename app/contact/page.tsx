import React from "react";
import PublicHeader from "@/src/components/public/PublicHeader";
import PublicFooter from "@/src/components/public/PublicFooter";
import ContactFormClient from "@/src/components/public/ContactFormClient";
import { getSiteSettings } from "@/src/lib/public-data";

export const metadata = {
  title: "Contact Us | Antigravity Platform",
  description: "Get in touch with our team for consultations, support, and inquiries.",
};

export default async function ContactPage() {
  const settings = await getSiteSettings();

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 antialiased">
      <PublicHeader />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full">
        <ContactFormClient
          contactEmail={settings.contact_email}
          contactPhone={settings.contact_phone}
          contactAddress={settings.contact_address}
        />
      </main>

      <PublicFooter />
    </div>
  );
}
