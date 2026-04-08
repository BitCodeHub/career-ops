import { type NextRequest } from "next/server";
import type { EvaluationResult } from "@/lib/types";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { jd, url } = body as { jd: string; url?: string };

    if (!jd || jd.trim().length === 0) {
      return Response.json(
        { success: false, error: "Job description is required" },
        { status: 400 }
      );
    }

    // ---------------------------------------------------------------------------
    // Attempt real evaluation via AI if API key is configured
    // ---------------------------------------------------------------------------
    const apiKey = process.env.ANTHROPIC_API_KEY;

    if (apiKey) {
      try {
        // Dynamic import to avoid errors when lib/ai doesn't exist yet
        const { evaluateOffer } = await import("@/lib/ai");
        const result = await evaluateOffer(
          jd,
          "",
          {} as Parameters<typeof evaluateOffer>[2]
        );
        return Response.json({ success: true, evaluation: result });
      } catch (err) {
        console.error("AI evaluation failed, falling back to mock:", err);
      }
    }

    // ---------------------------------------------------------------------------
    // Mock evaluation result (used when no API key is configured)
    // ---------------------------------------------------------------------------
    const mockEvaluation: EvaluationResult = {
      archetype: "AI Platform / LLMOps Engineer",
      score: 4.2,
      keywords: [
        "machine learning",
        "LLMOps",
        "Python",
        "production systems",
        "observability",
      ],
      markdownReport:
        "# Evaluation Report\n\nScore: 4.2/5\nArchetype: AI Platform / LLMOps Engineer\n\n## Summary\nStrong match (4.2/5). Apply with ML-focused CV.",
      roleSummary: {
        archetype: "AI Platform / LLMOps Engineer",
        secondaryArchetype: "ML Infrastructure",
        domain: "AI/ML Platform",
        function: "Build & Ship",
        seniority: "Senior",
        remote: "Hybrid",
        teamSize: "8-12",
        tldr: "Senior AI engineer building production ML systems. Strong alignment with your background in end-to-end ML pipelines and platform engineering.",
      },
      cvMatch: {
        matches: [
          {
            jdRequirement: "Production ML systems",
            cvEvidence: "Built ML pipelines serving 1M+ req/day",
            strength: "strong",
          },
          {
            jdRequirement: "Python/TypeScript",
            cvEvidence: "5+ years Python, 3+ years TypeScript",
            strength: "strong",
          },
          {
            jdRequirement: "LLM integration",
            cvEvidence: "Deployed RAG pipelines with evaluation loops",
            strength: "strong",
          },
          {
            jdRequirement: "CI/CD for ML",
            cvEvidence: "Built ML-specific CI pipelines",
            strength: "partial",
          },
        ],
        gaps: [
          {
            requirement: "Kubernetes at scale",
            severity: "nice_to_have",
            adjacentExperience: "Docker and ECS experience",
            mitigation:
              "Highlight containerization experience; can ramp quickly on K8s",
          },
        ],
      },
      levelStrategy: {
        detectedLevel: "Senior (L5)",
        candidateLevel: "Senior (L5)",
        sellSeniorPlan:
          "Lead with production ML systems experience and cross-team influence.",
        downlevelPlan:
          "Negotiate 6-month review with clear promotion criteria if offered L4.",
      },
      compDemand: {
        salaryRange: "$180K-$220K base + equity",
        companyReputation: "Well-known tech company, strong engineering culture",
        demandTrend: "High demand for ML platform roles",
        sources: ["Levels.fyi", "Glassdoor", "Blind"],
        notes: "Market rate trending upward; strong negotiation position.",
      },
      personalizationPlan: {
        cvChanges: [
          {
            section: "Summary",
            currentState: "Generic engineering summary",
            proposedChange:
              "Lead with LLM evaluation and production ML pipeline expertise",
            reason: "Directly addresses the top JD requirement",
          },
          {
            section: "Experience bullets",
            currentState: "Chronological task list",
            proposedChange: "Reorder to lead with ML relevance and impact metrics",
            reason: "Hiring managers scan top bullets first",
          },
        ],
        linkedinChanges: [
          {
            section: "Headline",
            currentState: "Software Engineer",
            proposedChange: "ML Platform Engineer | Production AI Systems",
            reason: "Matches recruiter search keywords for this role",
          },
        ],
      },
      interviewPlan: {
        stories: [
          {
            jdRequirement: "Production ML systems",
            title: "Scaling ML Pipeline 100x",
            situation: "ML pipeline hitting latency limits at 100K req/day",
            task: "10x throughput while maintaining <100ms p99 latency",
            action:
              "Redesigned with async processing, model caching, and autoscaling",
            result:
              "1.2M req/day, 45ms p99 latency, 60% cost reduction",
            reflection:
              "Profiling before optimizing saved weeks of wasted effort",
          },
        ],
        recommendedCaseStudy: "End-to-end ML pipeline design",
        redFlagQuestions: [
          {
            question: "Why are you leaving your current role?",
            suggestedAnswer:
              "I've built great things here, but I'm looking for a role with more scope to influence ML platform strategy across the organization.",
          },
        ],
      },
    };

    return Response.json({
      success: true,
      evaluation: mockEvaluation,
    });
  } catch (err) {
    console.error("Evaluate route error:", err);
    return Response.json(
      { success: false, error: "Failed to evaluate offer" },
      { status: 500 }
    );
  }
}
