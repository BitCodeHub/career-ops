"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Plus,
  Play,
  ExternalLink,
  Loader2,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  Trash2,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface PipelineItem {
  id: string;
  url: string;
  company: string | null;
  title: string | null;
  status: "pending" | "processing" | "done" | "error";
  score?: number;
  addedAt: string;
}

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------

const initialItems: PipelineItem[] = [
  {
    id: "1",
    url: "https://jobs.ashbyhq.com/anthropic/senior-ai-engineer",
    company: "Anthropic",
    title: "Senior AI Engineer",
    status: "pending",
    addedAt: "2026-04-07",
  },
  {
    id: "2",
    url: "https://boards.greenhouse.io/openai/jobs/12345",
    company: "OpenAI",
    title: "ML Platform Lead",
    status: "pending",
    addedAt: "2026-04-07",
  },
  {
    id: "3",
    url: "https://jobs.lever.co/notion/ai-product-manager",
    company: "Notion",
    title: "AI Product Manager",
    status: "pending",
    addedAt: "2026-04-06",
  },
  {
    id: "4",
    url: "https://jobs.lever.co/stripe/staff-ml",
    company: "Stripe",
    title: "Staff Engineer, ML",
    status: "done",
    score: 3.9,
    addedAt: "2026-04-05",
  },
  {
    id: "5",
    url: "https://careers.datadog.com/ai-sa",
    company: "Datadog",
    title: "AI Solutions Architect",
    status: "done",
    score: 4.1,
    addedAt: "2026-04-04",
  },
  {
    id: "6",
    url: "https://jobs.lever.co/linear/ai-engineer",
    company: "Linear",
    title: "AI Engineer",
    status: "done",
    score: 4.3,
    addedAt: "2026-04-03",
  },
  {
    id: "7",
    url: "https://invalid-url.example.com/job",
    company: null,
    title: null,
    status: "error",
    addedAt: "2026-04-03",
  },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const statusConfig = {
  pending: {
    icon: <Clock size={16} className="text-zinc-400" />,
    label: "Pending",
    color: "text-zinc-400",
    bg: "bg-zinc-500/10 border-zinc-500/20",
  },
  processing: {
    icon: <Loader2 size={16} className="text-cyan-400 animate-spin" />,
    label: "Processing...",
    color: "text-cyan-400",
    bg: "bg-cyan-500/10 border-cyan-500/20",
  },
  done: {
    icon: <CheckCircle2 size={16} className="text-green-400" />,
    label: "Evaluated",
    color: "text-green-400",
    bg: "bg-green-500/10 border-green-500/20",
  },
  error: {
    icon: <XCircle size={16} className="text-red-400" />,
    label: "Failed",
    color: "text-red-400",
    bg: "bg-red-500/10 border-red-500/20",
  },
};

function scoreColor(score: number): string {
  if (score >= 4) return "text-green-400";
  if (score >= 3) return "text-amber-400";
  return "text-red-400";
}

// ---------------------------------------------------------------------------
// Page component
// ---------------------------------------------------------------------------

export default function PipelinePage() {
  const [items, setItems] = useState<PipelineItem[]>(initialItems);
  const [newUrl, setNewUrl] = useState("");
  const [processing, setProcessing] = useState(false);

  const pending = items.filter((i) => i.status === "pending");
  const completed = items.filter((i) => i.status === "done");
  const failed = items.filter((i) => i.status === "error");
  const inProgress = items.filter((i) => i.status === "processing");

  function addUrl() {
    if (!newUrl.trim()) return;
    const item: PipelineItem = {
      id: Date.now().toString(),
      url: newUrl.trim(),
      company: null,
      title: null,
      status: "pending",
      addedAt: new Date().toISOString().split("T")[0],
    };
    setItems([item, ...items]);
    setNewUrl("");
  }

  function removeItem(id: string) {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }

  function evaluateItem(id: string) {
    setItems((prev) =>
      prev.map((i) =>
        i.id === id ? { ...i, status: "processing" as const } : i
      )
    );
    // Simulate evaluation
    setTimeout(() => {
      setItems((prev) =>
        prev.map((i) =>
          i.id === id
            ? {
                ...i,
                status: "done" as const,
                score: Math.round((Math.random() * 2 + 3) * 10) / 10,
              }
            : i
        )
      );
    }, 2000);
  }

  function processAll() {
    setProcessing(true);
    // Set all pending to processing
    setItems((prev) =>
      prev.map((i) =>
        i.status === "pending" ? { ...i, status: "processing" as const } : i
      )
    );
    // Simulate batch processing
    setTimeout(() => {
      setItems((prev) =>
        prev.map((i) =>
          i.status === "processing"
            ? {
                ...i,
                status: "done" as const,
                score: Math.round((Math.random() * 2 + 3) * 10) / 10,
              }
            : i
        )
      );
      setProcessing(false);
    }, 3000);
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white tracking-tight">
          Pipeline
        </h2>
        <p className="mt-1 text-sm text-zinc-500">
          Add job URLs to evaluate later, or process them all at once
        </p>
      </div>

      {/* Add URL input */}
      <Card>
        <CardContent className="py-4">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600"
              />
              <input
                type="url"
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addUrl()}
                placeholder="Paste a job URL..."
                className="w-full pl-10 pr-4 py-2.5 bg-white/[0.03] border border-white/[0.06] rounded-lg text-sm text-white placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-cyan-500/30 focus:border-cyan-500/50 transition-all"
              />
            </div>
            <Button
              onClick={addUrl}
              disabled={!newUrl.trim()}
              variant="secondary"
              size="md"
            >
              <Plus size={16} />
              Add
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Card>
          <CardContent className="py-4 text-center">
            <p className="text-2xl font-bold text-amber-400">
              {pending.length}
            </p>
            <p className="text-xs text-zinc-500 mt-1">Pending</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4 text-center">
            <p className="text-2xl font-bold text-cyan-400">
              {inProgress.length}
            </p>
            <p className="text-xs text-zinc-500 mt-1">Processing</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4 text-center">
            <p className="text-2xl font-bold text-green-400">
              {completed.length}
            </p>
            <p className="text-xs text-zinc-500 mt-1">Evaluated</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4 text-center">
            <p className="text-2xl font-bold text-red-400">{failed.length}</p>
            <p className="text-xs text-zinc-500 mt-1">Failed</p>
          </CardContent>
        </Card>
      </div>

      {/* Process All button */}
      {pending.length > 0 && (
        <Button
          onClick={processAll}
          loading={processing}
          size="lg"
          className="w-full"
        >
          {processing ? (
            "Processing..."
          ) : (
            <>
              <Play size={16} />
              Evaluate All ({pending.length} pending)
            </>
          )}
        </Button>
      )}

      {/* Pending section */}
      {pending.length > 0 && (
        <div>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-zinc-500">
            Pending ({pending.length})
          </h3>
          <div className="space-y-2">
            {pending.map((item) => (
              <PipelineRow
                key={item.id}
                item={item}
                onEvaluate={() => evaluateItem(item.id)}
                onRemove={() => removeItem(item.id)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Processing section */}
      {inProgress.length > 0 && (
        <div>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-zinc-500">
            Processing ({inProgress.length})
          </h3>
          <div className="space-y-2">
            {inProgress.map((item) => (
              <PipelineRow key={item.id} item={item} />
            ))}
          </div>
        </div>
      )}

      {/* Completed section */}
      {completed.length > 0 && (
        <div>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-zinc-500">
            Evaluated ({completed.length})
          </h3>
          <div className="space-y-2">
            {completed.map((item) => (
              <PipelineRow key={item.id} item={item} />
            ))}
          </div>
        </div>
      )}

      {/* Error section */}
      {failed.length > 0 && (
        <div>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-zinc-500">
            Failed ({failed.length})
          </h3>
          <div className="space-y-2">
            {failed.map((item) => (
              <PipelineRow
                key={item.id}
                item={item}
                onRemove={() => removeItem(item.id)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {items.length === 0 && (
        <Card>
          <CardContent className="py-16 text-center">
            <Search size={32} className="mx-auto text-zinc-700 mb-3" />
            <p className="text-sm text-zinc-500">
              No URLs in the pipeline. Add one above to get started.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Pipeline row sub-component
// ---------------------------------------------------------------------------

function PipelineRow({
  item,
  onEvaluate,
  onRemove,
}: {
  item: PipelineItem;
  onEvaluate?: () => void;
  onRemove?: () => void;
}) {
  const config = statusConfig[item.status];

  return (
    <div
      className={`flex items-center gap-4 rounded-xl border bg-white/[0.02] px-4 py-3 transition-all hover:bg-white/[0.04] ${
        item.status === "done"
          ? "border-green-500/10"
          : item.status === "error"
            ? "border-red-500/10"
            : "border-white/[0.06]"
      }`}
    >
      {/* Status icon */}
      {config.icon}

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium text-white truncate">
            {item.company ?? "Unknown"}
          </p>
          {item.title && (
            <>
              <span className="text-zinc-600">-</span>
              <p className="text-sm text-zinc-400 truncate">{item.title}</p>
            </>
          )}
        </div>
        <p className="text-xs text-zinc-600 truncate mt-0.5">{item.url}</p>
      </div>

      {/* Right section */}
      <div className="flex items-center gap-3 flex-shrink-0">
        {/* Score if done */}
        {item.score !== undefined && (
          <span
            className={`text-sm font-semibold font-mono ${scoreColor(item.score)}`}
          >
            {item.score.toFixed(1)}/5
          </span>
        )}

        {/* Status label */}
        <span
          className={`rounded-md border px-2 py-0.5 text-xs font-medium ${config.bg} ${config.color}`}
        >
          {config.label}
        </span>

        {/* Evaluate button for pending items */}
        {item.status === "pending" && onEvaluate && (
          <Button
            onClick={onEvaluate}
            variant="ghost"
            size="sm"
            className="text-cyan-400 hover:text-cyan-300"
          >
            Evaluate
          </Button>
        )}

        {/* Remove button */}
        {onRemove && (
          <button
            onClick={onRemove}
            className="rounded-lg p-1.5 text-zinc-600 hover:text-red-400 hover:bg-red-500/10 transition-colors"
          >
            <Trash2 size={14} />
          </button>
        )}

        {/* External link */}
        <a
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-zinc-600 hover:text-zinc-400 transition-colors"
        >
          <ExternalLink size={14} />
        </a>
      </div>
    </div>
  );
}
