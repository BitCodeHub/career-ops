"use client";

import { useState, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ApplicationStatus } from "@/lib/types";
import {
  Search,
  ArrowUpDown,
  FileText,
  CheckCircle2,
  XCircle,
  Briefcase,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface MockApp {
  id: string;
  num: number;
  date: string;
  company: string;
  role: string;
  score: number;
  status: ApplicationStatus;
  hasPdf: boolean;
  reportId: string | null;
  notes: string;
}

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------

const ALL_STATUSES: (ApplicationStatus | "All")[] = [
  "All",
  ApplicationStatus.Evaluated,
  ApplicationStatus.Applied,
  ApplicationStatus.Responded,
  ApplicationStatus.Interview,
  ApplicationStatus.Offer,
  ApplicationStatus.Rejected,
  ApplicationStatus.Discarded,
  ApplicationStatus.SKIP,
];

const mockApplications: MockApp[] = [
  { id: "1", num: 47, date: "2026-04-07", company: "Anthropic", role: "Head of Applied AI", score: 4.6, status: ApplicationStatus.Interview, hasPdf: true, reportId: "r-1", notes: "Strong match, 3rd round scheduled" },
  { id: "2", num: 46, date: "2026-04-06", company: "Stripe", role: "Staff ML Engineer", score: 4.2, status: ApplicationStatus.Applied, hasPdf: true, reportId: "r-2", notes: "Applied via referral" },
  { id: "3", num: 45, date: "2026-04-05", company: "OpenAI", role: "Research Engineer", score: 3.9, status: ApplicationStatus.Evaluated, hasPdf: true, reportId: "r-3", notes: "Good fit, need to tailor CV" },
  { id: "4", num: 44, date: "2026-04-04", company: "Notion", role: "AI Product Manager", score: 3.5, status: ApplicationStatus.Responded, hasPdf: false, reportId: "r-4", notes: "Recruiter reached out" },
  { id: "5", num: 43, date: "2026-04-03", company: "Vercel", role: "Senior Engineer, AI", score: 4.1, status: ApplicationStatus.Offer, hasPdf: true, reportId: "r-5", notes: "Offer received, evaluating" },
  { id: "6", num: 42, date: "2026-04-02", company: "Datadog", role: "ML Platform Lead", score: 3.3, status: ApplicationStatus.Rejected, hasPdf: true, reportId: "r-6", notes: "Position filled internally" },
  { id: "7", num: 41, date: "2026-04-01", company: "Figma", role: "ML Engineer", score: 2.8, status: ApplicationStatus.SKIP, hasPdf: false, reportId: "r-7", notes: "Too junior" },
  { id: "8", num: 40, date: "2026-03-31", company: "Scale AI", role: "Director of Engineering", score: 4.4, status: ApplicationStatus.Interview, hasPdf: true, reportId: "r-8", notes: "Final round next week" },
  { id: "9", num: 39, date: "2026-03-30", company: "Hugging Face", role: "Applied ML Scientist", score: 3.7, status: ApplicationStatus.Discarded, hasPdf: false, reportId: "r-9", notes: "Location mismatch" },
  { id: "10", num: 38, date: "2026-03-28", company: "Cohere", role: "Head of Solutions", score: 4.0, status: ApplicationStatus.Applied, hasPdf: true, reportId: "r-10", notes: "Submitted last week" },
  { id: "11", num: 37, date: "2026-03-26", company: "Linear", role: "AI Engineer", score: 4.3, status: ApplicationStatus.Offer, hasPdf: true, reportId: "r-11", notes: "Offer received!" },
  { id: "12", num: 36, date: "2026-03-24", company: "Retool", role: "Senior Platform Eng", score: 3.7, status: ApplicationStatus.Responded, hasPdf: true, reportId: "r-12", notes: "Recruiter reached out" },
  { id: "13", num: 35, date: "2026-03-22", company: "Temporal", role: "AI Forward Deploy", score: 4.0, status: ApplicationStatus.Interview, hasPdf: true, reportId: "r-13", notes: "2nd round next week" },
  { id: "14", num: 34, date: "2026-03-20", company: "Databricks", role: "Staff ML Engineer", score: 3.8, status: ApplicationStatus.Evaluated, hasPdf: true, reportId: "r-14", notes: "Interesting but far" },
  { id: "15", num: 33, date: "2026-03-18", company: "Palantir", role: "Forward Deploy Lead", score: 2.5, status: ApplicationStatus.SKIP, hasPdf: false, reportId: "r-15", notes: "Culture mismatch" },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function scoreColor(score: number): string {
  if (score >= 4) return "text-green-400";
  if (score >= 3) return "text-amber-400";
  return "text-red-400";
}

type SortField = "num" | "date" | "company" | "score" | "status";

// ---------------------------------------------------------------------------
// Page component
// ---------------------------------------------------------------------------

export default function ApplicationsPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<ApplicationStatus | "All">(
    "All"
  );
  const [sortField, setSortField] = useState<SortField>("num");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [apps, setApps] = useState<MockApp[]>(mockApplications);

  // Computed
  const filtered = useMemo(() => {
    let result = [...apps];

    if (statusFilter !== "All") {
      result = result.filter((a) => a.status === statusFilter);
    }

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (a) =>
          a.company.toLowerCase().includes(q) ||
          a.role.toLowerCase().includes(q) ||
          a.notes.toLowerCase().includes(q)
      );
    }

    result.sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];
      if (typeof aVal === "number" && typeof bVal === "number") {
        return sortDir === "asc" ? aVal - bVal : bVal - aVal;
      }
      return sortDir === "asc"
        ? String(aVal).localeCompare(String(bVal))
        : String(bVal).localeCompare(String(aVal));
    });

    return result;
  }, [apps, search, statusFilter, sortField, sortDir]);

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const a of apps) {
      counts[a.status] = (counts[a.status] || 0) + 1;
    }
    return counts;
  }, [apps]);

  function toggleSort(field: SortField) {
    if (sortField === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir("desc");
    }
  }

  function handleStatusChange(appId: string, newStatus: ApplicationStatus) {
    setApps((prev) =>
      prev.map((a) => (a.id === appId ? { ...a, status: newStatus } : a))
    );
  }

  const sortableHeaders: [SortField, string][] = [
    ["num", "#"],
    ["date", "Date"],
    ["company", "Company"],
    ["score", "Score"],
    ["status", "Status"],
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white tracking-tight">
          Applications
        </h2>
        <p className="mt-1 text-sm text-zinc-500">
          {apps.length} total applications tracked
        </p>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
        {ALL_STATUSES.filter((s) => s !== "All").map((status) => (
          <Card key={status}>
            <CardContent className="py-3 px-3 text-center">
              <p className="text-lg font-bold text-white">
                {statusCounts[status] || 0}
              </p>
              <p className="text-[10px] uppercase tracking-wider text-zinc-500">
                {status}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filter bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        {/* Status filter pills */}
        <div className="flex flex-wrap gap-1.5">
          {ALL_STATUSES.map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium border transition-colors ${
                statusFilter === s
                  ? "bg-cyan-500/20 text-cyan-400 border-cyan-500/30"
                  : "bg-white/[0.03] text-zinc-400 border-white/[0.06] hover:bg-white/[0.06] hover:border-white/[0.1]"
              }`}
            >
              {s}
              {s !== "All" && statusCounts[s]
                ? ` (${statusCounts[s]})`
                : s === "All"
                  ? ` (${apps.length})`
                  : ""}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative sm:ml-auto sm:w-72">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search company, role, or notes..."
            className="w-full pl-10 pr-4 py-2 bg-white/[0.03] border border-white/[0.06] rounded-lg text-sm text-white placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-cyan-500/30 focus:border-cyan-500/50 transition-all"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto border border-white/[0.06] rounded-xl">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-white/[0.04]">
              {sortableHeaders.map(([field, label]) => (
                <th
                  key={field}
                  onClick={() => toggleSort(field)}
                  className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500 cursor-pointer hover:text-zinc-300 transition-colors select-none"
                >
                  <span className="inline-flex items-center gap-1.5">
                    {label}
                    <ArrowUpDown
                      size={12}
                      className={
                        sortField === field ? "text-cyan-400" : "opacity-30"
                      }
                    />
                  </span>
                </th>
              ))}
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">
                Role
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">
                PDF
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">
                Report
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">
                Notes
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.04]">
            {filtered.length === 0 ? (
              <tr>
                <td
                  colSpan={9}
                  className="px-4 py-16 text-center"
                >
                  <div className="flex flex-col items-center gap-3">
                    <Briefcase size={32} className="text-zinc-700" />
                    <p className="text-sm text-zinc-500">
                      {apps.length === 0
                        ? "No applications yet. Start by evaluating an offer."
                        : "No applications match your filters."}
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              filtered.map((app) => (
                <tr
                  key={app.id}
                  className="hover:bg-white/[0.03] transition-colors duration-100 cursor-pointer"
                >
                  <td className="px-4 py-3 text-zinc-500 font-mono text-xs">
                    {app.num}
                  </td>
                  <td className="px-4 py-3 text-zinc-400 text-xs whitespace-nowrap">
                    {app.date}
                  </td>
                  <td className="px-4 py-3 text-white font-medium">
                    {app.company}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`font-semibold font-mono ${scoreColor(app.score)}`}
                    >
                      {app.score.toFixed(1)}
                    </span>
                    <span className="text-zinc-600 text-xs">/5</span>
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={app.status}
                      onChange={(e) =>
                        handleStatusChange(
                          app.id,
                          e.target.value as ApplicationStatus
                        )
                      }
                      className="appearance-none bg-transparent border-none text-xs font-medium cursor-pointer focus:outline-none"
                      style={{ color: "inherit" }}
                    >
                      {/* Hidden current badge -- shown via the option styling */}
                      {ALL_STATUSES.filter((s) => s !== "All").map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                    <Badge status={app.status} className="pointer-events-none" />
                  </td>
                  <td className="px-4 py-3 text-zinc-300 text-sm">
                    {app.role}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {app.hasPdf ? (
                      <CheckCircle2 size={16} className="text-green-400" />
                    ) : (
                      <XCircle size={16} className="text-zinc-600" />
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {app.reportId ? (
                      <FileText
                        size={16}
                        className="text-cyan-400 hover:text-cyan-300 cursor-pointer transition-colors"
                      />
                    ) : (
                      <span className="text-zinc-600">--</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-zinc-500 text-xs max-w-[200px] truncate">
                    {app.notes}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
