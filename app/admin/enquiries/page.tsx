"use client";

import React, { useState, useEffect } from "react";
import {
  Mail,
  Search,
  Trash2,
  CheckCircle,
  Clock,
  AlertCircle,
  Loader2,
  Download,
  Calendar,
  X,
} from "lucide-react";
import { toast } from "sonner";

export default function EnquiriesManagementPage() {
  const [enquiries, setEnquiries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<any>({ totalPages: 1 });
  const [selectedEnquiry, setSelectedEnquiry] = useState<any | null>(null);

  useEffect(() => {
    fetchEnquiries();
  }, [search, status, page]);

  const fetchEnquiries = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams({ search, status, page: page.toString(), limit: "15" });
      const res = await fetch(`/api/admin/enquiries?${query.toString()}`);
      const json = await res.json();
      if (json.success) {
        setEnquiries(json.data);
        setPagination(json.pagination);
      }
    } catch {
      toast.error("Failed to load enquiries");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/admin/enquiries/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const json = await res.json();
      if (json.success) {
        toast.success(`Status updated to ${newStatus}`);
        if (selectedEnquiry?.id === id) {
          setSelectedEnquiry({ ...selectedEnquiry, status: newStatus });
        }
        fetchEnquiries();
      }
    } catch {
      toast.error("Failed to update status");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this enquiry?")) return;
    try {
      const res = await fetch(`/api/admin/enquiries/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) {
        toast.success("Enquiry deleted");
        if (selectedEnquiry?.id === id) setSelectedEnquiry(null);
        fetchEnquiries();
      }
    } catch {
      toast.error("Failed to delete enquiry");
    }
  };

  const exportCSV = () => {
    if (enquiries.length === 0) return;
    const headers = ["ID", "Name", "Email", "Phone", "Subject", "Message", "Status", "Date"];
    const rows = enquiries.map((e) => [
      e.id,
      `"${e.name.replace(/"/g, '""')}"`,
      `"${e.email}"`,
      `"${e.phone || ""}"`,
      `"${(e.subject || "").replace(/"/g, '""')}"`,
      `"${e.message.replace(/"/g, '""')}"`,
      e.status,
      new Date(e.createdAt).toISOString(),
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `contact_enquiries_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Contact Enquiries
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
            Review public customer messages, update resolution statuses, and export CSV logs.
          </p>
        </div>

        <button
          onClick={exportCSV}
          disabled={enquiries.length === 0}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 text-xs font-semibold shadow-sm hover:bg-zinc-100 disabled:opacity-50 transition-colors"
        >
          <Download className="w-4 h-4" />
          <span>Export CSV</span>
        </button>
      </div>

      {/* Toolbar */}
      <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 absolute left-3 top-3 text-zinc-400" />
          <input
            type="text"
            placeholder="Search by name, email, or message..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs text-zinc-700 dark:text-zinc-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">All Statuses</option>
          <option value="new">New</option>
          <option value="in_progress">In Progress</option>
          <option value="resolved">Resolved</option>
        </select>
      </div>

      {/* Enquiries Table */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-20 flex justify-center text-zinc-400">
            <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
          </div>
        ) : enquiries.length === 0 ? (
          <div className="py-20 text-center text-zinc-400">
            <Mail className="w-12 h-12 mx-auto mb-3 stroke-1 text-zinc-300" />
            <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              No enquiries submitted
            </p>
            <p className="text-xs text-zinc-500 mt-1">
              Messages submitted through the public contact form will appear here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50 text-zinc-500 font-medium">
                  <th className="py-3 px-4">Contact</th>
                  <th className="py-3 px-4">Subject & Message</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {enquiries.map((e) => (
                  <tr
                    key={e.id}
                    onClick={() => setSelectedEnquiry(e)}
                    className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30 cursor-pointer transition-colors"
                  >
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-zinc-900 dark:text-zinc-100">
                        {e.name}
                      </div>
                      <div className="text-[11px] text-zinc-400 font-mono mt-0.5">
                        {e.email} {e.phone && `• ${e.phone}`}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 max-w-sm">
                      <div className="font-medium text-zinc-800 dark:text-zinc-200 truncate">
                        {e.subject || "No subject"}
                      </div>
                      <div className="text-[11px] text-zinc-400 truncate mt-0.5">
                        {e.message}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-wider ${
                          e.status === "new"
                            ? "bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400"
                            : e.status === "in_progress"
                            ? "bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400"
                            : "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400"
                        }`}
                      >
                        {e.status.replace("_", " ")}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-zinc-500 text-[11px]">
                      {new Date(e.createdAt).toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={(ev) => {
                          ev.stopPropagation();
                          handleDelete(e.id);
                        }}
                        className="p-1.5 text-zinc-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Enquiry Detail Modal */}
      {selectedEnquiry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-zinc-900 w-full max-w-lg rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-100 dark:border-zinc-800">
              <div>
                <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                  {selectedEnquiry.subject || "Enquiry Details"}
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Received {new Date(selectedEnquiry.createdAt).toLocaleString()}
                </p>
              </div>
              <button
                onClick={() => setSelectedEnquiry(null)}
                className="text-zinc-400 hover:text-zinc-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-zinc-50 dark:bg-zinc-800/40 p-4 rounded-xl space-y-1 text-xs">
              <p>
                <strong>From:</strong> {selectedEnquiry.name} &lt;{selectedEnquiry.email}&gt;
              </p>
              {selectedEnquiry.phone && (
                <p>
                  <strong>Phone:</strong> {selectedEnquiry.phone}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-500 mb-1">
                Message Content
              </label>
              <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-800 dark:text-zinc-200 whitespace-pre-wrap max-h-60 overflow-y-auto">
                {selectedEnquiry.message}
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-zinc-100 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-zinc-500">Status:</span>
                <select
                  value={selectedEnquiry.status}
                  onChange={(e) => handleStatusChange(selectedEnquiry.id, e.target.value)}
                  className="px-2.5 py-1 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs font-semibold"
                >
                  <option value="new">New</option>
                  <option value="in_progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                </select>
              </div>

              <button
                onClick={() => setSelectedEnquiry(null)}
                className="px-4 py-2 rounded-xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
