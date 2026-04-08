"use client";

import { useState, useMemo } from "react";
import { Search, Filter, ArrowUpDown } from "lucide-react";

const ALL_STATUSES = ["All", "Evaluated", "Applied", "Responded", "Interview", "Offer", "Rejected", "Discarded", "SKIP"];

const statusColors: Record<string, string> = {
  Evaluated: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  Applied: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
  Responded: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  Interview: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  Offer: "bg-green-500/20 text-green-400 border-green-500/30",
  Rejected: "bg-red-500/20 text-red-400 border-red-500/30",
  Discarded: "bg-zinc-500/20 text-zinc-400 border-zinc-500/30",
  SKIP: "bg-zinc-700/20 text-zinc-500 border-zinc-700/30",
};

const mockApplications = [
  { id: "1", num: 47, date: "2026-04-07", company: "Anthropic", role: "Senior AI Engineer", score: 4.5, status: "Evaluated", hasPdf: true, notes: "Strong match, apply soon" },
  { id: "2", num: 46, date: "2026-04-06", company: "OpenAI", role: "ML Platform Lead", score: 4.2, status: "Applied", hasPdf: true, notes: "Applied via referral" },
  { id: "3", num: 45, date: "2026-04-05", company: "Stripe", role: "Staff Engineer, ML", score: 3.9, status: "Interview", hasPdf: true, notes: "Phone screen scheduled" },
  { id: "4", num: 44, date: "2026-04-04", company: "Datadog", role: "AI Solutions Architect", score: 4.1, status: "Evaluated", hasPdf: false, notes: "" },
  { id: "5", num: 43, date: "2026-04-03", company: "Vercel", role: "Senior AI Engineer", score: 3.6, status: "Applied", hasPdf: true, notes: "" },
  { id: "6", num: 42, date: "2026-04-02", company: "Notion", role: "AI Product Manager", score: 3.2, status: "Rejected", hasPdf: true, notes: "Position filled" },
  { id: "7", num: 41, date: "2026-04-01", company: "Figma", role: "ML Engineer", score: 2.8, status: "SKIP", hasPdf: false, notes: "Not aligned with target" },
  { id: "8", num: 40, date: "2026-03-31", company: "Linear", role: "AI Engineer", score: 4.3, status: "Offer", hasPdf: true, notes: "Offer received!" },
  { id: "9", num: 39, date: "2026-03-30", company: "Retool", role: "Senior Platform Eng", score: 3.7, status: "Responded", hasPdf: true, notes: "Recruiter reached out" },
  { id: "10", num: 38, date: "2026-03-29", company: "Temporal", role: "AI Forward Deploy", score: 4.0, status: "Interview", hasPdf: true, notes: "2nd round next week" },
];

function scoreColor(score: number) {
  if (score >= 4) return "text-green-400";
  if (score >= 3) return "text-amber-400";
  return "text-red-400";
}

type SortField = "num" | "date" | "company" | "score" | "status";

export default function ApplicationsPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [sortField, setSortField] = useState<SortField>("num");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const filtered = useMemo(() => {
    let apps = [...mockApplications];
    if (statusFilter !== "All") {
      apps = apps.filter((a) => a.status === statusFilter);
    }
    if (search) {
      const q = search.toLowerCase();
      apps = apps.filter(
        (a) =>
          a.company.toLowerCase().includes(q) ||
          a.role.toLowerCase().includes(q) ||
          a.notes.toLowerCase().includes(q)
      );
    }
    apps.sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];
      if (typeof aVal === "number" && typeof bVal === "number") {
        return sortDir === "asc" ? aVal - bVal : bVal - aVal;
      }
      return sortDir === "asc"
        ? String(aVal).localeCompare(String(bVal))
        : String(bVal).localeCompare(String(aVal));
    });
    return apps;
  }, [search, statusFilter, sortField, sortDir]);

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir("desc");
    }
  };

  const statusCounts = mockApplications.reduce<Record<string, number>>((acc, a) => {
    acc[a.status] = (acc[a.status] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Applications</h1>
        <p className="text-zinc-400 mt-1">{mockApplications.length} total applications tracked</p>
      </div>

      {/* Status summary */}
      <div className="flex flex-wrap gap-2">
        {ALL_STATUSES.map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
              statusFilter === s
                ? "bg-cyan-500/20 text-cyan-400 border-cyan-500/30"
                : "bg-white/[0.03] text-zinc-400 border-white/10 hover:bg-white/[0.06]"
            }`}
          >
            {s} {s !== "All" && statusCounts[s] ? `(${statusCounts[s]})` : s === "All" ? `(${mockApplications.length})` : ""}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search company, role, or notes..."
          className="w-full pl-10 pr-4 py-2.5 bg-white/[0.03] border border-white/10 rounded-lg text-sm text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-cyan-500/40"
        />
      </div>

      {/* Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                {([
                  ["num", "#"],
                  ["date", "Date"],
                  ["company", "Company"],
                  ["score", "Score"],
                  ["status", "Status"],
                ] as [SortField, string][]).map(([field, label]) => (
                  <th
                    key={field}
                    onClick={() => toggleSort(field)}
                    className="text-left text-xs font-medium text-zinc-500 uppercase tracking-wider px-5 py-3 cursor-pointer hover:text-zinc-300 transition-colors select-none"
                  >
                    <span className="flex items-center gap-1">
                      {label}
                      <ArrowUpDown size={12} className={sortField === field ? "text-cyan-400" : "opacity-30"} />
                    </span>
                  </th>
                ))}
                <th className="text-left text-xs font-medium text-zinc-500 uppercase tracking-wider px-5 py-3">Role</th>
                <th className="text-left text-xs font-medium text-zinc-500 uppercase tracking-wider px-5 py-3">PDF</th>
                <th className="text-left text-xs font-medium text-zinc-500 uppercase tracking-wider px-5 py-3">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.03]">
              {filtered.map((app) => (
                <tr key={app.id} className="hover:bg-white/[0.02] transition-colors cursor-pointer">
                  <td className="px-5 py-3 text-sm text-zinc-500 font-mono">{app.num}</td>
                  <td className="px-5 py-3 text-sm text-zinc-400">{app.date}</td>
                  <td className="px-5 py-3 text-sm text-white font-medium">{app.company}</td>
                  <td className={`px-5 py-3 text-sm font-semibold ${scoreColor(app.score)}`}>{app.score}/5</td>
                  <td className="px-5 py-3">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusColors[app.status]}`}>
                      {app.status}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-sm text-zinc-300">{app.role}</td>
                  <td className="px-5 py-3 text-sm">{app.hasPdf ? <span className="text-green-400">Y</span> : <span className="text-zinc-600">N</span>}</td>
                  <td className="px-5 py-3 text-sm text-zinc-500 max-w-[200px] truncate">{app.notes}</td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-5 py-12 text-center text-sm text-zinc-500">
                    No applications match your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
