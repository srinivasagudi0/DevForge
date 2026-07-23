import JSZip from "jszip";
import type { GenerateResponse, ProjectBrief } from "./types";

function saveBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

export async function downloadProject(result: GenerateResponse, name: string) {
  const zip = new JSZip();
  const root = zip.folder(name)!;
  result.files.forEach((item) => root.file(item.path, item.content));
  const blob = await zip.generateAsync({ type: "blob", compression: "DEFLATE" });
  saveBlob(blob, `${name}.zip`);
}

export function blueprintMarkdown(
  result: GenerateResponse,
  brief: ProjectBrief
): string {
  const section = (title: string, values: string[]) =>
    `## ${title}\n\n${values.map((value) => `- ${value}`).join("\n")}`;
  return [
    `# ${brief.projectName} blueprint`,
    result.blueprint.summary,
    section("Architecture", result.blueprint.architecture),
    section("Getting started", result.blueprint.gettingStarted),
    section("Decisions", result.blueprint.decisions),
    section("Next steps", result.blueprint.nextSteps),
    `## Files\n\n${result.fileTree.map((path) => `- \`${path}\``).join("\n")}`
  ].join("\n\n");
}

export function downloadBlueprint(
  result: GenerateResponse,
  brief: ProjectBrief
) {
  saveBlob(
    new Blob([blueprintMarkdown(result, brief)], { type: "text/markdown" }),
    `${brief.projectName}-blueprint.md`
  );
}
