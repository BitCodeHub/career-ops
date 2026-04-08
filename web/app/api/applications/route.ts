import { type NextRequest } from "next/server";
import { ApplicationStatus } from "@/lib/types";

// ---------------------------------------------------------------------------
// Mock data (used until the database layer is connected)
// ---------------------------------------------------------------------------

const VALID_STATUSES: ApplicationStatus[] = [
  ApplicationStatus.Evaluated,
  ApplicationStatus.Applied,
  ApplicationStatus.Responded,
  ApplicationStatus.Interview,
  ApplicationStatus.Offer,
  ApplicationStatus.Rejected,
  ApplicationStatus.Discarded,
  ApplicationStatus.SKIP,
];

interface MockApplication {
  id: string;
  num: number;
  date: string;
  company: string;
  role: string;
  score: number;
  status: ApplicationStatus;
  hasPdf: boolean;
  reportId: string | null;
  notes: string;
  url: string | null;
}

const mockApplications: MockApplication[] = [
  { id: "1", num: 47, date: "2026-04-07", company: "Anthropic", role: "Head of Applied AI", score: 4.6, status: ApplicationStatus.Interview, hasPdf: true, reportId: "r-1", notes: "Strong match, 3rd round scheduled", url: null },
  { id: "2", num: 46, date: "2026-04-06", company: "Stripe", role: "Staff ML Engineer", score: 4.2, status: ApplicationStatus.Applied, hasPdf: true, reportId: "r-2", notes: "Applied via referral", url: null },
  { id: "3", num: 45, date: "2026-04-05", company: "OpenAI", role: "Research Engineer", score: 3.9, status: ApplicationStatus.Evaluated, hasPdf: true, reportId: "r-3", notes: "Good fit, need to tailor CV", url: null },
  { id: "4", num: 44, date: "2026-04-04", company: "Notion", role: "AI Product Manager", score: 3.5, status: ApplicationStatus.Responded, hasPdf: false, reportId: "r-4", notes: "Recruiter reached out", url: null },
  { id: "5", num: 43, date: "2026-04-03", company: "Vercel", role: "Senior Engineer, AI", score: 4.1, status: ApplicationStatus.Offer, hasPdf: true, reportId: "r-5", notes: "Offer received, evaluating", url: null },
  { id: "6", num: 42, date: "2026-04-02", company: "Datadog", role: "ML Platform Lead", score: 3.3, status: ApplicationStatus.Rejected, hasPdf: true, reportId: "r-6", notes: "Position filled internally", url: null },
  { id: "7", num: 41, date: "2026-04-01", company: "Figma", role: "ML Engineer", score: 2.8, status: ApplicationStatus.SKIP, hasPdf: false, reportId: "r-7", notes: "Too junior", url: null },
  { id: "8", num: 40, date: "2026-03-31", company: "Scale AI", role: "Director of Engineering", score: 4.4, status: ApplicationStatus.Interview, hasPdf: true, reportId: "r-8", notes: "Final round next week", url: null },
  { id: "9", num: 39, date: "2026-03-30", company: "Hugging Face", role: "Applied ML Scientist", score: 3.7, status: ApplicationStatus.Discarded, hasPdf: false, reportId: "r-9", notes: "Location mismatch", url: null },
  { id: "10", num: 38, date: "2026-03-28", company: "Cohere", role: "Head of Solutions", score: 4.0, status: ApplicationStatus.Applied, hasPdf: true, reportId: "r-10", notes: "Submitted last week", url: null },
];

// ---------------------------------------------------------------------------
// GET /api/applications
// Returns all applications with optional filters
// ---------------------------------------------------------------------------

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const status = searchParams.get("status");
  const minScoreParam = searchParams.get("minScore");
  const search = searchParams.get("search");

  let apps = [...mockApplications];

  // Filter by status
  if (status && status !== "All") {
    apps = apps.filter((a) => a.status === status);
  }

  // Filter by minimum score
  if (minScoreParam) {
    const minScore = parseFloat(minScoreParam);
    if (!isNaN(minScore)) {
      apps = apps.filter((a) => a.score >= minScore);
    }
  }

  // Filter by search query (company, role, notes)
  if (search) {
    const q = search.toLowerCase();
    apps = apps.filter(
      (a) =>
        a.company.toLowerCase().includes(q) ||
        a.role.toLowerCase().includes(q) ||
        a.notes.toLowerCase().includes(q)
    );
  }

  return Response.json({
    success: true,
    applications: apps,
    total: apps.length,
  });
}

// ---------------------------------------------------------------------------
// PUT /api/applications
// Updates application status
// ---------------------------------------------------------------------------

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, status, notes } = body as {
      id: string;
      status?: string;
      notes?: string;
    };

    if (!id) {
      return Response.json(
        { success: false, error: "Application id is required" },
        { status: 400 }
      );
    }

    if (status && !VALID_STATUSES.includes(status as ApplicationStatus)) {
      return Response.json(
        {
          success: false,
          error: `Invalid status. Must be one of: ${VALID_STATUSES.join(", ")}`,
        },
        { status: 400 }
      );
    }

    // In the future this will update the database
    // For now, return success with the updated fields
    return Response.json({
      success: true,
      id,
      ...(status && { status }),
      ...(notes !== undefined && { notes }),
    });
  } catch {
    return Response.json(
      { success: false, error: "Failed to update application" },
      { status: 500 }
    );
  }
}
