"use client";

import { useState, useCallback } from "react";
import { Save, Upload, Eye, EyeOff, CheckCircle2 } from "lucide-react";

export default function SettingsPage() {
  const [saved, setSaved] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [resumeFile, setResumeFile] = useState<File | null>(null);

  const [profile, setProfile] = useState({
    fullName: "",
    email: "",
    phone: "",
    location: "",
    linkedin: "",
    portfolioUrl: "",
    github: "",
    headline: "",
    exitStory: "",
    superpowers: "",
    targetRoles: "",
    compensationTarget: "",
    compensationMin: "",
    timezone: "",
    apiKey: "",
  });

  const updateField = (field: string, value: string) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
    setSaved(false);
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleResumeDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) setResumeFile(file);
  }, []);

  const handleResumeSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setResumeFile(file);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Settings</h1>
          <p className="text-zinc-400 mt-1">Configure your profile and preferences</p>
        </div>
        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-to-r from-cyan-600 to-cyan-500 text-white font-medium text-sm hover:from-cyan-500 hover:to-cyan-400 transition-all"
        >
          {saved ? <CheckCircle2 size={16} /> : <Save size={16} />}
          {saved ? "Saved" : "Save Changes"}
        </button>
      </div>

      {/* API Key */}
      <div className="glass-card p-6 space-y-4">
        <h2 className="text-lg font-semibold text-white">AI Configuration</h2>
        <p className="text-sm text-zinc-400">Connect your Anthropic API key to enable AI-powered evaluations.</p>
        <div className="relative">
          <input
            type={showApiKey ? "text" : "password"}
            value={profile.apiKey}
            onChange={(e) => updateField("apiKey", e.target.value)}
            placeholder="sk-ant-api03-..."
            className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-4 py-2.5 pr-10 text-sm text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-cyan-500/40 font-mono"
          />
          <button
            onClick={() => setShowApiKey(!showApiKey)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
          >
            {showApiKey ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
      </div>

      {/* Resume Upload */}
      <div className="glass-card p-6 space-y-4">
        <h2 className="text-lg font-semibold text-white">Resume</h2>
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleResumeDrop}
          className="border-2 border-dashed border-white/10 rounded-lg p-8 text-center hover:border-cyan-500/30 transition-colors cursor-pointer"
        >
          <Upload size={32} className="mx-auto text-zinc-600 mb-3" />
          <p className="text-sm text-zinc-400">
            {resumeFile ? (
              <span className="text-cyan-400">{resumeFile.name}</span>
            ) : (
              <>Drag and drop your resume here, or <label className="text-cyan-400 cursor-pointer hover:underline"><input type="file" accept=".pdf,.md,.txt,.docx" className="hidden" onChange={handleResumeSelect} />browse</label></>
            )}
          </p>
          <p className="text-xs text-zinc-600 mt-2">Supports PDF, Markdown, TXT, DOCX</p>
        </div>
      </div>

      {/* Profile */}
      <div className="glass-card p-6 space-y-5">
        <h2 className="text-lg font-semibold text-white">Profile</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {([
            ["fullName", "Full Name", "Jane Smith"],
            ["email", "Email", "jane@example.com"],
            ["phone", "Phone", "+1-555-0123"],
            ["location", "Location", "San Francisco, CA"],
            ["linkedin", "LinkedIn URL", "linkedin.com/in/janesmith"],
            ["portfolioUrl", "Portfolio URL", "https://janesmith.dev"],
            ["github", "GitHub", "github.com/janesmith"],
            ["timezone", "Timezone", "PST"],
          ] as [string, string, string][]).map(([field, label, placeholder]) => (
            <div key={field}>
              <label className="block text-xs font-medium text-zinc-400 mb-1.5">{label}</label>
              <input
                type="text"
                value={(profile as Record<string, string>)[field]}
                onChange={(e) => updateField(field, e.target.value)}
                placeholder={placeholder}
                className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-cyan-500/40"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Narrative */}
      <div className="glass-card p-6 space-y-5">
        <h2 className="text-lg font-semibold text-white">Narrative</h2>
        <div>
          <label className="block text-xs font-medium text-zinc-400 mb-1.5">Headline</label>
          <input
            type="text"
            value={profile.headline}
            onChange={(e) => updateField("headline", e.target.value)}
            placeholder="ML Engineer turned AI product builder"
            className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-cyan-500/40"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-zinc-400 mb-1.5">Exit Story</label>
          <textarea
            value={profile.exitStory}
            onChange={(e) => updateField("exitStory", e.target.value)}
            placeholder="What makes you unique? Your career narrative..."
            rows={3}
            className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-4 py-3 text-sm text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-cyan-500/40 resize-y"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-zinc-400 mb-1.5">Superpowers (comma-separated)</label>
          <input
            type="text"
            value={profile.superpowers}
            onChange={(e) => updateField("superpowers", e.target.value)}
            placeholder="End-to-end ML pipelines, Fast prototyping, Cross-functional communication"
            className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-cyan-500/40"
          />
        </div>
      </div>

      {/* Target Roles and Comp */}
      <div className="glass-card p-6 space-y-5">
        <h2 className="text-lg font-semibold text-white">Target Roles & Compensation</h2>
        <div>
          <label className="block text-xs font-medium text-zinc-400 mb-1.5">Target Roles (one per line)</label>
          <textarea
            value={profile.targetRoles}
            onChange={(e) => updateField("targetRoles", e.target.value)}
            placeholder={"Senior AI Engineer\nStaff ML Engineer\nAI Product Manager"}
            rows={3}
            className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-4 py-3 text-sm text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-cyan-500/40 resize-y"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1.5">Target Compensation</label>
            <input
              type="text"
              value={profile.compensationTarget}
              onChange={(e) => updateField("compensationTarget", e.target.value)}
              placeholder="$150K-200K"
              className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-cyan-500/40"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1.5">Walk-away Minimum</label>
            <input
              type="text"
              value={profile.compensationMin}
              onChange={(e) => updateField("compensationMin", e.target.value)}
              placeholder="$120K"
              className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-cyan-500/40"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
