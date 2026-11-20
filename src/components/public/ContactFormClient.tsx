"use client";

import React, { useState } from "react";
import { Mail, Phone, MapPin, Send, Loader2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

export default function ContactFormClient({
  contactEmail,
  contactPhone,
  contactAddress,
}: {
  contactEmail?: string;
  contactPhone?: string;
  contactAddress?: string;
}) {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const json = await res.json();
      if (json.success) {
        toast.success("Enquiry sent successfully!");
        setSubmitted(true);
      } else {
        toast.error(json.message || "Failed to submit enquiry");
      }
    } catch {
      toast.error("Network error while submitting enquiry");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
      {/* Contact Information */}
      <div className="space-y-8">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            Reach Out
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight mt-1">
            Let&apos;s Build Something Extraordinary Together
          </h1>
          <p className="text-sm text-zinc-500 mt-4 leading-relaxed">
            Have a project in mind, an inquiry, or want to explore dynamic solutions? Leave us a note and our team will get back to you promptly.
          </p>
        </div>

        <div className="space-y-4">
          {contactEmail && (
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
              <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-950/70 text-indigo-600 flex items-center justify-center shrink-0">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                  Email Support
                </p>
                <a href={`mailto:${contactEmail}`} className="text-sm font-bold text-zinc-900 dark:text-zinc-100 hover:text-indigo-600">
                  {contactEmail}
                </a>
              </div>
            </div>
          )}

          {contactPhone && (
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
              <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-950/70 text-indigo-600 flex items-center justify-center shrink-0">
                <Phone className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                  Call Us Directly
                </p>
                <a href={`tel:${contactPhone}`} className="text-sm font-bold text-zinc-900 dark:text-zinc-100 hover:text-indigo-600">
                  {contactPhone}
                </a>
              </div>
            </div>
          )}

          {contactAddress && (
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
              <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-950/70 text-indigo-600 flex items-center justify-center shrink-0">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                  Headquarters
                </p>
                <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                  {contactAddress}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Interactive Form Card */}
      <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 p-8 shadow-xl">
        {submitted ? (
          <div className="py-16 text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
              Thank You!
            </h3>
            <p className="text-xs text-zinc-500 max-w-sm mx-auto">
              Your inquiry has been stored securely in our database. An administrator will review your message and reply soon.
            </p>
            <button
              onClick={() => {
                setSubmitted(false);
                setForm({ name: "", email: "", phone: "", subject: "", message: "" });
              }}
              className="mt-4 px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 text-xs font-semibold"
            >
              Send Another Note
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 border-b border-zinc-100 dark:border-zinc-800 pb-3">
              Send an Enquiry
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Your Name *
                </label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Jane Doe"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs text-zinc-900 dark:text-zinc-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="jane@example.com"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs text-zinc-900 dark:text-zinc-100"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="+1 (555) 000-0000"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs text-zinc-900 dark:text-zinc-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Subject
                </label>
                <input
                  type="text"
                  value={form.subject}
                  onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  placeholder="Inquiry Topic"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs text-zinc-900 dark:text-zinc-100"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Your Message *
              </label>
              <textarea
                rows={4}
                required
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                placeholder="How can we help your business?"
                className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs text-zinc-900 dark:text-zinc-100"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold shadow-lg shadow-indigo-600/25 transition-all"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              <span>Submit Message</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
