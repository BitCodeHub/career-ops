import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return Response.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    const text = await file.text();

    if (!text.trim()) {
      return Response.json(
        { error: "File is empty" },
        { status: 400 }
      );
    }

    // Try AI parsing if available
    try {
      const { parseResume } = await import("@/lib/ai");
      const parsed = await parseResume(text);
      return Response.json({
        success: true,
        filename: file.name,
        size: file.size,
        parsed,
      });
    } catch {
      // Return raw text if AI not available
      return Response.json({
        success: true,
        filename: file.name,
        size: file.size,
        parsed: {
          name: "User",
          email: "",
          sections: { raw: text.slice(0, 2000) },
        },
      });
    }
  } catch {
    return Response.json(
      { error: "Failed to process upload" },
      { status: 500 }
    );
  }
}
