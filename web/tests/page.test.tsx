import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import Home from "@/app/page";

const response = {
  blueprint: {
    summary: "A focused starter for a product team.",
    architecture: ["Use Next.js", "Keep configuration external", "Test the health route"],
    gettingStarted: ["Extract the ZIP", "Install dependencies", "Run the app"],
    decisions: ["Use deterministic source", "Keep infrastructure replaceable"],
    nextSteps: ["Add the first domain model", "Deploy a preview"]
  },
  files: [
    { path: "README.md", content: "# Orbit\\n" },
    { path: "app/page.tsx", content: "export default function Page() {}\\n" }
  ],
  fileTree: ["README.md", "app/page.tsx"],
  warnings: ["OpenAI is not configured; a local blueprint was used."],
  generation: {
    aiStatus: "fallback",
    model: "gpt-5.6-terra",
    fileCount: 2,
    totalBytes: 52
  }
};

afterEach(() => {
  vi.restoreAllMocks();
});

function completeFoundation() {
  fireEvent.change(screen.getByPlaceholderText("orbit_dashboard"), {
    target: { value: "OrbitDashboard" }
  });
  fireEvent.change(screen.getByPlaceholderText("A collaborative dashboard for..."), {
    target: { value: "A collaborative dashboard for product engineering teams." }
  });
}

describe("DevForge wizard", () => {
  it("shows all curated frameworks and validates the foundation", () => {
    render(<Home />);
    expect(screen.getByText("Skip the setup.")).toBeInTheDocument();
    expect(screen.getAllByRole("button", { pressed: false }).length).toBeGreaterThan(10);
    const continueButton = screen.getByRole("button", { name: /continue/i });
    expect(continueButton).toBeDisabled();
    completeFoundation();
    expect(continueButton).toBeEnabled();
  });

  it("shows only compatible architecture choices", () => {
    render(<Home />);
    completeFoundation();
    fireEvent.click(screen.getByRole("button", { name: /react \/ vite/i }));
    fireEvent.click(screen.getByRole("button", { name: /continue/i }));
    const database = screen.getByLabelText("Database");
    expect(database).toHaveValue("none");
    expect(screen.queryByRole("option", { name: "PostgreSQL" })).not.toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Tailwind CSS" })).toBeInTheDocument();
  });

  it("generates and renders a complete results workspace", async () => {
    vi.spyOn(global, "fetch").mockResolvedValue(
      new Response(JSON.stringify(response), {
        status: 200,
        headers: { "content-type": "application/json" }
      })
    );
    render(<Home />);
    completeFoundation();
    fireEvent.click(screen.getByRole("button", { name: /continue/i }));
    fireEvent.change(screen.getByPlaceholderText("e.g. Role-based team workspaces"), {
      target: { value: "Team workspaces" }
    });
    fireEvent.click(screen.getByRole("button", { name: "Add" }));
    fireEvent.click(screen.getByRole("button", { name: /continue/i }));
    fireEvent.click(screen.getByRole("button", { name: /forge project/i }));
    await waitFor(() =>
      expect(
        screen.getByText("OrbitDashboard is ready to leave the forge.")
      ).toBeInTheDocument()
    );
    expect(screen.getByText(/OpenAI is not configured/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /download project zip/i })).toBeEnabled();
    fireEvent.click(screen.getByRole("tab", { name: /files/i }));
    expect(screen.getByText("README.md")).toBeInTheDocument();
  });

  it("surfaces generation errors without losing the wizard", async () => {
    vi.spyOn(global, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ error: "Generator is waking up." }), {
        status: 503,
        headers: { "content-type": "application/json" }
      })
    );
    render(<Home />);
    completeFoundation();
    fireEvent.click(screen.getByRole("button", { name: /continue/i }));
    fireEvent.click(screen.getByRole("button", { name: /continue/i }));
    fireEvent.click(screen.getByRole("button", { name: /forge project/i }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Generator is waking up.");
  });
});
