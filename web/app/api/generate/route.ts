import { checkBotId } from "botid/server";
import { NextResponse } from "next/server";
import { z } from "zod";

export const maxDuration = 180;

const requestSchema = z.object({
  projectName: z
    .string()
    .min(2)
    .max(50)
    .regex(/^[A-Za-z][A-Za-z0-9_-]+$/),
  description: z.string().min(10).max(800),
  frameworkId: z.string().min(1).max(30),
  features: z.array(z.string().min(1).max(120)).max(10),
  database: z.string().max(30),
  auth: z.string().max(30),
  packageManager: z.string().max(30),
  styling: z.string().max(30),
  testLevel: z.enum(["unit", "unit-integration"]),
  docker: z.boolean(),
  ci: z.boolean()
});

export async function POST(request: Request) {
  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (contentLength > 16_000) {
    return NextResponse.json({ error: "Project brief is too large." }, { status: 413 });
  }

  if (process.env.NODE_ENV === "production") {
    const verification = await checkBotId({
      advancedOptions: { checkLevel: "basic" }
    });
    if (verification.isBot) {
      return NextResponse.json(
        { error: "This request could not be verified." },
        { status: 403 }
      );
    }
  }

  const parsed = requestSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Review the project details and try again." },
      { status: 422 }
    );
  }

  const backendUrl = process.env.RENDER_API_URL ?? "http://127.0.0.1:8000";
  const internalToken = process.env.INTERNAL_API_TOKEN ?? "dev-token";

  try {
    const response = await fetch(`${backendUrl.replace(/\/$/, "")}/v1/generate`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-devforge-token": internalToken,
        "x-forwarded-for":
          request.headers.get("x-forwarded-for") ??
          request.headers.get("x-real-ip") ??
          "anonymous"
      },
      body: JSON.stringify(parsed.data),
      signal: AbortSignal.timeout(150_000),
      cache: "no-store"
    });

    const body = await response.json().catch(() => null);
    if (!response.ok) {
      const detail =
        typeof body?.detail === "string"
          ? body.detail
          : "The generator could not create this project.";
      return NextResponse.json({ error: detail }, { status: response.status });
    }
    return NextResponse.json(body, {
      headers: { "cache-control": "no-store" }
    });
  } catch {
    return NextResponse.json(
      {
        error:
          "The generator is waking up or temporarily unavailable. Wait a moment and try again."
      },
      { status: 503 }
    );
  }
}
