"use client";

import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  ChevronRight,
  Clipboard,
  Code2,
  Download,
  FileArchive,
  FileCode2,
  FolderTree,
  GitFork,
  LoaderCircle,
  Rocket,
  Search,
  ShieldCheck,
  Sparkles,
  TerminalSquare,
  WandSparkles,
  X
} from "lucide-react";
import { FormEvent, useMemo, useState } from "react";
import { downloadBlueprint, downloadProject } from "@/lib/downloads";
import { frameworks, getFramework, label } from "@/lib/frameworks";
import type { GenerateResponse, ProjectBrief } from "@/lib/types";

const initialBrief: ProjectBrief = {
  projectName: "",
  description: "",
  frameworkId: "nextjs",
  features: [],
  database: "none",
  auth: "none",
  packageManager: "npm",
  styling: "css",
  testLevel: "unit",
  docker: true,
  ci: true
};

const stepNames = ["Foundation", "Architecture", "Launch"];

export default function Home() {
  const [step, setStep] = useState(1);
  const [brief, setBrief] = useState(initialBrief);
  const [featureDraft, setFeatureDraft] = useState("");
  const [result, setResult] = useState<GenerateResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [tab, setTab] = useState<"blueprint" | "files" | "setup">("blueprint");
  const [fileQuery, setFileQuery] = useState("");
  const [copied, setCopied] = useState(false);

  const selected = getFramework(brief.frameworkId);
  const visibleFiles = useMemo(
    () =>
      result?.files.filter((item) =>
        item.path.toLowerCase().includes(fileQuery.toLowerCase())
      ) ?? [],
    [fileQuery, result]
  );

  function selectFramework(id: string) {
    const framework = getFramework(id);
    setBrief((current) => ({
      ...current,
      frameworkId: id,
      database: framework.databases[0],
      auth: framework.auth[0],
      packageManager: framework.packageManagers[0],
      styling: framework.styling[0]
    }));
  }

  function addFeature() {
    const value = featureDraft.trim();
    if (!value || brief.features.length >= 10) return;
    setBrief((current) => ({
      ...current,
      features: [...current.features, value]
    }));
    setFeatureDraft("");
  }

  function canContinue() {
    if (step === 1) {
      return (
        /^[A-Za-z][A-Za-z0-9_-]{1,49}$/.test(brief.projectName) &&
        brief.description.trim().length >= 10
      );
    }
    return true;
  }

  async function generate(event?: FormEvent) {
    event?.preventDefault();
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(brief)
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || "Generation failed.");
      setResult(body);
      setTab("blueprint");
      document.getElementById("results")?.scrollIntoView({ behavior: "smooth" });
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : "Something unexpected happened."
      );
    } finally {
      setLoading(false);
    }
  }

  async function copyFile(content: string) {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  return (
    <main>
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />
      <nav className="nav shell" aria-label="Primary navigation">
        <a className="brand" href="#top" aria-label="DevForge home">
          <span className="brand-mark"><Code2 size={18} /></span>
          DevForge
        </a>
        <div className="nav-status">
          <span className="status-dot" />
          14 curated stacks
        </div>
        <a
          className="icon-link"
          href="https://github.com/srinivasagudi0/DevForge"
          target="_blank"
          rel="noreferrer"
          aria-label="View DevForge on GitHub"
        >
          <GitFork size={19} />
        </a>
      </nav>

      <section className="hero shell" id="top">
        <div className="eyebrow"><Sparkles size={15} /> Production-minded project generation</div>
        <h1>
          Skip the setup.
          <span>Build the idea.</span>
        </h1>
        <p>
          Choose your stack, shape the architecture, and leave with a curated
          starter plus a blueprint your team can actually use.
        </p>
        <div className="trust-row">
          <span><ShieldCheck size={16} /> Safe file generation</span>
          <span><FolderTree size={16} /> Real source trees</span>
          <span><FileArchive size={16} /> Instant ZIP export</span>
        </div>
      </section>

      <section className="builder shell" aria-label="Project generator">
        <div className="stepper" aria-label={`Step ${step} of 3`}>
          {stepNames.map((name, index) => {
            const value = index + 1;
            const state = value < step ? "done" : value === step ? "active" : "";
            return (
              <div className={`step ${state}`} key={name}>
                <span>{value < step ? <Check size={14} /> : value}</span>
                <div><small>Step {value}</small><strong>{name}</strong></div>
                {value < 3 && <i />}
              </div>
            );
          })}
        </div>

        <form onSubmit={generate}>
          <div className="panel">
            {step === 1 && (
              <div className="stage">
                <header className="stage-header">
                  <div className="stage-icon"><Rocket size={22} /></div>
                  <div>
                    <span className="kicker">Start with the intent</span>
                    <h2>Name the project. Pick its foundation.</h2>
                    <p>These basics anchor every generated file and recommendation.</p>
                  </div>
                </header>

                <div className="two-col">
                  <label>
                    <span>Project name <b>Required</b></span>
                    <input
                      value={brief.projectName}
                      maxLength={50}
                      onChange={(event) =>
                        setBrief({ ...brief, projectName: event.target.value })
                      }
                      placeholder="orbit_dashboard"
                      aria-describedby="name-hint"
                    />
                    <small id="name-hint">Letters, numbers, hyphens, and underscores.</small>
                  </label>
                  <label>
                    <span>What are you building? <b>Required</b></span>
                    <textarea
                      value={brief.description}
                      maxLength={800}
                      onChange={(event) =>
                        setBrief({ ...brief, description: event.target.value })
                      }
                      placeholder="A collaborative dashboard for..."
                    />
                    <small>{brief.description.length}/800 characters</small>
                  </label>
                </div>

                <fieldset>
                  <legend>Choose a framework</legend>
                  <div className="framework-grid">
                    {frameworks.map((framework) => (
                      <button
                        className={`framework-card ${
                          framework.id === brief.frameworkId ? "selected" : ""
                        }`}
                        type="button"
                        key={framework.id}
                        onClick={() => selectFramework(framework.id)}
                        aria-pressed={framework.id === brief.frameworkId}
                      >
                        <span className={`framework-icon icon-${framework.id}`}>
                          {framework.icon}
                        </span>
                        <span><strong>{framework.name}</strong><small>{framework.category}</small></span>
                        <i>{framework.id === brief.frameworkId && <Check size={13} />}</i>
                      </button>
                    ))}
                  </div>
                </fieldset>
              </div>
            )}

            {step === 2 && (
              <div className="stage">
                <header className="stage-header">
                  <div className="stage-icon"><TerminalSquare size={22} /></div>
                  <div>
                    <span className="kicker">Make the important choices</span>
                    <h2>Shape the architecture.</h2>
                    <p>Only compatible options for {selected.name} are shown.</p>
                  </div>
                </header>

                <div className="option-grid">
                  <SelectField
                    label="Package manager"
                    value={brief.packageManager}
                    options={selected.packageManagers}
                    onChange={(value) => setBrief({ ...brief, packageManager: value })}
                  />
                  <SelectField
                    label="Database"
                    value={brief.database}
                    options={selected.databases}
                    onChange={(value) => setBrief({ ...brief, database: value })}
                  />
                  <SelectField
                    label="Authentication"
                    value={brief.auth}
                    options={selected.auth}
                    onChange={(value) => setBrief({ ...brief, auth: value })}
                  />
                  <SelectField
                    label="Styling"
                    value={brief.styling}
                    options={selected.styling}
                    onChange={(value) => setBrief({ ...brief, styling: value })}
                  />
                </div>

                <div className="feature-box">
                  <label htmlFor="feature">Product features</label>
                  <p>Add up to ten outcomes the blueprint should account for.</p>
                  <div className="feature-input">
                    <input
                      id="feature"
                      value={featureDraft}
                      maxLength={120}
                      placeholder="e.g. Role-based team workspaces"
                      onChange={(event) => setFeatureDraft(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") {
                          event.preventDefault();
                          addFeature();
                        }
                      }}
                    />
                    <button type="button" onClick={addFeature}>Add</button>
                  </div>
                  <div className="chips">
                    {brief.features.map((feature, index) => (
                      <span key={`${feature}-${index}`}>
                        {feature}
                        <button
                          type="button"
                          aria-label={`Remove ${feature}`}
                          onClick={() =>
                            setBrief({
                              ...brief,
                              features: brief.features.filter((_, item) => item !== index)
                            })
                          }
                        ><X size={13} /></button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="stage">
                <header className="stage-header">
                  <div className="stage-icon"><WandSparkles size={22} /></div>
                  <div>
                    <span className="kicker">Set the quality baseline</span>
                    <h2>Prepare it to ship.</h2>
                    <p>DevForge will package these standards into the source tree.</p>
                  </div>
                </header>

                <div className="launch-grid">
                  <ChoiceCard
                    selected={brief.testLevel === "unit"}
                    title="Unit tests"
                    description="Fast smoke coverage for the starter."
                    onClick={() => setBrief({ ...brief, testLevel: "unit" })}
                  />
                  <ChoiceCard
                    selected={brief.testLevel === "unit-integration"}
                    title="Unit + integration"
                    description="Add a broader service-level testing baseline."
                    onClick={() =>
                      setBrief({ ...brief, testLevel: "unit-integration" })
                    }
                  />
                  <ToggleCard
                    enabled={brief.docker}
                    title="Docker-ready"
                    description="Include a container development baseline."
                    onClick={() => setBrief({ ...brief, docker: !brief.docker })}
                  />
                  <ToggleCard
                    enabled={brief.ci}
                    title="GitHub Actions"
                    description="Run the starter's tests on every push."
                    onClick={() => setBrief({ ...brief, ci: !brief.ci })}
                  />
                </div>

                <div className="review">
                  <div className="review-head">
                    <span>Build summary</span>
                    <button type="button" onClick={() => setStep(1)}>Edit foundation</button>
                  </div>
                  <div className="review-grid">
                    <ReviewItem label="Project" value={brief.projectName} />
                    <ReviewItem label="Framework" value={selected.name} />
                    <ReviewItem label="Data" value={label(brief.database)} />
                    <ReviewItem label="Auth" value={label(brief.auth)} />
                    <ReviewItem label="Features" value={`${brief.features.length} specified`} />
                    <ReviewItem label="Delivery" value={`${brief.docker ? "Docker" : "Native"} + ${brief.ci ? "CI" : "manual CI"}`} />
                  </div>
                </div>

                <div className="cold-note">
                  <LoaderCircle size={17} />
                  <div>
                    <strong>First build of the day may take a minute.</strong>
                    <span>The free generator wakes from sleep before creating your project.</span>
                  </div>
                </div>
              </div>
            )}

            {error && <div className="error" role="alert">{error}</div>}

            <footer className="panel-footer">
              {step > 1 ? (
                <button className="button ghost" type="button" onClick={() => setStep(step - 1)}>
                  <ArrowLeft size={16} /> Back
                </button>
              ) : <span />}
              {step < 3 ? (
                <button
                  className="button primary"
                  type="button"
                  disabled={!canContinue()}
                  onClick={() => setStep(step + 1)}
                >
                  Continue <ArrowRight size={16} />
                </button>
              ) : (
                <button className="button generate" type="submit" disabled={loading}>
                  {loading ? <LoaderCircle className="spin" size={18} /> : <Sparkles size={18} />}
                  {loading ? "Forging your starter…" : "Forge project"}
                </button>
              )}
            </footer>
          </div>
        </form>
      </section>

      {result && (
        <section className="results shell" id="results">
          <div className="result-title">
            <div><CheckCircle2 size={24} /><span>Build complete</span></div>
            <h2>{brief.projectName} is ready to leave the forge.</h2>
            <p>{result.generation.fileCount} files · {(result.generation.totalBytes / 1024).toFixed(1)} KB · {selected.name}</p>
          </div>

          {result.warnings.map((warning) => (
            <div className="warning" key={warning}>
              <Sparkles size={16} />
              <span>{warning}</span>
            </div>
          ))}

          <div className="result-actions">
            <button className="button generate" onClick={() => downloadProject(result, brief.projectName)}>
              <FileArchive size={18} /> Download project ZIP
            </button>
            <button className="button ghost" onClick={() => downloadBlueprint(result, brief)}>
              <Download size={18} /> Download blueprint
            </button>
            <button className="button ghost" onClick={() => { setResult(null); setStep(1); window.scrollTo({top: 0, behavior: "smooth"}); }}>
              Start another
            </button>
          </div>

          <div className="workspace">
            <div className="tabs" role="tablist">
              <TabButton active={tab === "blueprint"} onClick={() => setTab("blueprint")}><Sparkles size={15} /> Blueprint</TabButton>
              <TabButton active={tab === "files"} onClick={() => setTab("files")}><FileCode2 size={15} /> Files</TabButton>
              <TabButton active={tab === "setup"} onClick={() => setTab("setup")}><TerminalSquare size={15} /> Setup</TabButton>
            </div>

            {tab === "blueprint" && (
              <div className="blueprint">
                <p className="blueprint-summary">{result.blueprint.summary}</p>
                <BlueprintList number title="Architecture" values={result.blueprint.architecture} />
                <BlueprintList title="Key decisions" values={result.blueprint.decisions} />
                <BlueprintList title="Next steps" values={result.blueprint.nextSteps} />
              </div>
            )}

            {tab === "files" && (
              <div className="files">
                <div className="file-search">
                  <Search size={15} />
                  <input value={fileQuery} onChange={(event) => setFileQuery(event.target.value)} placeholder="Filter generated files" />
                  <span>{visibleFiles.length} files</span>
                </div>
                <div className="file-list">
                  {visibleFiles.map((item) => (
                    <details key={item.path}>
                      <summary><FileCode2 size={15} /><span>{item.path}</span><ChevronRight size={15} /></summary>
                      <div className="code-wrap">
                        <button onClick={() => copyFile(item.content)} aria-label={`Copy ${item.path}`}>
                          {copied ? <Check size={14} /> : <Clipboard size={14} />} {copied ? "Copied" : "Copy"}
                        </button>
                        <pre><code>{item.content}</code></pre>
                      </div>
                    </details>
                  ))}
                </div>
              </div>
            )}

            {tab === "setup" && (
              <div className="setup">
                <h3>From ZIP to running app</h3>
                {result.blueprint.gettingStarted.map((item, index) => (
                  <div key={item}><span>{index + 1}</span><p>{item}</p></div>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      <footer className="site-footer shell">
        <span><Code2 size={16} /> DevForge</span>
        <p>Curated starters. Clear decisions. No generated-code execution.</p>
      </footer>
    </main>
  );
}

function SelectField({
  label: title,
  value,
  options,
  onChange
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <label className="select-field">
      <span>{title}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)}>
        {options.map((option) => <option value={option} key={option}>{label(option)}</option>)}
      </select>
    </label>
  );
}

function ChoiceCard({ selected, title, description, onClick }: { selected: boolean; title: string; description: string; onClick: () => void }) {
  return (
    <button type="button" className={`choice-card ${selected ? "selected" : ""}`} onClick={onClick} aria-pressed={selected}>
      <span className="radio">{selected && <i />}</span>
      <span><strong>{title}</strong><small>{description}</small></span>
    </button>
  );
}

function ToggleCard({ enabled, title, description, onClick }: { enabled: boolean; title: string; description: string; onClick: () => void }) {
  return (
    <button type="button" className={`choice-card ${enabled ? "selected" : ""}`} onClick={onClick} aria-pressed={enabled}>
      <span className={`toggle ${enabled ? "on" : ""}`}><i /></span>
      <span><strong>{title}</strong><small>{description}</small></span>
    </button>
  );
}

function ReviewItem({ label: title, value }: { label: string; value: string }) {
  return <div><span>{title}</span><strong>{value}</strong></div>;
}

function TabButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return <button role="tab" aria-selected={active} className={active ? "active" : ""} onClick={onClick}>{children}</button>;
}

function BlueprintList({ title, values, number = false }: { title: string; values: string[]; number?: boolean }) {
  return (
    <section>
      <h3>{title}</h3>
      <div className="blueprint-list">
        {values.map((value, index) => (
          <div key={value}>
            <span>{number ? index + 1 : <Check size={13} />}</span>
            <p>{value}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
