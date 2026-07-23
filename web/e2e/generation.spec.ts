import { expect, test } from "@playwright/test";

const generated = {
  blueprint: {
    summary: "A focused starter for a product team.",
    architecture: ["Use Next.js", "Externalize configuration", "Test the health route"],
    gettingStarted: ["Extract the ZIP", "Install dependencies", "Run the app"],
    decisions: ["Use deterministic source", "Keep infrastructure replaceable"],
    nextSteps: ["Add the first domain model", "Deploy a preview"]
  },
  files: [
    { path: "README.md", content: "# Orbit\\n" },
    { path: "app/page.tsx", content: "export default function Page() {}\\n" }
  ],
  fileTree: ["README.md", "app/page.tsx"],
  warnings: [],
  generation: {
    aiStatus: "generated",
    model: "gpt-5.6-terra",
    fileCount: 2,
    totalBytes: 52
  }
};

test("completes the project generation journey", async ({ page }) => {
  await page.route("**/api/generate", (route) =>
    route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(generated) })
  );
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /skip the setup/i })).toBeVisible();
  await page.getByPlaceholder("orbit_dashboard").fill("OrbitDashboard");
  await page.getByPlaceholder("A collaborative dashboard for...").fill(
    "A collaborative dashboard for product engineering teams."
  );
  await page.getByRole("button", { name: /continue/i }).click();
  await expect(page.getByRole("heading", { name: /shape the architecture/i })).toBeVisible();
  await page.getByPlaceholder("e.g. Role-based team workspaces").fill("Team workspaces");
  await page.getByRole("button", { name: "Add" }).click();
  await page.getByRole("button", { name: /continue/i }).click();
  await page.getByRole("button", { name: /forge project/i }).click();
  await expect(page.getByText("OrbitDashboard is ready to leave the forge.")).toBeVisible();
  await page.getByRole("tab", { name: /files/i }).click();
  await expect(page.getByText("app/page.tsx")).toBeVisible();
});
