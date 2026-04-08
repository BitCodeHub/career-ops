/**
 * Career-Ops AI Integration Layer
 *
 * Claude API integration for offer evaluation, resume parsing,
 * draft answer generation, and multi-offer comparison.
 *
 * Uses @anthropic-ai/sdk with claude-sonnet-4-20250514.
 * Reads ANTHROPIC_API_KEY from process.env.
 */

import Anthropic from "@anthropic-ai/sdk";
import type {
  ProfileParsed,
  EvaluationResult,
  BlockA,
  BlockB,
  BlockC,
  BlockD,
  BlockE,
  BlockF,
  ParseResumeResponse,
  GenerateDraftAnswersResponse,
  CompareOffersResponse,
} from "./types";

// ---------------------------------------------------------------------------
// Client singleton
// ---------------------------------------------------------------------------

let _client: Anthropic | null = null;

function getClient(): Anthropic {
  if (_client) return _client;

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error(
      "ANTHROPIC_API_KEY is not set. Add it to your .env.local file."
    );
  }

  _client = new Anthropic({ apiKey });
  return _client;
}

const MODEL = "claude-sonnet-4-20250514";
const MAX_TOKENS = 8192;

// ---------------------------------------------------------------------------
// System prompts
// ---------------------------------------------------------------------------

const EVALUATION_SYSTEM_PROMPT = `You are an expert career advisor and job offer evaluator for a career-ops automation system.
You evaluate job offers against a candidate's CV and profile using a structured A-F block framework.

Your evaluation MUST be thorough, honest, and actionable. Never invent experience or metrics.
Always cite specific evidence from the candidate's CV when claiming matches.

Output format: You MUST return valid JSON matching the schema described in the user message.
Do not wrap the JSON in markdown code fences. Return raw JSON only.

Scoring (1-5 scale):
- 5: Perfect match — exact target role, strong CV evidence, great comp
- 4: Strong match — close to target, most requirements met
- 3: Decent match — adjacent role, some gaps but viable
- 2: Weak match — significant gaps, would need strong motivation
- 1: Poor match — wrong direction, recommend skipping

Be direct and actionable. No corporate-speak. Short sentences, action verbs.
When the JD is in a non-English language, generate content in that language but keep JSON keys in English.`;

const RESUME_PARSER_SYSTEM_PROMPT = `You are a resume parsing expert. Extract structured data from raw resume text.
Return valid JSON matching the schema described in the user message.
Do not wrap the JSON in markdown code fences. Return raw JSON only.
Be precise with dates, company names, and role titles. Do not infer or fabricate information.
If a field is not present in the resume, use null.`;

const DRAFT_ANSWERS_SYSTEM_PROMPT = `You are an expert application form assistant for a career-ops automation system.
Generate personalized, compelling answers for job application form questions.

Guidelines:
- Use the "I'm choosing you" tone — show genuine interest in THIS specific company
- Reference concrete proof points from the candidate's CV
- Keep answers concise but substantive (2-4 paragraphs for long-form, 1-2 sentences for short)
- Never use corporate-speak or generic filler
- Match the language of the job description
- Always generate a cover letter that maps JD requirements to specific CV evidence
- Include relevant portfolio/project links if the candidate has them

Output format: Return valid JSON matching the schema described in the user message.
Do not wrap the JSON in markdown code fences. Return raw JSON only.`;

const COMPARISON_SYSTEM_PROMPT = `You are a career strategist comparing multiple job offers for a candidate.
Use a weighted scoring matrix across 10 dimensions to produce an objective ranking.

Dimensions and weights:
- North Star Alignment (25%): How well does this match the candidate's target roles?
- CV Match (15%): Percentage of requirements covered by existing experience
- Level (15%): Seniority — staff+ is best, junior is worst
- Estimated Comp (10%): Market positioning of the compensation
- Growth Trajectory (10%): Clear path to next level vs dead end
- Remote Quality (5%): Full remote async is best, onsite-only is worst
- Company Reputation (5%): Employer brand, Glassdoor, known culture
- Tech Stack Modernity (5%): Cutting edge AI/ML vs legacy
- Time-to-Offer (5%): Fast process preferred
- Culture Signals (5%): Builder culture vs bureaucratic

Be direct in your recommendation. If one offer clearly dominates, say so.
If there are genuine trade-offs, articulate them clearly.

Output format: Return valid JSON matching the schema described in the user message.
Do not wrap the JSON in markdown code fences. Return raw JSON only.`;

// ---------------------------------------------------------------------------
// JSON extraction helper
// ---------------------------------------------------------------------------

/**
 * Extracts JSON from a Claude response, handling cases where the model
 * wraps JSON in markdown code fences despite instructions.
 */
function extractJson<T>(text: string): T {
  let cleaned = text.trim();

  // Strip markdown code fences if present
  const fenceMatch = cleaned.match(/^```(?:json)?\s*\n?([\s\S]*?)\n?\s*```$/);
  if (fenceMatch) {
    cleaned = fenceMatch[1].trim();
  }

  try {
    return JSON.parse(cleaned) as T;
  } catch (err) {
    throw new Error(
      `Failed to parse AI response as JSON: ${(err as Error).message}\n\nRaw response:\n${text.slice(0, 500)}`
    );
  }
}

// ---------------------------------------------------------------------------
// evaluateOffer
// ---------------------------------------------------------------------------

/**
 * Performs a full A-F evaluation of a job description against the candidate's
 * resume and profile. Returns a structured EvaluationResult.
 */
export async function evaluateOffer(
  jd: string,
  resume: string,
  profile: ProfileParsed
): Promise<EvaluationResult> {
  const client = getClient();

  const userPrompt = `Evaluate this job offer against my CV and profile. Return a JSON object with this exact structure:

{
  "archetype": "string — closest matching archetype from my target roles",
  "roleSummary": {
    "archetype": "string",
    "secondaryArchetype": "string or null",
    "domain": "string — platform/agentic/LLMOps/ML/enterprise/etc",
    "function": "string — build/consult/manage/deploy",
    "seniority": "string — junior/mid/senior/staff/principal/director",
    "remote": "string — full-remote/hybrid/onsite",
    "teamSize": "string or null",
    "tldr": "string — one sentence summary"
  },
  "cvMatch": {
    "matches": [
      {
        "jdRequirement": "string — requirement from the JD",
        "cvEvidence": "string — exact evidence from my CV",
        "strength": "strong | partial | weak"
      }
    ],
    "gaps": [
      {
        "requirement": "string",
        "severity": "hard_blocker | nice_to_have",
        "adjacentExperience": "string or null",
        "mitigation": "string — concrete plan to address this gap"
      }
    ]
  },
  "levelStrategy": {
    "detectedLevel": "string — level detected in the JD",
    "candidateLevel": "string — my natural level for this archetype",
    "sellSeniorPlan": "string — specific plan to position at the right level",
    "downlevelPlan": "string — plan if I get downleveled"
  },
  "compDemand": {
    "salaryRange": "string — estimated range for this role",
    "companyReputation": "string or null",
    "demandTrend": "string or null",
    "sources": ["string — where this data comes from"],
    "notes": "string or null"
  },
  "personalizationPlan": {
    "cvChanges": [
      {
        "section": "string",
        "currentState": "string",
        "proposedChange": "string",
        "reason": "string"
      }
    ],
    "linkedinChanges": [
      {
        "section": "string",
        "currentState": "string",
        "proposedChange": "string",
        "reason": "string"
      }
    ]
  },
  "interviewPlan": {
    "stories": [
      {
        "jdRequirement": "string",
        "title": "string — short story title",
        "situation": "string",
        "task": "string",
        "action": "string",
        "result": "string",
        "reflection": "string — what was learned"
      }
    ],
    "recommendedCaseStudy": "string or null",
    "redFlagQuestions": [
      {
        "question": "string",
        "suggestedAnswer": "string"
      }
    ]
  },
  "score": 0.0,
  "keywords": ["string — 15-20 JD keywords for ATS optimization"]
}

---

## My Profile

- **Name:** ${profile.full_name}
- **Target roles:** ${profile.target_roles.join(", ")}
- **Superpowers:** ${profile.superpowers.join(", ")}
- **Location:** ${profile.location ?? "Not specified"}
- **Compensation target:** ${profile.compensation_target ?? "Not specified"}
- **Exit story:** ${profile.exit_story ?? "Not provided"}
- **Headline:** ${profile.headline ?? "Not provided"}

---

## My CV

${resume}

---

## Job Description to Evaluate

${jd}`;

  const response = await client.messages.create({
    model: MODEL,
    max_tokens: MAX_TOKENS,
    system: EVALUATION_SYSTEM_PROMPT,
    messages: [{ role: "user", content: userPrompt }],
  });

  const content = response.content[0];
  if (content.type !== "text") {
    throw new Error("Unexpected response type from Claude API");
  }

  const parsed = extractJson<Omit<EvaluationResult, "markdownReport">>(content.text);

  // Generate the markdown report from the structured data
  const markdownReport = renderMarkdownReport(parsed);

  return {
    ...parsed,
    markdownReport,
  };
}

// ---------------------------------------------------------------------------
// parseResume
// ---------------------------------------------------------------------------

/**
 * Extracts structured data from raw resume text (pasted, uploaded, or OCR'd).
 */
export async function parseResume(
  text: string
): Promise<ParseResumeResponse["data"]> {
  const client = getClient();

  const userPrompt = `Parse this resume and return a JSON object with this exact structure:

{
  "full_name": "string",
  "email": "string or null",
  "phone": "string or null",
  "location": "string or null",
  "headline": "string or null — professional headline/title",
  "skills": ["string"],
  "experience": [
    {
      "company": "string",
      "role": "string",
      "dates": "string — as written in the resume",
      "bullets": ["string — each bullet point"]
    }
  ],
  "education": [
    {
      "institution": "string",
      "degree": "string",
      "dates": "string"
    }
  ],
  "markdown": "string — the resume reformatted as clean markdown with standard sections (Summary, Experience, Projects, Education, Skills)"
}

---

## Resume Text

${text}`;

  const response = await client.messages.create({
    model: MODEL,
    max_tokens: MAX_TOKENS,
    system: RESUME_PARSER_SYSTEM_PROMPT,
    messages: [{ role: "user", content: userPrompt }],
  });

  const content = response.content[0];
  if (content.type !== "text") {
    throw new Error("Unexpected response type from Claude API");
  }

  return extractJson<NonNullable<ParseResumeResponse["data"]>>(content.text);
}

// ---------------------------------------------------------------------------
// generateDraftAnswers
// ---------------------------------------------------------------------------

/**
 * Generates personalized answers for application form questions,
 * plus a cover letter, based on the JD, resume, and company context.
 */
export async function generateDraftAnswers(
  jd: string,
  resume: string,
  company: string
): Promise<{ answers: Array<{ question: string; answer: string }>; coverLetter: string }> {
  const client = getClient();

  const userPrompt = `Generate application form answers and a cover letter for this job at ${company}.

Return a JSON object with this exact structure:

{
  "answers": [
    {
      "question": "Why do you want to work at ${company}?",
      "answer": "string — personalized answer"
    },
    {
      "question": "What makes you a good fit for this role?",
      "answer": "string"
    },
    {
      "question": "Describe a relevant project or achievement",
      "answer": "string"
    },
    {
      "question": "What are your salary expectations?",
      "answer": "string"
    },
    {
      "question": "Is there anything else you'd like to share?",
      "answer": "string"
    }
  ],
  "coverLetter": "string — a compelling cover letter (max 1 page) that maps JD requirements to specific CV evidence. Include relevant project/portfolio links if available."
}

Generate answers for the common questions above, PLUS any role-specific questions you can infer from the JD.

---

## My CV

${resume}

---

## Job Description at ${company}

${jd}`;

  const response = await client.messages.create({
    model: MODEL,
    max_tokens: MAX_TOKENS,
    system: DRAFT_ANSWERS_SYSTEM_PROMPT,
    messages: [{ role: "user", content: userPrompt }],
  });

  const content = response.content[0];
  if (content.type !== "text") {
    throw new Error("Unexpected response type from Claude API");
  }

  return extractJson<{
    answers: Array<{ question: string; answer: string }>;
    coverLetter: string;
  }>(content.text);
}

// ---------------------------------------------------------------------------
// compareOffers
// ---------------------------------------------------------------------------

/**
 * Compares multiple evaluated offers using a weighted scoring matrix.
 * Expects report summaries with evaluation data.
 */
export async function compareOffers(
  reports: Array<{
    id: string;
    company: string;
    role: string;
    score: number;
    archetype: string;
    summary: string;
    content: string;
  }>
): Promise<NonNullable<CompareOffersResponse["comparison"]>> {
  const client = getClient();

  const reportsText = reports
    .map(
      (r, i) =>
        `### Offer ${i + 1}: ${r.company} — ${r.role}
**Archetype:** ${r.archetype}
**Initial Score:** ${r.score}/5
**Summary:** ${r.summary}

${r.content}`
    )
    .join("\n\n---\n\n");

  const userPrompt = `Compare these ${reports.length} job offers and return a JSON object with this exact structure:

{
  "ranking": [
    {
      "rank": 1,
      "reportId": "string — the report id",
      "company": "string",
      "role": "string",
      "score": 0.0,
      "proscons": {
        "pros": ["string"],
        "cons": ["string"]
      }
    }
  ],
  "recommendation": "string — clear recommendation with reasoning (2-3 paragraphs)",
  "tradeoffs": "string — key trade-offs between the top offers"
}

Score each offer across the 10 weighted dimensions (North Star Alignment 25%, CV Match 15%, Level 15%, Comp 10%, Growth 10%, Remote 5%, Reputation 5%, Tech Stack 5%, Time-to-Offer 5%, Culture 5%) and compute the weighted total.

The "ranking" array should be sorted by weighted total score (highest first).

Report IDs for reference: ${reports.map((r) => `${r.company}: ${r.id}`).join(", ")}

---

## Offers to Compare

${reportsText}`;

  const response = await client.messages.create({
    model: MODEL,
    max_tokens: MAX_TOKENS,
    system: COMPARISON_SYSTEM_PROMPT,
    messages: [{ role: "user", content: userPrompt }],
  });

  const content = response.content[0];
  if (content.type !== "text") {
    throw new Error("Unexpected response type from Claude API");
  }

  return extractJson<NonNullable<CompareOffersResponse["comparison"]>>(content.text);
}

// ---------------------------------------------------------------------------
// Markdown report renderer
// ---------------------------------------------------------------------------

/**
 * Renders the structured evaluation blocks into a markdown report
 * suitable for storage and display.
 */
function renderMarkdownReport(
  evaluation: Omit<EvaluationResult, "markdownReport">
): string {
  const { roleSummary, cvMatch, levelStrategy, compDemand, personalizationPlan, interviewPlan, score, keywords } = evaluation;

  const lines: string[] = [];

  // Block A — Role Summary
  lines.push("## A) Role Summary\n");
  lines.push(`| Field | Value |`);
  lines.push(`|-------|-------|`);
  lines.push(`| Archetype | ${roleSummary.archetype} |`);
  if (roleSummary.secondaryArchetype) {
    lines.push(`| Secondary | ${roleSummary.secondaryArchetype} |`);
  }
  lines.push(`| Domain | ${roleSummary.domain} |`);
  lines.push(`| Function | ${roleSummary.function} |`);
  lines.push(`| Seniority | ${roleSummary.seniority} |`);
  lines.push(`| Remote | ${roleSummary.remote} |`);
  if (roleSummary.teamSize) {
    lines.push(`| Team Size | ${roleSummary.teamSize} |`);
  }
  lines.push(`\n**TL;DR:** ${roleSummary.tldr}\n`);

  // Block B — CV Match
  lines.push("## B) CV Match\n");
  lines.push("### Matches\n");
  lines.push("| JD Requirement | CV Evidence | Strength |");
  lines.push("|----------------|-------------|----------|");
  for (const m of cvMatch.matches) {
    lines.push(`| ${m.jdRequirement} | ${m.cvEvidence} | ${m.strength} |`);
  }
  if (cvMatch.gaps.length > 0) {
    lines.push("\n### Gaps\n");
    lines.push("| Requirement | Severity | Adjacent Experience | Mitigation |");
    lines.push("|-------------|----------|---------------------|------------|");
    for (const g of cvMatch.gaps) {
      lines.push(
        `| ${g.requirement} | ${g.severity} | ${g.adjacentExperience ?? "—"} | ${g.mitigation} |`
      );
    }
  }
  lines.push("");

  // Block C — Level and Strategy
  lines.push("## C) Level and Strategy\n");
  lines.push(`- **Detected level:** ${levelStrategy.detectedLevel}`);
  lines.push(`- **Candidate level:** ${levelStrategy.candidateLevel}`);
  lines.push(`\n**Sell Senior Plan:** ${levelStrategy.sellSeniorPlan}`);
  lines.push(`\n**Downlevel Plan:** ${levelStrategy.downlevelPlan}\n`);

  // Block D — Comp and Demand
  lines.push("## D) Comp and Demand\n");
  lines.push(`- **Salary range:** ${compDemand.salaryRange}`);
  if (compDemand.companyReputation) {
    lines.push(`- **Company reputation:** ${compDemand.companyReputation}`);
  }
  if (compDemand.demandTrend) {
    lines.push(`- **Demand trend:** ${compDemand.demandTrend}`);
  }
  if (compDemand.sources.length > 0) {
    lines.push(`- **Sources:** ${compDemand.sources.join(", ")}`);
  }
  if (compDemand.notes) {
    lines.push(`- **Notes:** ${compDemand.notes}`);
  }
  lines.push("");

  // Block E — Personalization Plan
  lines.push("## E) Personalization Plan\n");
  if (personalizationPlan.cvChanges.length > 0) {
    lines.push("### CV Changes\n");
    lines.push("| # | Section | Current State | Proposed Change | Why |");
    lines.push("|---|---------|---------------|-----------------|-----|");
    personalizationPlan.cvChanges.forEach((c, i) => {
      lines.push(`| ${i + 1} | ${c.section} | ${c.currentState} | ${c.proposedChange} | ${c.reason} |`);
    });
  }
  if (personalizationPlan.linkedinChanges.length > 0) {
    lines.push("\n### LinkedIn Changes\n");
    lines.push("| # | Section | Current State | Proposed Change | Why |");
    lines.push("|---|---------|---------------|-----------------|-----|");
    personalizationPlan.linkedinChanges.forEach((c, i) => {
      lines.push(`| ${i + 1} | ${c.section} | ${c.currentState} | ${c.proposedChange} | ${c.reason} |`);
    });
  }
  lines.push("");

  // Block F — Interview Plan
  lines.push("## F) Interview Plan\n");
  if (interviewPlan.stories.length > 0) {
    lines.push("### STAR+R Stories\n");
    for (const s of interviewPlan.stories) {
      lines.push(`#### ${s.title}`);
      lines.push(`**JD Requirement:** ${s.jdRequirement}\n`);
      lines.push(`- **S:** ${s.situation}`);
      lines.push(`- **T:** ${s.task}`);
      lines.push(`- **A:** ${s.action}`);
      lines.push(`- **R:** ${s.result}`);
      lines.push(`- **Reflection:** ${s.reflection}\n`);
    }
  }
  if (interviewPlan.recommendedCaseStudy) {
    lines.push(
      `**Recommended Case Study:** ${interviewPlan.recommendedCaseStudy}\n`
    );
  }
  if (interviewPlan.redFlagQuestions.length > 0) {
    lines.push("### Red-Flag Questions\n");
    for (const q of interviewPlan.redFlagQuestions) {
      lines.push(`**Q:** ${q.question}`);
      lines.push(`**A:** ${q.suggestedAnswer}\n`);
    }
  }

  // Score and Keywords
  lines.push("---\n");
  lines.push(`**Overall Score:** ${score}/5\n`);
  lines.push("## Extracted Keywords\n");
  lines.push(keywords.map((k) => `\`${k}\``).join(", "));
  lines.push("");

  return lines.join("\n");
}
