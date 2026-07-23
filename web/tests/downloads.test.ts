import { describe, expect, it } from "vitest";
import { blueprintMarkdown } from "@/lib/downloads";
import type { GenerateResponse, ProjectBrief } from "@/lib/types";

describe("blueprint download", () => {
  it("includes every structured section and file", () => {
    const result = {
      blueprint: {
        summary: "Summary",
        architecture: ["Architecture item"],
        gettingStarted: ["Install dependencies"],
        decisions: ["Decision"],
        nextSteps: ["Next step"]
      },
      files: [],
      fileTree: ["README.md"],
      warnings: [],
      generation: {
        aiStatus: "fallback",
        model: "test",
        fileCount: 0,
        totalBytes: 0
      }
    } satisfies GenerateResponse;
    const brief = {
      projectName: "Orbit",
      description: "A sufficiently long description.",
      frameworkId: "nextjs",
      features: [],
      database: "none",
      auth: "none",
      packageManager: "npm",
      styling: "css",
      testLevel: "unit",
      docker: true,
      ci: true
    } satisfies ProjectBrief;
    const markdown = blueprintMarkdown(result, brief);
    expect(markdown).toContain("# Orbit blueprint");
    expect(markdown).toContain("## Architecture");
    expect(markdown).toContain("`README.md`");
  });
});
