import { NextRequest } from "next/server";

const mockApplications = [
  { id: "1", num: 47, date: "2026-04-07", company: "Anthropic", role: "Senior AI Engineer", score: 4.5, status: "Evaluated", hasPdf: true, notes: "Strong match" },
  { id: "2", num: 46, date: "2026-04-06", company: "OpenAI", role: "ML Platform Lead", score: 4.2, status: "Applied", hasPdf: true, notes: "Applied via referral" },
  { id: "3", num: 45, date: "2026-04-05", company: "Stripe", role: "Staff Engineer, ML", score: 3.9, status: "Interview", hasPdf: true, notes: "Phone screen scheduled" },
];

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const search = searchParams.get("search");

  let apps = [...mockApplications];

  if (status && status !== "All") {
    apps = apps.filter((a) => a.status === status);
  }

  if (search) {
    const q = search.toLowerCase();
    apps = apps.filter(
      (a) =>
        a.company.toLowerCase().includes(q) ||
        a.role.toLowerCase().includes(q)
    );
  }

  return Response.json({ applications: apps, total: apps.length });
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, status } = body as { id: string; status: string };

    if (!id || !status) {
      return Response.json(
        { error: "id and status are required" },
        { status: 400 }
      );
    }

    return Response.json({ success: true, id, status });
  } catch {
    return Response.json(
      { error: "Failed to update application" },
      { status: 500 }
    );
  }
}
