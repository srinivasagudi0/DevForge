# DevForge

DevForge turns a short product brief into two useful artifacts:

- a deterministic, curated source-code starter you can download as a ZIP;
- an architecture blueprint generated with OpenAI Structured Outputs, with a
  complete local fallback when the API is unavailable.

The public application is split between a Next.js frontend on Vercel and a
private-token FastAPI generation service on Render.

## Supported stacks

Flask, React/Vite, Django, Node.js, Vue.js, Angular, FastAPI, Next.js, Svelte,
Express.js, Laravel, Spring Boot, Ruby on Rails, and ASP.NET Core.

## Repository layout

```text
contracts/   Shared framework capability catalog
api/         FastAPI service and deterministic generators
web/         Next.js application, Vercel proxy, and download workspace
render.yaml  Render Blueprint configuration
vercel.json  Vercel monorepo configuration
```

## Local development

Requirements: Node.js 22+, npm 11+, and Python 3.12+.

```bash
# Backend
python3 -m venv .venv
.venv/bin/pip install -r api/requirements-dev.txt
PYTHONPATH=api .venv/bin/uvicorn devforge.main:app --reload --port 8000

# Frontend, in another terminal
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Local development uses the
shared token `dev-token`. Copy the environment examples before changing those
defaults.

An OpenAI key is optional locally. Without one, DevForge returns the complete
starter and a deterministic blueprint. With `OPENAI_API_KEY` configured, it
uses the Responses API and defaults to `gpt-5.6-terra`.

## Test and build

```bash
PYTHONPATH=api .venv/bin/pytest api/tests
npm test
npm run lint
npm run build
npm run test:e2e
```

Backend tests cover every framework generator and enforce path, file-count,
per-file, and total payload limits. Frontend tests cover the wizard, proxy
contract, fallback states, and downloads.

## Deployment

### Render API

Create a Render Blueprint from this repository and select `render.yaml`.
Render generates the internal and safety secrets. Add `OPENAI_API_KEY` manually.
Copy the generated `INTERNAL_API_TOKEN` for Vercel.

Required Render environment:

```text
APP_ENV=production
OPENAI_API_KEY=...
OPENAI_MODEL=gpt-5.6-terra
INTERNAL_API_TOKEN=...
SAFETY_HASH_SECRET=...
```

### Vercel web

Import the repository with the root directory unchanged. `vercel.json` builds
the `web` workspace.

Required Vercel environment:

```text
RENDER_API_URL=https://your-service.onrender.com
INTERNAL_API_TOKEN=<the same value configured on Render>
```

BotID Basic is wired into `POST /api/generate`. In the Vercel Firewall, add a
rate-limit rule for that path: three POST requests per IP every ten minutes.

After both deployments are live, verify:

```bash
curl https://your-vercel-domain/api/health
curl https://your-render-domain/health
```

Generation is intentionally browser-only in production because BotID blocks
unverified automated callers.

## Security model

- The OpenAI key and Render token never reach the browser.
- Render rejects generation calls without the internal token.
- DevForge never executes generated source.
- Paths must be unique, relative POSIX paths without traversal.
- Output is capped at 100 files, 100 KB per file, and 1.5 MB total.
- User briefs and model responses are not persisted; OpenAI requests use
  `store: false`.

## License

MIT
