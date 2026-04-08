"use client";

import { useState } from "react";
import { Search, Loader2, Save, FileDown, ChevronDown, ChevronUp } from "lucide-react";

interface EvalBlock {
  title: string;
  key: string;
  content: React.ReactNode;
}

export default function EvaluatePage() {
  const [jdInput, setJdInput] = useState("");
  const [loading, setLoading] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [result, setResult] = useState<Record<string, any> | null>(null);
  const [activeTab, setActiveTab] = useState("A");
  const [expandedBlocks, setExpandedBlocks] = useState<Set<string>>(new Set(["A"]));

  const toggleBlock = (key: string) => {
    setExpandedBlocks((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  async function handleEvaluate() {
    if (!jdInput.trim()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jd: jdInput }),
      });
      const data = await res.json();
      setResult(data);
      setExpandedBlocks(new Set(["A", "B"]));
    } catch (err) {
      console.error("Evaluation failed:", err);
    } finally {
      setLoading(false);
    }
  }

  function scoreColor(score: number) {
    if (score >= 4) return "text-green-400";
    if (score >= 3) return "text-amber-400";
    return "text-red-400";
  }

  function scoreBg(score: number) {
    if (score >= 4) return "bg-green-500/10 border-green-500/20";
    if (score >= 3) return "bg-amber-500/10 border-amber-500/20";
    return "bg-red-500/10 border-red-500/20";
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Evaluate Offer</h1>
        <p className="text-zinc-400 mt-1">Paste a job description or URL to get a full A-F evaluation</p>
      </div>

      {/* Input */}
      <div className="glass-card p-6 space-y-4">
        <textarea
          value={jdInput}
          onChange={(e) => setJdInput(e.target.value)}
          placeholder="Paste the job description text or URL here..."
          rows={10}
          className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-4 py-3 text-sm text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-500/40 resize-y font-mono"
        />
        <div className="flex items-center justify-between">
          <p className="text-xs text-zinc-600">{jdInput.length} characters</p>
          <button
            onClick={handleEvaluate}
            disabled={loading || !jdInput.trim()}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-to-r from-cyan-600 to-cyan-500 text-white font-medium text-sm hover:from-cyan-500 hover:to-cyan-400 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
            {loading ? "Evaluating..." : "Evaluate"}
          </button>
        </div>
      </div>

      {/* Results */}
      {result && (
        <div className="space-y-6">
          {/* Score Header */}
          <div className={`glass-card p-6 border ${scoreBg(Number(result.score) || 0)}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-zinc-400 mb-1">Overall Score</p>
                <p className={`text-4xl font-bold ${scoreColor(Number(result.score) || 0)}`}>
                  {String(result.score)}/5
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-zinc-400 mb-1">Archetype</p>
                <p className="text-lg font-semibold text-white">{String(result.archetype)}</p>
              </div>
            </div>
            {result.recommendation && (
              <p className="mt-4 text-sm text-zinc-300 border-t border-white/5 pt-4">
                {String(result.recommendation)}
              </p>
            )}
            <div className="flex gap-3 mt-4">
              <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/[0.05] border border-white/10 text-sm text-zinc-300 hover:bg-white/[0.08] transition-colors">
                <Save size={14} /> Save Report
              </button>
              <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/[0.05] border border-white/10 text-sm text-zinc-300 hover:bg-white/[0.08] transition-colors">
                <FileDown size={14} /> Generate PDF
              </button>
            </div>
          </div>

          {/* Evaluation Blocks */}
          {[
            { key: "A", title: "Role Summary", field: "roleSummary" },
            { key: "B", title: "CV Match", field: "cvMatch" },
            { key: "C", title: "Level & Strategy", field: "levelStrategy" },
            { key: "D", title: "Comp & Demand", field: "compDemand" },
            { key: "E", title: "Personalization Plan", field: "personalizationPlan" },
            { key: "F", title: "Interview Plan", field: "interviewPlan" },
          ].map((block) => (
            <div key={block.key} className="glass-card overflow-hidden">
              <button
                onClick={() => toggleBlock(block.key)}
                className="w-full flex items-center justify-between p-5 text-left hover:bg-white/[0.02] transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="flex items-center justify-center w-7 h-7 rounded-md bg-cyan-500/10 text-cyan-400 text-sm font-bold">
                    {block.key}
                  </span>
                  <h3 className="text-base font-semibold text-white">{block.title}</h3>
                </div>
                {expandedBlocks.has(block.key) ? (
                  <ChevronUp size={18} className="text-zinc-500" />
                ) : (
                  <ChevronDown size={18} className="text-zinc-500" />
                )}
              </button>
              {expandedBlocks.has(block.key) && (
                <div className="px-5 pb-5 border-t border-white/5">
                  <pre className="mt-4 text-sm text-zinc-300 whitespace-pre-wrap font-mono leading-relaxed">
                    {JSON.stringify(result[block.field], null, 2)}
                  </pre>
                </div>
              )}
            </div>
          ))}

          {/* Keywords */}
          {Array.isArray(result.keywords) && (
            <div className="glass-card p-5">
              <h3 className="text-base font-semibold text-white mb-3">Extracted Keywords</h3>
              <div className="flex flex-wrap gap-2">
                {(result.keywords as string[]).map((kw, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-xs font-medium"
                  >
                    {kw}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
