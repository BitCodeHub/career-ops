import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { jd } = body as { jd: string; url?: string };

    if (!jd || jd.trim().length === 0) {
      return Response.json(
        { error: "Job description is required" },
        { status: 400 }
      );
    }

    // Try to use AI evaluation if API key is configured
    try {
      const { evaluateOffer } = await import("@/lib/ai");
      const result = await evaluateOffer(jd, "", {} as Parameters<typeof evaluateOffer>[2]);
      return Response.json(result);
    } catch {
      // Return mock data if AI is not configured
      return Response.json(getMockResult());
    }
  } catch (err) {
    return Response.json(
      { error: "Failed to evaluate offer" },
      { status: 500 }
    );
  }
}

function getMockResult() {
  return {
    archetype: "AI Platform / LLMOps Engineer",
    score: 4.2,
    roleSummary: {
      domain: "AI/ML Platform",
      function: "Build",
      seniority: "Senior",
      remote: "Hybrid",
      teamSize: "8-12",
      tldr: "Senior AI engineer building production ML systems.",
    },
    cvMatch: {
      matches: [
        { requirement: "Production ML systems", cvLine: "Built ML pipelines serving 1M+ req/day", strength: "strong" },
        { requirement: "Python/TypeScript", cvLine: "5+ years Python, 3+ years TypeScript", strength: "strong" },
      ],
      matchPercent: 78,
      gaps: [
        { gap: "Kubernetes", severity: "nice-to-have", mitigation: "Docker experience transfers; can ramp quickly" },
      ],
    },
    levelStrategy: {
      detectedLevel: "Senior (L5)",
      candidateLevel: "Senior (L5)",
      sellPlan: "Lead with production ML systems experience.",
      downlevelPlan: "Negotiate 6-month review if offered L4.",
    },
    compDemand: {
      salaryRange: "$180K-$220K base + equity",
      marketPosition: "Above median",
      demandTrend: "High",
      sources: ["Levels.fyi", "Glassdoor"],
    },
    personalizationPlan: {
      cvChanges: ["Add LLM Evaluation to summary", "Reorder bullets by ML relevance"],
      linkedinChanges: ["Update headline", "Add featured ML post"],
    },
    interviewPlan: {
      stories: [
        {
          requirement: "Production ML",
          title: "Scaling ML Pipeline",
          situation: "ML pipeline hitting latency at 100K req/day",
          task: "10x throughput, maintain <100ms p99",
          action: "Redesigned with async processing and caching",
          result: "1.2M req/day, 45ms p99, 60% cost reduction",
          reflection: "Profiling first saved weeks of wasted optimization",
        },
      ],
    },
    keywords: ["machine learning", "LLMOps", "Python", "production systems", "observability"],
    recommendation: "Strong match (4.2/5). Apply with ML-focused CV.",
  };
}
