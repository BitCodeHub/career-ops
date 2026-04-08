import { type NextRequest } from "next/server";

// ---------------------------------------------------------------------------
// POST /api/upload
// Accepts multipart form data with a resume file
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return Response.json(
        { success: false, error: "No file provided" },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = [
      "text/plain",
      "text/markdown",
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    const allowedExtensions = [".txt", ".md", ".pdf", ".docx"];
    const ext = file.name.slice(file.name.lastIndexOf(".")).toLowerCase();

    if (
      !allowedTypes.includes(file.type) &&
      !allowedExtensions.includes(ext)
    ) {
      return Response.json(
        {
          success: false,
          error:
            "Unsupported file type. Supported formats: PDF, Markdown, TXT, DOCX",
        },
        { status: 400 }
      );
    }

    // Read file content
    let textContent: string;

    if (file.type === "application/pdf" || ext === ".pdf") {
      // PDF text extraction placeholder
      // In production, use a library like pdf-parse or pdfjs-dist
      textContent = `[PDF content from ${file.name} - text extraction pending]`;
    } else {
      textContent = await file.text();
    }

    if (!textContent.trim()) {
      return Response.json(
        { success: false, error: "File is empty" },
        { status: 400 }
      );
    }

    // ---------------------------------------------------------------------------
    // Attempt AI-powered resume parsing if API key is configured
    // ---------------------------------------------------------------------------
    const apiKey = process.env.ANTHROPIC_API_KEY;

    if (apiKey) {
      try {
        const { parseResume } = await import("@/lib/ai");
        const parsed = await parseResume(textContent);
        return Response.json({
          success: true,
          filename: file.name,
          size: file.size,
          parsed,
          rawContent: textContent.slice(0, 500),
        });
      } catch (err) {
        console.error("AI resume parsing failed, returning raw:", err);
      }
    }

    // ---------------------------------------------------------------------------
    // Fallback: return raw content with basic structure detection
    // ---------------------------------------------------------------------------
    const lines = textContent.split("\n").filter((l) => l.trim());
    const potentialName = lines[0]?.trim() || "Unknown";
    const emailMatch = textContent.match(
      /[\w.+-]+@[\w-]+\.[\w.]+/
    );
    const phoneMatch = textContent.match(
      /(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/
    );

    return Response.json({
      success: true,
      filename: file.name,
      size: file.size,
      parsed: {
        full_name: potentialName,
        email: emailMatch?.[0] || null,
        phone: phoneMatch?.[0] || null,
        location: null,
        headline: null,
        skills: [],
        experience: [],
        education: [],
        markdown: textContent,
      },
      rawContent: textContent.slice(0, 500),
    });
  } catch (err) {
    console.error("Upload route error:", err);
    return Response.json(
      { success: false, error: "Failed to process upload" },
      { status: 500 }
    );
  }
}
