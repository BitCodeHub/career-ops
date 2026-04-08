"use client";

import { useState, useCallback } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Save,
  Upload,
  Eye,
  EyeOff,
  CheckCircle2,
  User,
  Target,
  BookOpen,
  DollarSign,
  FileText,
  Key,
  Plus,
  X,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Page component
// ---------------------------------------------------------------------------

export default function SettingsPage() {
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [newRole, setNewRole] = useState("");

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
    targetRoles: [] as string[],
    compensationTarget: "",
    compensationMin: "",
    compensationCurrency: "USD",
    timezone: "",
    apiKey: "",
  });

  function updateField(field: string, value: string) {
    setProfile((prev) => ({ ...prev, [field]: value }));
    setSaved(false);
  }

  function addRole() {
    if (!newRole.trim()) return;
    setProfile((prev) => ({
      ...prev,
      targetRoles: [...prev.targetRoles, newRole.trim()],
    }));
    setNewRole("");
    setSaved(false);
  }

  function removeRole(index: number) {
    setProfile((prev) => ({
      ...prev,
      targetRoles: prev.targetRoles.filter((_, i) => i !== index),
    }));
    setSaved(false);
  }

  async function handleSave() {
    setSaving(true);
    // Simulate API call
    await new Promise((r) => setTimeout(r, 800));
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  const handleResumeDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) setResumeFile(file);
  }, []);

  function handleResumeSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) setResumeFile(file);
  }

  async function handleResumeUpload() {
    if (!resumeFile) return;
    const formData = new FormData();
    formData.append("file", resumeFile);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        // Would populate parsed resume data
        console.log("Resume parsed:", data);
      }
    } catch {
      console.error("Upload failed");
    }
  }

  // Field definitions for the profile section
  const profileFields: [string, string, string][] = [
    ["fullName", "Full Name", "Jane Smith"],
    ["email", "Email", "jane@example.com"],
    ["phone", "Phone", "+1-555-0123"],
    ["location", "Location", "San Francisco, CA"],
    ["linkedin", "LinkedIn", "linkedin.com/in/janesmith"],
    ["portfolioUrl", "Portfolio URL", "https://janesmith.dev"],
    ["github", "GitHub", "github.com/janesmith"],
    ["timezone", "Timezone", "America/Los_Angeles"],
  ];

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            Settings
          </h2>
          <p className="mt-1 text-sm text-zinc-500">
            Configure your profile and preferences
          </p>
        </div>
        <Button onClick={handleSave} loading={saving} size="lg">
          {saved ? (
            <>
              <CheckCircle2 size={16} />
              Saved
            </>
          ) : (
            <>
              <Save size={16} />
              Save Changes
            </>
          )}
        </Button>
      </div>

      {/* API Key configuration */}
      <Card variant="highlighted">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Key size={18} className="text-cyan-400" />
            <h3 className="text-base font-semibold text-white">
              AI Configuration
            </h3>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-zinc-400">
            Connect your Anthropic API key to enable AI-powered evaluations.
          </p>
          <div className="relative">
            <input
              type={showApiKey ? "text" : "password"}
              value={profile.apiKey}
              onChange={(e) => updateField("apiKey", e.target.value)}
              placeholder="sk-ant-api03-..."
              className="w-full bg-white/[0.03] border border-white/[0.06] rounded-lg px-4 py-2.5 pr-10 text-sm text-white placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-cyan-500/30 focus:border-cyan-500/50 font-mono transition-all"
            />
            <button
              onClick={() => setShowApiKey(!showApiKey)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              {showApiKey ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Resume upload */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <FileText size={18} className="text-purple-400" />
            <h3 className="text-base font-semibold text-white">Resume</h3>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleResumeDrop}
            className="border-2 border-dashed border-white/[0.08] rounded-lg p-8 text-center hover:border-cyan-500/30 transition-colors cursor-pointer"
          >
            <Upload size={32} className="mx-auto text-zinc-600 mb-3" />
            {resumeFile ? (
              <div>
                <p className="text-sm text-cyan-400 font-medium">
                  {resumeFile.name}
                </p>
                <p className="text-xs text-zinc-500 mt-1">
                  {(resumeFile.size / 1024).toFixed(1)} KB
                </p>
                <Button
                  onClick={handleResumeUpload}
                  variant="secondary"
                  size="sm"
                  className="mt-3"
                >
                  <Upload size={14} />
                  Upload & Parse
                </Button>
              </div>
            ) : (
              <div>
                <p className="text-sm text-zinc-400">
                  Drag and drop your resume here, or{" "}
                  <label className="text-cyan-400 cursor-pointer hover:underline">
                    <input
                      type="file"
                      accept=".pdf,.md,.txt,.docx"
                      className="hidden"
                      onChange={handleResumeSelect}
                    />
                    browse
                  </label>
                </p>
                <p className="text-xs text-zinc-600 mt-2">
                  Supports PDF, Markdown, TXT, DOCX
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Profile information */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <User size={18} className="text-blue-400" />
            <h3 className="text-base font-semibold text-white">Profile</h3>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {profileFields.map(([field, label, placeholder]) => (
              <Input
                key={field}
                label={label}
                value={(profile as unknown as Record<string, string>)[field] || ""}
                onChange={(e) => updateField(field, e.target.value)}
                placeholder={placeholder}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Target roles */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Target size={18} className="text-amber-400" />
            <h3 className="text-base font-semibold text-white">
              Target Roles
            </h3>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Current roles */}
          <div className="flex flex-wrap gap-2">
            {profile.targetRoles.length === 0 && (
              <p className="text-sm text-zinc-600">
                No target roles added yet.
              </p>
            )}
            {profile.targetRoles.map((role, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 text-sm text-amber-300"
              >
                {role}
                <button
                  onClick={() => removeRole(i)}
                  className="text-amber-400/60 hover:text-amber-300 transition-colors"
                >
                  <X size={14} />
                </button>
              </span>
            ))}
          </div>

          {/* Add new role */}
          <div className="flex gap-2">
            <input
              type="text"
              value={newRole}
              onChange={(e) => setNewRole(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addRole()}
              placeholder="Add a target role (e.g., Senior ML Engineer)"
              className="flex-1 bg-white/[0.03] border border-white/[0.06] rounded-lg px-4 py-2 text-sm text-white placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-cyan-500/30 focus:border-cyan-500/50 transition-all"
            />
            <Button onClick={addRole} disabled={!newRole.trim()} variant="secondary" size="md">
              <Plus size={16} />
              Add
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Narrative */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <BookOpen size={18} className="text-green-400" />
            <h3 className="text-base font-semibold text-white">Narrative</h3>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-zinc-300">
              Headline
            </label>
            <input
              type="text"
              value={profile.headline}
              onChange={(e) => updateField("headline", e.target.value)}
              placeholder="ML Engineer turned AI product builder"
              className="w-full bg-white/[0.03] border border-white/[0.06] rounded-lg px-4 py-2.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-cyan-500/30 focus:border-cyan-500/50 transition-all"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-zinc-300">
              Exit Story
            </label>
            <textarea
              value={profile.exitStory}
              onChange={(e) => updateField("exitStory", e.target.value)}
              placeholder="Why are you looking? What drives you? Your career narrative..."
              rows={3}
              className="w-full bg-white/[0.03] border border-white/[0.06] rounded-lg px-4 py-3 text-sm text-white placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-cyan-500/30 focus:border-cyan-500/50 resize-y transition-all"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-zinc-300">
              Superpowers
            </label>
            <input
              type="text"
              value={profile.superpowers}
              onChange={(e) => updateField("superpowers", e.target.value)}
              placeholder="End-to-end ML pipelines, Fast prototyping, Cross-functional communication"
              className="w-full bg-white/[0.03] border border-white/[0.06] rounded-lg px-4 py-2.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-cyan-500/30 focus:border-cyan-500/50 transition-all"
            />
            <p className="text-xs text-zinc-600">Comma-separated list</p>
          </div>
        </CardContent>
      </Card>

      {/* Compensation */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <DollarSign size={18} className="text-cyan-400" />
            <h3 className="text-base font-semibold text-white">
              Compensation
            </h3>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-zinc-300">
                Target Range
              </label>
              <input
                type="text"
                value={profile.compensationTarget}
                onChange={(e) =>
                  updateField("compensationTarget", e.target.value)
                }
                placeholder="$150K-200K"
                className="w-full bg-white/[0.03] border border-white/[0.06] rounded-lg px-4 py-2.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-cyan-500/30 focus:border-cyan-500/50 transition-all"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-zinc-300">
                Walk-away Minimum
              </label>
              <input
                type="text"
                value={profile.compensationMin}
                onChange={(e) =>
                  updateField("compensationMin", e.target.value)
                }
                placeholder="$120K"
                className="w-full bg-white/[0.03] border border-white/[0.06] rounded-lg px-4 py-2.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-cyan-500/30 focus:border-cyan-500/50 transition-all"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-zinc-300">
                Currency
              </label>
              <select
                value={profile.compensationCurrency}
                onChange={(e) =>
                  updateField("compensationCurrency", e.target.value)
                }
                className="w-full bg-white/[0.03] border border-white/[0.06] rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-cyan-500/30 focus:border-cyan-500/50 transition-all"
              >
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="GBP">GBP</option>
                <option value="CAD">CAD</option>
                <option value="AUD">AUD</option>
                <option value="CHF">CHF</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
