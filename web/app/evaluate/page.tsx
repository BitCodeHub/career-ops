"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea, Input } from "@/components/ui/input";
import type {
  EvaluationResult,
  BlockA,
  BlockB,
  BlockC,
  BlockD,
  BlockE,
  BlockF,
} from "@/lib/types";
import {
  ClipboardList,
  Target,
  BarChart3,
  DollarSign,
  Pencil,
  MessageSquare,
  Save,
  FileDown,
  Link as LinkIcon,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Mock evaluation result
// ---------------------------------------------------------------------------

function getMockEvaluation(): EvaluationResult {
  return {
    archetype: "AI Leader",
    score: 4.3,
    keywords: [
      "machine learning",
      "team leadership",
      "production ML",
      "strategy",
    ],
    markdownReport: "# Evaluation Report\n\nFull markdown content here...",
    roleSummary: {
      archetype: "AI Leader",
      secondaryArchetype: "ML Engineer",
      domain: "AI / Machine Learning",
      function: "Engineering Leadership",
      seniority: "Senior / Head",
      remote: "Hybrid (2 days office)",
      teamSize: "8-12 reports",
      tldr: "Lead AI/ML team building production systems for enterprise customers. Strong match with your background in applied AI and team management.",
    },
    cvMatch: {
      matches: [
        {
          jdRequirement: "5+ years ML experience",
          cvEvidence:
            "7 years across 3 companies building production ML systems",
          strength: "strong",
        },
        {
          jdRequirement: "Team leadership experience",
          cvEvidence: "Led team of 6 at previous role",
          strength: "strong",
        },
        {
          jdRequirement: "Experience with LLMs",
          cvEvidence: "Built RAG pipeline and fine-tuned models",
          strength: "strong",
        },
        {
          jdRequirement: "Python & PyTorch expertise",
          cvEvidence: "Primary stack for 5+ years",
          strength: "strong",
        },
        {
          jdRequirement: "Cloud infrastructure (AWS/GCP)",
          cvEvidence: "Some GCP experience, mostly Azure",
          strength: "partial",
        },
      ],
      gaps: [
        {
          requirement: "Kubernetes at scale",
          severity: "nice_to_have",
          adjacentExperience: "Docker Compose and ECS experience",
          mitigation:
            "Highlight containerization experience, frame K8s as natural progression",
        },
      ],
    },
    levelStrategy: {
      detectedLevel: "Head / Senior Manager",
      candidateLevel: "Senior IC / Team Lead",
      sellSeniorPlan:
        "Emphasize the scope of cross-functional projects and strategic impact at previous roles",
      downlevelPlan:
        "If hired at Staff level, negotiate title review at 6 months with clear promotion criteria",
    },
    compDemand: {
      salaryRange: "$220k-$280k base + equity",
      companyReputation: "Strong brand, well-funded Series C",
      demandTrend: "High demand, 3 similar roles open",
      sources: ["levels.fyi", "Glassdoor", "Blind"],
      notes: "Consider negotiating equity refresh after year 1",
    },
    personalizationPlan: {
      cvChanges: [
        {
          section: "Summary",
          currentState: "Generic ML engineer summary",
          proposedChange:
            "Lead with leadership narrative and production ML at scale",
          reason: "Role emphasizes people management and strategic thinking",
        },
        {
          section: "Experience - Company A",
          currentState: "Bullet list of technical tasks",
          proposedChange: "Add team size, budget, and business impact metrics",
          reason: "Shows Head-level scope and leadership readiness",
        },
      ],
      linkedinChanges: [
        {
          section: "Headline",
          currentState: "ML Engineer | AI Specialist",
          proposedChange: "AI/ML Leader | Building Production AI Teams",
          reason: "Matches the seniority signal of the target role",
        },
      ],
    },
    interviewPlan: {
      stories: [
        {
          jdRequirement: "Led ML team to production",
          title: "Shipping the recommendation engine",
          situation:
            "Company needed to replace rule-based system with ML recommendations",
          task: "Build and lead a team of 4 ML engineers to ship in 3 months",
          action:
            "Defined architecture, hired 2 new engineers, ran weekly sprints with stakeholders",
          result:
            "Shipped on time, 23% improvement in conversion, promoted to lead",
          reflection:
            "Learned the importance of stakeholder alignment in ML projects",
        },
      ],
      recommendedCaseStudy: "Production ML pipeline architecture",
      redFlagQuestions: [
        {
          question: "Why are you leaving your current role?",
          suggestedAnswer:
            "I've had a great run, but I'm looking for a bigger scope where I can build an AI team from scratch and drive strategy at the org level.",
        },
        {
          question: "Do you have Head-level experience?",
          suggestedAnswer:
            "While my title was Team Lead, my scope was Head-equivalent: I managed the budget, hiring plan, and cross-functional roadmap for the ML platform.",
        },
      ],
    },
  };
}

// ---------------------------------------------------------------------------
// Tab definitions
// ---------------------------------------------------------------------------

type TabId =
  | "summary"
  | "match"
  | "level"
  | "comp"
  | "personalization"
  | "interview";

interface TabDef {
  id: TabId;
  label: string;
  icon: React.ReactNode;
}

const TABS: TabDef[] = [
  { id: "summary", label: "Role Summary", icon: <ClipboardList size={16} /> },
  { id: "match", label: "CV Match", icon: <Target size={16} /> },
  { id: "level", label: "Level & Strategy", icon: <BarChart3 size={16} /> },
  { id: "comp", label: "Comp & Demand", icon: <DollarSign size={16} /> },
  {
    id: "personalization",
    label: "Personalization",
    icon: <Pencil size={16} />,
  },
  {
    id: "interview",
    label: "Interview Plan",
    icon: <MessageSquare size={16} />,
  },
];

// ---------------------------------------------------------------------------
// Block renderers
// ---------------------------------------------------------------------------

function RoleSummaryBlock({ data }: { data: BlockA }) {
  const rows: [string, string][] = [
    ["Archetype", data.archetype],
    ["Secondary", data.secondaryArchetype ?? "--"],
    ["Domain", data.domain],
    ["Function", data.function],
    ["Seniority", data.seniority],
    ["Remote", data.remote],
    ["Team Size", data.teamSize ?? "--"],
  ];

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-lg border border-white/[0.06]">
        <table className="w-full text-sm">
          <tbody className="divide-y divide-white/[0.04]">
            {rows.map(([label, value]) => (
              <tr key={label} className="hover:bg-white/[0.02]">
                <td className="px-4 py-2.5 text-zinc-500 font-medium w-40">
                  {label}
                </td>
                <td className="px-4 py-2.5 text-zinc-200">{value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="rounded-lg border border-cyan-500/20 bg-cyan-500/5 px-4 py-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-cyan-400 mb-1">
          TL;DR
        </p>
        <p className="text-sm text-zinc-300 leading-relaxed">{data.tldr}</p>
      </div>
    </div>
  );
}

function CVMatchBlock({ data }: { data: BlockB }) {
  const strengthColors: Record<string, string> = {
    strong: "text-green-400 bg-green-500/10 border-green-500/20",
    partial: "text-amber-400 bg-amber-500/10 border-amber-500/20",
    weak: "text-red-400 bg-red-500/10 border-red-500/20",
  };

  return (
    <div className="space-y-6">
      <div>
        <h4 className="mb-3 text-sm font-semibold text-zinc-300">Matches</h4>
        <div className="space-y-2">
          {data.matches.map((m, i) => (
            <div
              key={i}
              className="flex items-start gap-3 rounded-lg border border-white/[0.06] bg-white/[0.02] px-4 py-3"
            >
              <span
                className={`mt-0.5 shrink-0 rounded-md border px-2 py-0.5 text-xs font-medium ${strengthColors[m.strength]}`}
              >
                {m.strength}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm text-zinc-200">{m.jdRequirement}</p>
                <p className="mt-0.5 text-xs text-zinc-500">{m.cvEvidence}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {data.gaps.length > 0 && (
        <div>
          <h4 className="mb-3 text-sm font-semibold text-zinc-300">Gaps</h4>
          <div className="space-y-2">
            {data.gaps.map((g, i) => (
              <div
                key={i}
                className="rounded-lg border border-amber-500/20 bg-amber-500/5 px-4 py-3"
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium text-amber-300">
                    {g.requirement}
                  </span>
                  <span className="text-xs text-amber-500/80 border border-amber-500/20 rounded px-1.5 py-0.5">
                    {g.severity.replace("_", " ")}
                  </span>
                </div>
                {g.adjacentExperience && (
                  <p className="text-xs text-zinc-400">
                    Adjacent: {g.adjacentExperience}
                  </p>
                )}
                <p className="text-xs text-zinc-500 mt-1">
                  Mitigation: {g.mitigation}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function LevelStrategyBlock({ data }: { data: BlockC }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-1">
            Detected Level
          </p>
          <p className="text-sm text-zinc-200">{data.detectedLevel}</p>
        </div>
        <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-1">
            Your Level
          </p>
          <p className="text-sm text-zinc-200">{data.candidateLevel}</p>
        </div>
      </div>
      <div className="rounded-lg border border-green-500/20 bg-green-500/5 px-4 py-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-green-400 mb-1">
          Sell-Up Strategy
        </p>
        <p className="text-sm text-zinc-300 leading-relaxed">
          {data.sellSeniorPlan}
        </p>
      </div>
      <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 px-4 py-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-amber-400 mb-1">
          Downlevel Contingency
        </p>
        <p className="text-sm text-zinc-300 leading-relaxed">
          {data.downlevelPlan}
        </p>
      </div>
    </div>
  );
}

function CompDemandBlock({ data }: { data: BlockD }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-lg border border-cyan-500/20 bg-cyan-500/5 px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-cyan-400 mb-1">
            Salary Range
          </p>
          <p className="text-lg font-semibold text-white">{data.salaryRange}</p>
        </div>
        <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-1">
            Demand Trend
          </p>
          <p className="text-sm text-zinc-200">
            {data.demandTrend ?? "Unknown"}
          </p>
        </div>
      </div>
      {data.companyReputation && (
        <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-1">
            Company Reputation
          </p>
          <p className="text-sm text-zinc-300">{data.companyReputation}</p>
        </div>
      )}
      {data.sources.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <span className="text-xs text-zinc-500">Sources:</span>
          {data.sources.map((s) => (
            <span
              key={s}
              className="rounded-md bg-white/[0.05] border border-white/[0.08] px-2 py-0.5 text-xs text-zinc-400"
            >
              {s}
            </span>
          ))}
        </div>
      )}
      {data.notes && (
        <p className="text-xs text-zinc-500 italic">{data.notes}</p>
      )}
    </div>
  );
}

function PersonalizationBlock({ data }: { data: BlockE }) {
  return (
    <div className="space-y-6">
      {data.cvChanges.length > 0 && (
        <div>
          <h4 className="mb-3 text-sm font-semibold text-zinc-300">
            CV Changes
          </h4>
          <div className="space-y-3">
            {data.cvChanges.map((c, i) => (
              <div
                key={i}
                className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-4 py-3 space-y-2"
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-cyan-400">
                    {c.section}
                  </span>
                </div>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  <div>
                    <p className="text-xs text-zinc-600 mb-0.5">Current</p>
                    <p className="text-xs text-zinc-400">{c.currentState}</p>
                  </div>
                  <div>
                    <p className="text-xs text-green-500/80 mb-0.5">Proposed</p>
                    <p className="text-xs text-zinc-300">{c.proposedChange}</p>
                  </div>
                </div>
                <p className="text-xs text-zinc-500 italic">{c.reason}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {data.linkedinChanges.length > 0 && (
        <div>
          <h4 className="mb-3 text-sm font-semibold text-zinc-300">
            LinkedIn Changes
          </h4>
          <div className="space-y-3">
            {data.linkedinChanges.map((c, i) => (
              <div
                key={i}
                className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-4 py-3 space-y-2"
              >
                <span className="text-sm font-medium text-purple-400">
                  {c.section}
                </span>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  <div>
                    <p className="text-xs text-zinc-600 mb-0.5">Current</p>
                    <p className="text-xs text-zinc-400">{c.currentState}</p>
                  </div>
                  <div>
                    <p className="text-xs text-green-500/80 mb-0.5">Proposed</p>
                    <p className="text-xs text-zinc-300">{c.proposedChange}</p>
                  </div>
                </div>
                <p className="text-xs text-zinc-500 italic">{c.reason}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function InterviewPlanBlock({ data }: { data: BlockF }) {
  return (
    <div className="space-y-6">
      {data.stories.length > 0 && (
        <div>
          <h4 className="mb-3 text-sm font-semibold text-zinc-300">
            STAR+R Stories
          </h4>
          <div className="space-y-4">
            {data.stories.map((s, i) => (
              <div
                key={i}
                className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-4 py-4 space-y-3"
              >
                <div>
                  <p className="text-sm font-medium text-white">{s.title}</p>
                  <p className="text-xs text-cyan-400/80">{s.jdRequirement}</p>
                </div>
                <div className="grid grid-cols-1 gap-2 text-xs sm:grid-cols-2">
                  {(
                    [
                      ["Situation", s.situation],
                      ["Task", s.task],
                      ["Action", s.action],
                      ["Result", s.result],
                      ["Reflection", s.reflection],
                    ] as const
                  ).map(([label, text]) => (
                    <div key={label}>
                      <p className="font-semibold text-zinc-500 uppercase tracking-wider mb-0.5">
                        {label}
                      </p>
                      <p className="text-zinc-300 leading-relaxed">{text}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {data.recommendedCaseStudy && (
        <div className="rounded-lg border border-purple-500/20 bg-purple-500/5 px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-purple-400 mb-1">
            Recommended Case Study
          </p>
          <p className="text-sm text-zinc-300">{data.recommendedCaseStudy}</p>
        </div>
      )}

      {data.redFlagQuestions.length > 0 && (
        <div>
          <h4 className="mb-3 text-sm font-semibold text-zinc-300">
            Red-Flag Questions
          </h4>
          <div className="space-y-3">
            {data.redFlagQuestions.map((q, i) => (
              <div
                key={i}
                className="rounded-lg border border-red-500/15 bg-red-500/5 px-4 py-3"
              >
                <p className="text-sm font-medium text-red-300 mb-1">
                  {q.question}
                </p>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  {q.suggestedAnswer}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Score badge
// ---------------------------------------------------------------------------

function ScoreBadge({ score }: { score: number }) {
  let colorClass = "text-red-400 border-red-500/30 bg-red-500/10";
  if (score >= 4) {
    colorClass = "text-green-400 border-green-500/30 bg-green-500/10";
  } else if (score >= 3) {
    colorClass = "text-amber-400 border-amber-500/30 bg-amber-500/10";
  }

  return (
    <div
      className={`inline-flex flex-col items-center justify-center rounded-xl border px-6 py-4 ${colorClass}`}
    >
      <span className="text-4xl font-bold tracking-tight">
        {score.toFixed(1)}
      </span>
      <span className="text-xs mt-1 opacity-70">/ 5.0</span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main page component
// ---------------------------------------------------------------------------

export default function EvaluatePage() {
  const [mode, setMode] = useState<"jd" | "url">("jd");
  const [jdText, setJdText] = useState("");
  const [urlInput, setUrlInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<EvaluationResult | null>(null);
  const [activeTab, setActiveTab] = useState<TabId>("summary");
  const [error, setError] = useState<string | null>(null);

  async function handleEvaluate() {
    setError(null);
    setLoading(true);

    try {
      const payload =
        mode === "url" ? { jd: urlInput, url: urlInput } : { jd: jdText };

      const res = await fetch("/api/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (data.error) {
        setError(data.error);
        setResult(null);
      } else {
        // Map API response to EvaluationResult shape
        setResult(data.evaluation ?? data);
        setActiveTab("summary");
      }
    } catch {
      // If the API is not connected yet, fall back to mock data
      setResult(getMockEvaluation());
      setActiveTab("summary");
    } finally {
      setLoading(false);
    }
  }

  function renderTabContent() {
    if (!result) return null;

    switch (activeTab) {
      case "summary":
        return <RoleSummaryBlock data={result.roleSummary} />;
      case "match":
        return <CVMatchBlock data={result.cvMatch} />;
      case "level":
        return <LevelStrategyBlock data={result.levelStrategy} />;
      case "comp":
        return <CompDemandBlock data={result.compDemand} />;
      case "personalization":
        return <PersonalizationBlock data={result.personalizationPlan} />;
      case "interview":
        return <InterviewPlanBlock data={result.interviewPlan} />;
      default:
        return null;
    }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white tracking-tight">
          Evaluate Offer
        </h2>
        <p className="mt-1 text-sm text-zinc-500">
          Paste a job description or URL to get a full AI-powered analysis
        </p>
      </div>

      {/* Input section */}
      <Card>
        <CardContent className="py-5 space-y-4">
          {/* Mode toggle */}
          <div className="flex gap-2">
            <button
              onClick={() => setMode("jd")}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                mode === "jd"
                  ? "bg-cyan-500/15 text-cyan-400 border border-cyan-500/30"
                  : "text-zinc-400 hover:text-zinc-200 border border-white/[0.06] hover:border-white/[0.12]"
              }`}
            >
              Paste Job Description
            </button>
            <button
              onClick={() => setMode("url")}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-all inline-flex items-center gap-2 ${
                mode === "url"
                  ? "bg-cyan-500/15 text-cyan-400 border border-cyan-500/30"
                  : "text-zinc-400 hover:text-zinc-200 border border-white/[0.06] hover:border-white/[0.12]"
              }`}
            >
              <LinkIcon size={14} />
              URL
            </button>
          </div>

          {/* Input fields */}
          {mode === "jd" ? (
            <Textarea
              placeholder="Paste the full job description here..."
              value={jdText}
              onChange={(e) => setJdText(e.target.value)}
              className="min-h-[200px]"
            />
          ) : (
            <Input
              placeholder="https://company.com/careers/job-posting"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
            />
          )}

          {/* Character count & evaluate button */}
          <div className="flex items-center justify-between">
            <p className="text-xs text-zinc-600">
              {mode === "jd" ? `${jdText.length} characters` : ""}
            </p>
            <div className="flex items-center gap-3">
              {error && <p className="text-sm text-red-400">{error}</p>}
              <Button
                onClick={handleEvaluate}
                loading={loading}
                disabled={mode === "jd" ? !jdText.trim() : !urlInput.trim()}
                size="lg"
              >
                {loading ? "Evaluating..." : "Evaluate"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {result && (
        <div className="space-y-6">
          {/* Score + archetype header */}
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-center gap-5">
              <ScoreBadge score={result.score} />
              <div>
                <p className="text-lg font-semibold text-white">
                  {result.archetype}
                </p>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {result.keywords.map((kw) => (
                    <span
                      key={kw}
                      className="rounded-full bg-cyan-500/10 border border-cyan-500/20 px-2.5 py-0.5 text-xs font-medium text-cyan-400"
                    >
                      {kw}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-2">
              <Button variant="secondary" size="sm">
                <Save size={14} />
                Save Report
              </Button>
              <Button variant="secondary" size="sm">
                <FileDown size={14} />
                Generate PDF
              </Button>
            </div>
          </div>

          {/* Tabs */}
          <Card>
            <CardHeader className="!py-0 !px-0">
              <div className="flex overflow-x-auto">
                {TABS.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 whitespace-nowrap px-5 py-3.5 text-sm font-medium transition-all border-b-2 ${
                      activeTab === tab.id
                        ? "border-cyan-400 text-cyan-400"
                        : "border-transparent text-zinc-500 hover:text-zinc-300"
                    }`}
                  >
                    {tab.icon}
                    {tab.label}
                  </button>
                ))}
              </div>
            </CardHeader>
            <CardContent className="py-5">{renderTabContent()}</CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
