import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ApplicationStatus } from "@/lib/types";
import type { Application } from "@/lib/types";
import {
  Briefcase,
  Star,
  GitBranch,
  TrendingUp,
  ArrowRight,
  Plus,
  Upload,
  ListChecks,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Mock data helpers (used until the database is connected)
// ---------------------------------------------------------------------------

interface DashboardStats {
  totalApplications: number;
  averageScore: number;
  pipelineUrls: number;
  interviewRate: number;
}

function getMockStats(): DashboardStats {
  return {
    totalApplications: 47,
    averageScore: 3.8,
    pipelineUrls: 12,
    interviewRate: 23.4,
  };
}

function getMockApplications(): Application[] {
  const now = new Date().toISOString();
  return [
    {
      id: "1",
      num: 47,
      date: "2026-04-07",
      company: "Anthropic",
      role: "Head of Applied AI",
      score: 4.6,
      status: ApplicationStatus.Interview,
      has_pdf: 1,
      report_id: "r-1",
      notes: "Strong match, 3rd round scheduled",
      url: "https://anthropic.com/careers/head-applied-ai",
      archetype: "AI Leader",
      created_at: now,
      updated_at: now,
    },
    {
      id: "2",
      num: 46,
      date: "2026-04-06",
      company: "Stripe",
      role: "Staff ML Engineer",
      score: 4.2,
      status: ApplicationStatus.Applied,
      has_pdf: 1,
      report_id: "r-2",
      notes: "Applied via referral",
      url: null,
      archetype: "ML Engineer",
      created_at: now,
      updated_at: now,
    },
    {
      id: "3",
      num: 45,
      date: "2026-04-05",
      company: "OpenAI",
      role: "Research Engineer",
      score: 3.9,
      status: ApplicationStatus.Evaluated,
      has_pdf: 1,
      report_id: "r-3",
      notes: "Good fit, need to tailor CV",
      url: null,
      archetype: "Research",
      created_at: now,
      updated_at: now,
    },
    {
      id: "4",
      num: 44,
      date: "2026-04-04",
      company: "Notion",
      role: "AI Product Manager",
      score: 3.5,
      status: ApplicationStatus.Responded,
      has_pdf: 0,
      report_id: "r-4",
      notes: "Recruiter reached out",
      url: null,
      archetype: "Product",
      created_at: now,
      updated_at: now,
    },
    {
      id: "5",
      num: 43,
      date: "2026-04-03",
      company: "Vercel",
      role: "Senior Engineer, AI",
      score: 4.1,
      status: ApplicationStatus.Offer,
      has_pdf: 1,
      report_id: "r-5",
      notes: "Offer received, evaluating",
      url: null,
      archetype: "Full-Stack AI",
      created_at: now,
      updated_at: now,
    },
    {
      id: "6",
      num: 42,
      date: "2026-04-02",
      company: "Datadog",
      role: "ML Platform Lead",
      score: 3.3,
      status: ApplicationStatus.Rejected,
      has_pdf: 1,
      report_id: "r-6",
      notes: "Position filled internally",
      url: null,
      archetype: "ML Platform",
      created_at: now,
      updated_at: now,
    },
    {
      id: "7",
      num: 41,
      date: "2026-04-01",
      company: "Scale AI",
      role: "Director of Engineering",
      score: 4.4,
      status: ApplicationStatus.Interview,
      has_pdf: 1,
      report_id: "r-7",
      notes: "Final round next week",
      url: null,
      archetype: "Engineering Leader",
      created_at: now,
      updated_at: now,
    },
    {
      id: "8",
      num: 40,
      date: "2026-03-30",
      company: "Hugging Face",
      role: "Applied ML Scientist",
      score: 3.7,
      status: ApplicationStatus.Discarded,
      has_pdf: 0,
      report_id: "r-8",
      notes: "Location mismatch",
      url: null,
      archetype: "ML Scientist",
      created_at: now,
      updated_at: now,
    },
    {
      id: "9",
      num: 39,
      date: "2026-03-28",
      company: "Figma",
      role: "AI Engineer",
      score: 3.2,
      status: ApplicationStatus.SKIP,
      has_pdf: 0,
      report_id: "r-9",
      notes: "Too junior",
      url: null,
      archetype: "AI Engineer",
      created_at: now,
      updated_at: now,
    },
    {
      id: "10",
      num: 38,
      date: "2026-03-26",
      company: "Cohere",
      role: "Head of Solutions",
      score: 4.0,
      status: ApplicationStatus.Applied,
      has_pdf: 1,
      report_id: "r-10",
      notes: "Submitted last week",
      url: null,
      archetype: "Solutions Lead",
      created_at: now,
      updated_at: now,
    },
  ];
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function StatCard({
  label,
  value,
  subtitle,
  icon,
  accentColor,
}: {
  label: string;
  value: string;
  subtitle?: string;
  icon: React.ReactNode;
  accentColor: string;
}) {
  return (
    <Card>
      <CardContent className="flex items-start justify-between py-5">
        <div className="space-y-1">
          <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">
            {label}
          </p>
          <p className={`text-3xl font-bold tracking-tight ${accentColor}`}>
            {value}
          </p>
          {subtitle && (
            <p className="text-xs text-zinc-500">{subtitle}</p>
          )}
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/[0.04]">
          {icon}
        </div>
      </CardContent>
    </Card>
  );
}

function scoreColor(score: number | null): string {
  if (score === null) return "text-zinc-500";
  if (score >= 4) return "text-green-400";
  if (score >= 3) return "text-amber-400";
  return "text-red-400";
}

// ---------------------------------------------------------------------------
// Page (server component)
// ---------------------------------------------------------------------------

export default function DashboardPage() {
  const stats = getMockStats();
  const applications = getMockApplications();
  const userName: string | null = null; // Will come from profile once db is connected

  return (
    <div className="space-y-8">
      {/* Welcome header */}
      <div>
        <h2 className="text-2xl font-bold text-white tracking-tight">
          {userName ? `Welcome back, ${userName}` : "Welcome to Career Ops"}
        </h2>
        <p className="mt-1 text-sm text-zinc-500">
          Your AI-powered job search command center
        </p>
      </div>

      {/* Stat cards grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total Applications"
          value={String(stats.totalApplications)}
          subtitle="across all statuses"
          icon={<Briefcase size={20} className="text-cyan-400" />}
          accentColor="text-cyan-400"
        />
        <StatCard
          label="Average Score"
          value={stats.averageScore.toFixed(1)}
          subtitle="out of 5.0"
          icon={<Star size={20} className="text-amber-400" />}
          accentColor="text-amber-400"
        />
        <StatCard
          label="Pipeline URLs"
          value={String(stats.pipelineUrls)}
          subtitle="pending evaluation"
          icon={<GitBranch size={20} className="text-purple-400" />}
          accentColor="text-purple-400"
        />
        <StatCard
          label="Interview Rate"
          value={`${stats.interviewRate}%`}
          subtitle="Interview+ stages"
          icon={<TrendingUp size={20} className="text-green-400" />}
          accentColor="text-green-400"
        />
      </div>

      {/* Recent applications table */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">
            Recent Applications
          </h3>
          <Link
            href="/applications"
            className="inline-flex items-center gap-1.5 text-sm text-cyan-400 hover:text-cyan-300 transition-colors"
          >
            View all <ArrowRight size={14} />
          </Link>
        </div>

        <div className="overflow-x-auto border border-white/[0.06] rounded-xl">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-white/[0.04]">
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">
                  #
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">
                  Date
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">
                  Company
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">
                  Role
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">
                  Score
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">
                  Notes
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {applications.map((app) => (
                <tr
                  key={app.id}
                  className="hover:bg-white/[0.03] transition-colors duration-100"
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
                  <td className="px-4 py-3 text-zinc-300">{app.role}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`font-semibold font-mono ${scoreColor(app.score)}`}
                    >
                      {app.score !== null ? app.score.toFixed(1) : "--"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <Badge status={app.status} />
                  </td>
                  <td className="px-4 py-3 text-zinc-500 text-xs max-w-[200px] truncate">
                    {app.notes}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Score distribution placeholder + Quick actions */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Score distribution chart placeholder */}
        <Card>
          <CardContent className="py-5">
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-zinc-500">
              Score Distribution
            </h3>
            <div className="flex h-48 items-center justify-center rounded-lg border border-dashed border-white/[0.08] bg-white/[0.01]">
              <p className="text-sm text-zinc-600">
                Chart will be rendered here with Recharts
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Quick actions */}
        <Card>
          <CardContent className="py-5">
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-zinc-500">
              Quick Actions
            </h3>
            <div className="space-y-3">
              <Link
                href="/evaluate"
                className="flex items-center gap-3 rounded-lg border border-white/[0.06] bg-white/[0.02] px-4 py-3 text-sm text-zinc-300 transition-all hover:border-cyan-500/30 hover:bg-cyan-500/5 hover:text-white"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-cyan-500/10">
                  <Plus size={16} className="text-cyan-400" />
                </div>
                <div>
                  <p className="font-medium">Evaluate New Offer</p>
                  <p className="text-xs text-zinc-500">
                    Paste a JD or URL to get a full analysis
                  </p>
                </div>
                <ArrowRight size={16} className="ml-auto text-zinc-600" />
              </Link>

              <Link
                href="/settings"
                className="flex items-center gap-3 rounded-lg border border-white/[0.06] bg-white/[0.02] px-4 py-3 text-sm text-zinc-300 transition-all hover:border-purple-500/30 hover:bg-purple-500/5 hover:text-white"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-purple-500/10">
                  <Upload size={16} className="text-purple-400" />
                </div>
                <div>
                  <p className="font-medium">Upload Resume</p>
                  <p className="text-xs text-zinc-500">
                    Update your CV for better evaluations
                  </p>
                </div>
                <ArrowRight size={16} className="ml-auto text-zinc-600" />
              </Link>

              <Link
                href="/pipeline"
                className="flex items-center gap-3 rounded-lg border border-white/[0.06] bg-white/[0.02] px-4 py-3 text-sm text-zinc-300 transition-all hover:border-amber-500/30 hover:bg-amber-500/5 hover:text-white"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-amber-500/10">
                  <ListChecks size={16} className="text-amber-400" />
                </div>
                <div>
                  <p className="font-medium">View Pipeline</p>
                  <p className="text-xs text-zinc-500">
                    Manage pending URLs and batch evaluations
                  </p>
                </div>
                <ArrowRight size={16} className="ml-auto text-zinc-600" />
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
