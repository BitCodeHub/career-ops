"use client";

import { useState } from "react";
import { Plus, Play, ExternalLink, Loader2, CheckCircle2, XCircle, Clock } from "lucide-react";

interface PipelineItem {
  id: string;
  url: string;
  company: string;
  title: string;
  status: "pending" | "processing" | "done" | "error";
  score?: number;
  addedAt: string;
}

const mockItems: PipelineItem[] = [
  { id: "1", url: "https://jobs.ashbyhq.com/anthropic/senior-ai-engineer", company: "Anthropic", title: "Senior AI Engineer", status: "pending", addedAt: "2026-04-07" },
  { id: "2", url: "https://boards.greenhouse.io/openai/jobs/12345", company: "OpenAI", title: "ML Platform Lead", status: "pending", addedAt: "2026-04-07" },
  { id: "3", url: "https://jobs.lever.co/stripe/staff-ml", company: "Stripe", title: "Staff Engineer, ML", status: "done", score: 3.9, addedAt: "2026-04-05" },
  { id: "4", url: "https://careers.datadog.com/ai-sa", company: "Datadog", title: "AI Solutions Architect", status: "done", score: 4.1, addedAt: "2026-04-04" },
  { id: "5", url: "https://invalid-url.example.com/job", company: "Unknown", title: "Unknown Role", status: "error", addedAt: "2026-04-03" },
];

const statusIcons = {
  pending: <Clock size={16} className="text-zinc-400" />,
  processing: <Loader2 size={16} className="text-cyan-400 animate-spin" />,
  done: <CheckCircle2 size={16} className="text-green-400" />,
  error: <XCircle size={16} className="text-red-400" />,
};

const statusLabels = {
  pending: "Pending",
  processing: "Processing...",
  done: "Evaluated",
  error: "Failed",
};

export default function PipelinePage() {
  const [items, setItems] = useState<PipelineItem[]>(mockItems);
  const [newUrl, setNewUrl] = useState("");
  const [processing, setProcessing] = useState(false);

  const pending = items.filter((i) => i.status === "pending");
  const completed = items.filter((i) => i.status === "done");
  const failed = items.filter((i) => i.status === "error");

  function addUrl() {
    if (!newUrl.trim()) return;
    const item: PipelineItem = {
      id: Date.now().toString(),
      url: newUrl,
      company: "Detecting...",
      title: "Detecting...",
      status: "pending",
      addedAt: new Date().toISOString().split("T")[0],
    };
    setItems([item, ...items]);
    setNewUrl("");
  }

  function processAll() {
    setProcessing(true);
    // Mock processing
    setTimeout(() => setProcessing(false), 2000);
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Pipeline</h1>
        <p className="text-zinc-400 mt-1">Add job URLs to evaluate later, or process them all at once</p>
      </div>

      {/* Add URL */}
      <div className="glass-card p-5">
        <div className="flex gap-3">
          <input
            type="url"
            value={newUrl}
            onChange={(e) => setNewUrl(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addUrl()}
            placeholder="Paste a job URL..."
            className="flex-1 bg-white/[0.03] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-cyan-500/40"
          />
          <button
            onClick={addUrl}
            disabled={!newUrl.trim()}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-white/[0.05] border border-white/10 text-sm text-zinc-300 hover:bg-white/[0.08] disabled:opacity-40 transition-colors"
          >
            <Plus size={16} /> Add
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="glass-card p-4 text-center">
          <p className="text-2xl font-bold text-amber-400">{pending.length}</p>
          <p className="text-xs text-zinc-500 mt-1">Pending</p>
        </div>
        <div className="glass-card p-4 text-center">
          <p className="text-2xl font-bold text-green-400">{completed.length}</p>
          <p className="text-xs text-zinc-500 mt-1">Evaluated</p>
        </div>
        <div className="glass-card p-4 text-center">
          <p className="text-2xl font-bold text-red-400">{failed.length}</p>
          <p className="text-xs text-zinc-500 mt-1">Failed</p>
        </div>
      </div>

      {/* Process All Button */}
      {pending.length > 0 && (
        <button
          onClick={processAll}
          disabled={processing}
          className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-lg bg-gradient-to-r from-cyan-600 to-cyan-500 text-white font-medium text-sm hover:from-cyan-500 hover:to-cyan-400 disabled:opacity-40 transition-all"
        >
          {processing ? <Loader2 size={16} className="animate-spin" /> : <Play size={16} />}
          {processing ? "Processing..." : `Evaluate All (${pending.length} pending)`}
        </button>
      )}

      {/* URL List */}
      <div className="space-y-3">
        {items.map((item) => (
          <div
            key={item.id}
            className={`glass-card p-4 flex items-center gap-4 ${
              item.status === "done" ? "border-green-500/10" : item.status === "error" ? "border-red-500/10" : ""
            }`}
          >
            {statusIcons[item.status]}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium text-white truncate">{item.company}</p>
                <span className="text-zinc-600">-</span>
                <p className="text-sm text-zinc-400 truncate">{item.title}</p>
              </div>
              <p className="text-xs text-zinc-600 truncate mt-0.5">{item.url}</p>
            </div>
            <div className="flex items-center gap-3 flex-shrink-0">
              {item.score && (
                <span className={`text-sm font-semibold ${item.score >= 4 ? "text-green-400" : item.score >= 3 ? "text-amber-400" : "text-red-400"}`}>
                  {item.score}/5
                </span>
              )}
              <span className={`text-xs ${item.status === "error" ? "text-red-400" : "text-zinc-500"}`}>
                {statusLabels[item.status]}
              </span>
              <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-zinc-600 hover:text-zinc-400 transition-colors">
                <ExternalLink size={14} />
              </a>
            </div>
          </div>
        ))}

        {items.length === 0 && (
          <div className="glass-card p-12 text-center">
            <p className="text-zinc-500">No URLs in the pipeline. Add one above to get started.</p>
          </div>
        )}
      </div>
    </div>
  );
}
