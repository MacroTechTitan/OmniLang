# Matt / Macro Tech Titan AI — Claude Code Handoff

**Project:** Matt (formerly OmniLang) — AI-powered vibe coding platform
**Owner:** jgelet@macrotechtitan.com (admin) / jgelet@mttdevops.com (login)
**Date Generated:** May 5, 2026
**Status:** All build prompts staged on GitHub, ready for Claude Code to implement

---

## 1. The One-Sentence Pitch

Matt is a Replit-style AI coding platform with three core modes (Coding, Chat, Deploy), an Integrations hub of ~100 third-party services, a swipeable onboarding wizard, and a vibe-coding engine that turns plain-English prompts into deployable apps on Render, Vercel, or Cloudflare.

---

## 2. Where Everything Lives

### GitHub (single source of truth)
**Repo:** [https://github.com/MacroTechTitan/OmniLang](https://github.com/MacroTechTitan/OmniLang) (public)
**Default branch:** `main`

| File on GitHub | Size | Role |
|---|---:|---|
| `README.md` | 6 KB | Repo overview |
| `index.html` | 72 KB | Frontend prototype (3-column IDE shell) |
| `app.js` | 114 KB | Frontend prototype JS (transpiler, AI chat, deploy panel) |
| `MATT_EXPLAINER.md` | 4 KB | Brand/marketing copy for Matt |
| `REPLIT_SETUP.md` | 45 KB | **Build prompt #1** — base platform, 3 core modes, auth |
| `INTEGRATIONS_BUILD.md` | 112 KB | **Build prompt #2** — ~100 integrations + onboarding wizard |
| `VIBE_CODING_BUILD.md` | 64 KB | **Build prompt #3** — vibe engine + Render/Vercel/Cloudflare deploy |

### Live Preview
Static prototype was deployed at asset_id `59555a43-9dcd-4f9a-8868-27ea730e837d`.
- Admin login: `jgelet@macrotechtitan.com` / `admin123`
- Demo login: `demo@omnilang.dev` / `demo123`

### Perplexity Computer Workspace (mirror copies, not authoritative)
- `/home/user/workspace/omnilang-ide/index.html`
- `/home/user/workspace/omnilang-ide/app.js`
- `/home/user/workspace/matt-replit-prompt.md` → mirrors `REPLIT_SETUP.md`
- `/home/user/workspace/matt-integrations-prompt.md` → mirrors `INTEGRATIONS_BUILD.md`
- `/home/user/workspace/matt-vibe-coding-prompt.md` → mirrors `VIBE_CODING_BUILD.md`
- `/home/user/workspace/matt-explainer.md` → mirrors `MATT_EXPLAINER.md`
- `/home/user/workspace/replit-pull-and-build.md` → quick "clone + run prompts" instructions

---

## 3. Tech Stack (locked in)

| Layer | Choice |
|---|---|
| Runtime | Node.js v20 |
| Server | Express.js |
| Bundler/dev | Vite |
| Language | TypeScript (strict) |
| Frontend | React 18 + Tailwind CSS |
| ORM | Drizzle ORM |
| Database | PostgreSQL (Neon-backed) |
| Auth | Passport.js, session-based (express-session + connect-pg-simple) |
| Hosting | Replit (production), but the codebase must run anywhere Node + Postgres run |
| Editor | Monaco Editor (already in prototype) |

### Hard rules
- **No `localStorage`** in deployed static sandbox builds — use in-memory state only.
- **Admin panel** is gated to a single email: `jgelet@macrotechtitan.com`. No other account ever sees admin routes.
- **Encrypted credential vault** — every integration API key stored in the DB must be encrypted at rest (AES-256-GCM with a server-only `MASTER_KEY` env var).

---

## 4. The Three Build Prompts (read in order)

Each prompt is a self-contained spec that walks an AI agent through every file, schema, and test step. Order matters — later prompts depend on tables and modules from earlier ones.

### Prompt 1 — `REPLIT_SETUP.md` (45 KB, 15 steps)
**Purpose:** Stand up the base platform.
- Project scaffolding (Vite + Express + Drizzle)
- Postgres schema: `users`, `sessions`, `projects`, `files`, `chat_messages`, `deployments`
- Passport.js auth (signup/login/logout, bcrypt, session cookies)
- 3-column shell layout: left sidebar (220px) | Monaco + console (flex) | right panel (300px)
- Header tabs: **Coding | Chat | Deploy | Integrations**
- 3 core modes wired to top-tab switching with shared project context
- Admin gate: middleware that 403s if `req.user.email !== "jgelet@macrotechtitan.com"`
- Theme tokens: `#0d1117` bg, `#161b22` panels, `#21262d` borders, `#58a6ff` accent, `#d29922` admin amber
- Typography: Inter (UI), JetBrains Mono (code)

### Prompt 2 — `INTEGRATIONS_BUILD.md` (112 KB)
**Purpose:** Add the Integrations tab + onboarding.
- Full TypeScript registry of ~100 services across 12 categories (payments, comms, AI, storage, devops, CRM, analytics, email, calendar, social, video, misc)
- Each entry: `id`, `name`, `category`, `authType` (oauth | apikey | webhook), `scopes`, `setupSteps`, `sdkPackage`, `envVarNames`
- DB tables: `integrations`, `integration_credentials` (encrypted), `oauth_states`
- OAuth 2.0 flow handlers (state param, PKCE where supported, callback router)
- API-key flow (encrypted insert, masked read)
- `/integrations` page UI: category filter, search, "Connected" / "Available" sections, connect/disconnect buttons
- **Swipeable onboarding wizard:** Tinder-style cards on first login. Suggests integrations based on stated user role (founder, dev, marketer, ops). Swipe right = save to "interested", swipe left = dismiss permanently. Never re-suggests dismissed services.

### Prompt 3 — `VIBE_CODING_BUILD.md` (64 KB)
**Purpose:** Make Matt actually generate and deploy apps.
- **Vibe Engine:** `/api/vibe/generate` accepts `{prompt, projectId}`, calls an LLM with a structured system prompt, returns a file tree (paths + contents) plus a `manifest.json` (framework, runtime, deps, env vars).
- **Iterative refine:** `/api/vibe/refine` accepts `{projectId, instruction}` and patches existing files via diffs.
- **Service Wiring:** Before generation, the engine reads the user's connected integrations and injects matching SDK boilerplate + env-var stubs. Covers 15 hot integrations (Stripe, Supabase, Twilio, SendGrid, OpenAI, Anthropic, AWS S3, Firebase, GitHub, Slack, Discord, Notion, Airtable, Resend, Postmark).
- **Deployment Pipeline:**
  - **Render:** `POST https://api.render.com/v1/services` — creates a web service, links a Render-hosted git repo, optional Render Postgres add-on.
  - **Vercel:** `POST https://api.vercel.com/v13/deployments` — file-by-file upload, framework auto-detection, prod alias.
  - **Cloudflare Pages:** `POST https://api.cloudflare.com/client/v4/accounts/{id}/pages/projects/{name}/deployments` — direct upload of static build output.
- Each provider's API token is pulled from the encrypted credential vault built in Prompt 2.
- Deployment status polling + log streaming back to the Deploy tab.

---

## 5. Suggested Claude Code Workflow

```bash
# 1. Clone
gh repo clone MacroTechTitan/OmniLang matt
cd matt

# 2. Read the three prompts in order
code REPLIT_SETUP.md INTEGRATIONS_BUILD.md VIBE_CODING_BUILD.md

# 3. Scaffold per Prompt 1 (steps 1-15)
#    - This produces a working Express+Vite+Drizzle app with auth and the IDE shell

# 4. Layer Prompt 2 on top
#    - Migrate Drizzle schema to add integration tables
#    - Generate the registry, OAuth handlers, /integrations route
#    - Wire up the onboarding wizard

# 5. Layer Prompt 3
#    - Add /api/vibe/* routes
#    - Add Render/Vercel/Cloudflare adapters under server/deploy/*
#    - Wire the Deploy tab to live deployments

# 6. Set env vars
#    DATABASE_URL, SESSION_SECRET, MASTER_KEY (32-byte hex),
#    OPENAI_API_KEY (for vibe engine), plus per-integration secrets as users connect them
```

---

## 6. Environment Variables (master list)

| Var | Required | Purpose |
|---|---|---|
| `DATABASE_URL` | yes | Neon Postgres connection string |
| `SESSION_SECRET` | yes | express-session signing key |
| `MASTER_KEY` | yes | 32-byte hex; AES-256-GCM key for credential vault |
| `OPENAI_API_KEY` | yes | Vibe engine LLM (or swap for Anthropic) |
| `ANTHROPIC_API_KEY` | optional | Alternate LLM for vibe engine |
| `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET` | optional | GitHub OAuth integration |
| `RENDER_API_KEY` | optional | Stored per-user in vault, not env |
| `VERCEL_TOKEN` | optional | Stored per-user in vault, not env |
| `CLOUDFLARE_API_TOKEN` / `CLOUDFLARE_ACCOUNT_ID` | optional | Stored per-user in vault, not env |

Per-integration secrets (Stripe, Twilio, etc.) are user-supplied at runtime via the Integrations tab and live in the encrypted DB column — never in process env.

---

## 7. Database Schema Summary (cumulative across all 3 prompts)

```
users                       → id, email, password_hash, name, role, created_at
sessions                    → sid, sess (jsonb), expire
projects                    → id, user_id, name, framework, created_at
files                       → id, project_id, path, content, updated_at
chat_messages               → id, project_id, role, content, created_at
deployments                 → id, project_id, provider, status, url, logs, created_at
integrations                → id, slug, name, category, auth_type, config (jsonb)
integration_credentials     → id, user_id, integration_id, encrypted_payload, iv, tag, updated_at
oauth_states                → state, user_id, integration_id, code_verifier, expires_at
onboarding_choices          → id, user_id, integration_id, decision (interested|dismissed)
vibe_generations            → id, project_id, prompt, manifest (jsonb), tokens_used, created_at
```

---

## 8. Prototype Code (already in repo)

The static prototype (`index.html` + `app.js`) is a useful visual reference but should be **rebuilt as React components** during Prompt 1, not ported as-is. Use it for:
- Layout proportions (column widths, header height)
- Color tokens (verify against Prompt 1)
- The 4-tab header pattern
- Monaco editor setup options

Discard from the prototype:
- The in-browser fake transpiler (replace with the real vibe engine)
- localStorage-based state (replace with server sessions + Drizzle)
- The mocked deploy modal (replace with real provider API calls)

---

## 9. Quality Bar

Before shipping any milestone, Claude Code should verify:

- [ ] `npm run build` produces zero TypeScript errors
- [ ] `npm run dev` boots both Express (4000) and Vite (5173) cleanly
- [ ] Signup → login → logout cycle persists across server restart (sessions in Postgres)
- [ ] `/admin` returns 403 for any account other than `jgelet@macrotechtitan.com`
- [ ] An integration credential round-trips through the vault (encrypt on insert, decrypt on read, masked in API responses)
- [ ] The vibe engine successfully generates a "hello world Express app" from the prompt "build a simple API that returns the current time"
- [ ] At least one of Render / Vercel / Cloudflare deploys end-to-end with a real token
- [ ] Mobile breakpoint (375px) does not break the 3-column shell — collapses to a single column with a tab switcher

---

## 10. Open Questions for the User

1. Which LLM provider should the vibe engine default to — OpenAI `gpt-4o`, Anthropic `claude-sonnet-4`, or both with a runtime switch?
2. Should deployment history be retained per project (audit log) or only show the latest live URL?
3. Onboarding wizard role list — is "founder / dev / marketer / ops" the final taxonomy, or should it expand?
4. Should the integrations registry be seeded via a SQL migration or generated at runtime from the TypeScript registry?

---

## 11. Glossary of Past Sessions

1. Built initial OmniLang IDE (Monaco + transpiler + AI assistant + deploy panel) → deployed + pushed
2. Rebuilt with 3-column layout, 4 mode tabs
3. Added auth + admin panel locked to `jgelet@macrotechtitan.com`
4. Generated `REPLIT_SETUP.md` (full-stack conversion spec)
5. Rebranded OmniLang → Matt / Macro Tech Titan AI; wrote `MATT_EXPLAINER.md`; expanded setup prompt to 15 steps with Integrations page
6. Wrote `INTEGRATIONS_BUILD.md` (registry, OAuth, encrypted vault, onboarding wizard)
7. Wrote `replit-pull-and-build.md` quick-start
8. Wrote `VIBE_CODING_BUILD.md` (vibe engine + service wiring + Render/Vercel/Cloudflare deploy)
9. **This document** — full Claude Code handoff

---

## 12. The One-Liner for Claude Code

> Clone `MacroTechTitan/OmniLang`, read `REPLIT_SETUP.md` → `INTEGRATIONS_BUILD.md` → `VIBE_CODING_BUILD.md` in that order, and implement them as a single Node 20 / Express / Vite / React / Drizzle / Postgres app. Admin is `jgelet@macrotechtitan.com` only. Encrypt every third-party credential. Make the vibe engine actually deploy to Render, Vercel, or Cloudflare.
