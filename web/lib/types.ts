/**
 * Career-Ops Type Definitions
 *
 * TypeScript types for all database models, API request/response shapes,
 * and the structured evaluation output (Blocks A–F).
 */

// ---------------------------------------------------------------------------
// Canonical application statuses (mirrors templates/states.yml)
// ---------------------------------------------------------------------------

export enum ApplicationStatus {
  Evaluated = "Evaluated",
  Applied = "Applied",
  Responded = "Responded",
  Interview = "Interview",
  Offer = "Offer",
  Rejected = "Rejected",
  Discarded = "Discarded",
  SKIP = "SKIP",
}

// ---------------------------------------------------------------------------
// Database models
// ---------------------------------------------------------------------------

export interface Profile {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  location: string | null;
  linkedin: string | null;
  portfolio_url: string | null;
  github: string | null;
  headline: string | null;
  exit_story: string | null;
  /** JSON-serialized string[] */
  target_roles: string;
  /** JSON-serialized string[] */
  superpowers: string;
  compensation_target: string | null;
  compensation_min: string | null;
  timezone: string | null;
  created_at: string;
  updated_at: string;
}

export interface Resume {
  id: string;
  profile_id: string;
  /** Full markdown content */
  content: string;
  filename: string | null;
  uploaded_at: string;
}

export interface Application {
  id: string;
  num: number;
  date: string;
  company: string;
  role: string;
  score: number | null;
  status: ApplicationStatus;
  has_pdf: number; // 0 | 1 (SQLite boolean)
  report_id: string | null;
  notes: string | null;
  url: string | null;
  archetype: string | null;
  created_at: string;
  updated_at: string;
}

export interface Report {
  id: string;
  application_id: string | null;
  num: number;
  company: string;
  role: string;
  date: string;
  archetype: string | null;
  score: number | null;
  url: string | null;
  /** Full markdown content of the evaluation report */
  content: string;
  /** Short one-line summary */
  summary: string | null;
  created_at: string;
}

export interface PipelineUrl {
  id: string;
  url: string;
  company: string | null;
  title: string | null;
  status: string; // "pending" | "processed" | "error" | "skipped"
  source: string | null;
  added_at: string;
  processed_at: string | null;
}

export interface ScanHistory {
  id: string;
  url: string;
  first_seen: string;
  portal: string | null;
  title: string | null;
  company: string | null;
  status: string | null;
}

export interface Story {
  id: string;
  title: string;
  source: string | null;
  theme: string | null;
  situation: string | null;
  task: string | null;
  action: string | null;
  result: string | null;
  reflection: string | null;
  /** JSON-serialized string[] or plain text */
  best_for: string | null;
  created_at: string;
}

// ---------------------------------------------------------------------------
// Parsed / hydrated helpers (JSON fields deserialized)
// ---------------------------------------------------------------------------

export interface ProfileParsed extends Omit<Profile, "target_roles" | "superpowers"> {
  target_roles: string[];
  superpowers: string[];
}

// ---------------------------------------------------------------------------
// Evaluation result types (Blocks A–F)
// ---------------------------------------------------------------------------

/** Block A — Role Summary */
export interface BlockA {
  archetype: string;
  secondaryArchetype?: string;
  domain: string;
  function: string;
  seniority: string;
  remote: string;
  teamSize?: string;
  tldr: string;
}

/** Block B — CV Match */
export interface BlockB {
  matches: Array<{
    jdRequirement: string;
    cvEvidence: string;
    strength: "strong" | "partial" | "weak";
  }>;
  gaps: Array<{
    requirement: string;
    severity: "hard_blocker" | "nice_to_have";
    adjacentExperience: string | null;
    mitigation: string;
  }>;
}

/** Block C — Level and Strategy */
export interface BlockC {
  detectedLevel: string;
  candidateLevel: string;
  sellSeniorPlan: string;
  downlevelPlan: string;
}

/** Block D — Comp and Demand */
export interface BlockD {
  salaryRange: string;
  companyReputation: string | null;
  demandTrend: string | null;
  sources: string[];
  notes: string | null;
}

/** Block E — Personalization Plan */
export interface BlockE {
  cvChanges: Array<{
    section: string;
    currentState: string;
    proposedChange: string;
    reason: string;
  }>;
  linkedinChanges: Array<{
    section: string;
    currentState: string;
    proposedChange: string;
    reason: string;
  }>;
}

/** Block F — Interview Plan */
export interface BlockF {
  stories: Array<{
    jdRequirement: string;
    title: string;
    situation: string;
    task: string;
    action: string;
    result: string;
    reflection: string;
  }>;
  recommendedCaseStudy: string | null;
  redFlagQuestions: Array<{
    question: string;
    suggestedAnswer: string;
  }>;
}

/** Complete structured evaluation */
export interface EvaluationResult {
  archetype: string;
  roleSummary: BlockA;
  cvMatch: BlockB;
  levelStrategy: BlockC;
  compDemand: BlockD;
  personalizationPlan: BlockE;
  interviewPlan: BlockF;
  score: number;
  keywords: string[];
  /** Full markdown report (all blocks rendered) */
  markdownReport: string;
}

// ---------------------------------------------------------------------------
// API request / response types
// ---------------------------------------------------------------------------

export interface EvaluateOfferRequest {
  /** Job description text or URL */
  jd: string;
  /** Markdown resume content */
  resume: string;
  /** Profile object with candidate context */
  profile: ProfileParsed;
}

export interface EvaluateOfferResponse {
  success: boolean;
  evaluation: EvaluationResult | null;
  error?: string;
}

export interface ParseResumeRequest {
  text: string;
}

export interface ParseResumeResponse {
  success: boolean;
  data: {
    full_name: string;
    email: string | null;
    phone: string | null;
    location: string | null;
    headline: string | null;
    skills: string[];
    experience: Array<{
      company: string;
      role: string;
      dates: string;
      bullets: string[];
    }>;
    education: Array<{
      institution: string;
      degree: string;
      dates: string;
    }>;
    markdown: string;
  } | null;
  error?: string;
}

export interface GenerateDraftAnswersRequest {
  jd: string;
  resume: string;
  company: string;
}

export interface GenerateDraftAnswersResponse {
  success: boolean;
  answers: Array<{
    question: string;
    answer: string;
  }> | null;
  coverLetter: string | null;
  error?: string;
}

export interface CompareOffersRequest {
  reports: Array<{
    id: string;
    company: string;
    role: string;
    score: number;
    archetype: string;
    summary: string;
    content: string;
  }>;
}

export interface CompareOffersResponse {
  success: boolean;
  comparison: {
    ranking: Array<{
      rank: number;
      reportId: string;
      company: string;
      role: string;
      score: number;
      proscons: { pros: string[]; cons: string[] };
    }>;
    recommendation: string;
    tradeoffs: string;
  } | null;
  error?: string;
}

// ---------------------------------------------------------------------------
// Generic API envelope
// ---------------------------------------------------------------------------

export interface ApiError {
  success: false;
  error: string;
}

export type ApiResponse<T> = (T & { success: true }) | ApiError;
