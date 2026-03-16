# Matt — Macro Tech Titan AI: Replit Setup Prompt

## Overview

Convert the Matt (Macro Tech Titan AI) platform from a static HTML/JS prototype into a full-stack production application on Replit. Matt is a **Super Framework for Coding, Agents, and Deployment** — a meta framework that works with any API, any programming language, and any LLM. The platform centers on **3 core modes: Coding (Build), Chat (AI), and Deploy (Ship)**, plus a comprehensive integrations page for connecting external services.

Build on top of the existing codebase in the GitHub repo.

---

## Step 1: Pull from GitHub

```bash
git clone https://github.com/MacroTechTitan/OmniLang.git
cd OmniLang
```

The repo currently has:
- `index.html` — Full frontend (HTML + CSS, ~2,867 lines) with login, IDE, settings, and admin panel
- `app.js` — All JavaScript (~1,755 lines) with transpiler, auth, file system, AI assistant, deployment logic, and admin backend
- `README.md` — Project documentation

---

## Step 2: Rebrand from OmniLang to Matt

Throughout the entire codebase, rebrand:
- **Product name:** "OmniLang" → "Matt" (short name) or "Macro Tech Titan AI" (full name)
- **Tagline:** "The Super Framework for Coding, Agents, and Deployment"
- **Description:** "A Meta Framework that works with any API, any programming language, any LLM"
- **Logo text:** "Matt" with subtitle "by Macro Tech Titan"
- **AI assistant persona:** Rename from "OmniLang AI" to "Matt AI"
- **Page title:** "Matt — Macro Tech Titan AI"
- **File extension:** Keep `.ol` for OmniLang files, but the language can also be referred to as "Matt Script" or just the source language (Python, JS, etc.)

### Rebrand checklist:
- [ ] HTML `<title>` and meta tags
- [ ] Header logo and text
- [ ] Login/signup page headings and welcome text
- [ ] AI system prompts
- [ ] README and documentation
- [ ] Console welcome message
- [ ] Settings page references
- [ ] Admin panel branding
- [ ] Error messages and notifications

---

## Step 3: Convert to Full-Stack Architecture

Restructure the project into a proper full-stack app using the following tech stack:

### Technology Stack

| Layer | Technology |
|---|---|
| **Runtime** | Node.js v20 |
| **Framework** | Express.js + Vite |
| **Language** | TypeScript |
| **Frontend** | React 18 + Tailwind CSS |
| **ORM** | Drizzle ORM |
| **Primary DB** | PostgreSQL (Neon-backed) |
| **Auth** | Passport.js (session-based) with bcrypt password hashing |
| **Editor** | Monaco Editor (npm package) |
| **Hosting** | Replit |

### Target Project Structure

```
Matt/
├── .replit                     # Replit run configuration
├── replit.nix                  # Nix packages (Node 20, PostgreSQL client)
├── package.json
├── tsconfig.json
├── vite.config.ts
├── drizzle.config.ts
├── tailwind.config.ts
├── postcss.config.js
│
├── server/
│   ├── index.ts                # Express entry point (port 5000)
│   ├── routes.ts               # All API route definitions
│   ├── auth.ts                 # Passport.js setup, login/register/logout
│   ├── middleware.ts            # isAuthenticated, isAdmin guards
│   ├── storage.ts              # Database queries (Drizzle)
│   ├── db/
│   │   ├── schema.ts           # Drizzle schema definitions
│   │   ├── connection.ts       # Neon PostgreSQL connection
│   │   └── seed.ts             # Seed script for demo data
│   ├── services/
│   │   ├── transpiler.ts       # Multi-language transpiler (port from app.js)
│   │   ├── ai-assistant.ts     # AI integration (any LLM via OpenAI-compatible API)
│   │   ├── deployment.ts       # Deployment service (multi-platform)
│   │   ├── integrations.ts     # Integration registry and connection management
│   │   └── file-system.ts      # Per-user project file storage
│   └── types.ts                # Shared TypeScript types
│
├── client/
│   ├── src/
│   │   ├── main.tsx            # React entry point
│   │   ├── App.tsx             # Root with routing
│   │   ├── index.css           # Tailwind base + custom IDE styles
│   │   │
│   │   ├── components/
│   │   │   ├── Layout.tsx           # 3-column IDE layout shell
│   │   │   ├── Header.tsx           # Top bar with 3 mode tabs
│   │   │   ├── StatusBar.tsx        # Bottom status bar
│   │   │   ├── LeftPanel.tsx        # Left sidebar (content per mode)
│   │   │   ├── RightPanel.tsx       # Right sidebar (content per mode)
│   │   │   ├── EditorPanel.tsx      # Monaco editor wrapper
│   │   │   ├── ConsolePanel.tsx     # Bottom console with REPL
│   │   │   ├── FileExplorer.tsx     # File tree component
│   │   │   ├── AIChat.tsx           # AI chat panel (Chat mode)
│   │   │   ├── DeployPanel.tsx      # Deployment services
│   │   │   ├── IntegrationsPage.tsx # Full integrations marketplace
│   │   │   └── ResizeHandle.tsx     # Panel resize handles
│   │   │
│   │   ├── pages/
│   │   │   ├── LoginPage.tsx        # Login/Signup
│   │   │   ├── IDEPage.tsx          # Main IDE view (3 modes)
│   │   │   ├── IntegrationsPage.tsx # Integrations marketplace
│   │   │   ├── SettingsPage.tsx     # User settings
│   │   │   ├── admin/
│   │   │   │   ├── AdminLayout.tsx  # Admin shell with sidebar
│   │   │   │   ├── Dashboard.tsx    # KPIs, charts, activity feed
│   │   │   │   ├── Users.tsx        # User management table
│   │   │   │   ├── Projects.tsx     # All projects table
│   │   │   │   ├── Deployments.tsx  # Deployment logs
│   │   │   │   ├── Integrations.tsx # Integration usage analytics
│   │   │   │   ├── PlatformSettings.tsx  # Site config
│   │   │   │   ├── Billing.tsx      # Plan/revenue management
│   │   │   │   ├── FeatureFlags.tsx # Feature toggles
│   │   │   │   └── System.tsx       # Health, logs, backups
│   │   │
│   │   ├── hooks/
│   │   │   ├── useAuth.ts          # Auth context + session management
│   │   │   ├── useEditor.ts        # Monaco editor state
│   │   │   ├── useTranspiler.ts    # Transpiler hook
│   │   │   ├── useIntegrations.ts  # Integration connection state
│   │   │   └── useApi.ts           # API request helpers
│   │   │
│   │   ├── lib/
│   │   │   ├── transpiler.ts       # Client-side transpiler (real-time preview)
│   │   │   ├── matt-monarch.ts     # Monaco language definition for Matt Script
│   │   │   └── api-client.ts       # Typed fetch wrapper
│   │   │
│   │   └── types.ts                # Frontend type definitions
│   │
│   └── index.html              # Vite entry HTML
│
└── shared/
    └── types.ts                # Types shared between server and client
```

---

## Step 4: Database Schema (Drizzle ORM + Neon PostgreSQL)

Create the following tables using Drizzle ORM with `drizzle-orm/neon-http`:

```typescript
// server/db/schema.ts

import { pgTable, serial, text, varchar, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";

// ---- USERS ----
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  password: text("password").notNull(),          // bcrypt hashed
  role: varchar("role", { length: 20 }).notNull().default("user"),  // "user" | "admin"
  plan: varchar("plan", { length: 20 }).notNull().default("free"),  // "free" | "pro" | "team"
  bio: text("bio").default(""),
  avatarUrl: text("avatar_url"),
  settings: jsonb("settings").default({          // Editor + AI preferences
    fontSize: 14,
    tabSize: 2,
    theme: "dark",
    minimap: true,
    wordWrap: false,
    lineNumbers: true,
    autoSave: true,
    fontFamily: "JetBrains Mono",
    aiModel: "gpt-4o",
    apiKey: "",
    temperature: 0.7,
    maxTokens: 4096,
    aiAutocomplete: true
  }),
  githubConnected: boolean("github_connected").default(false),
  githubUsername: varchar("github_username", { length: 255 }),
  vercelConnected: boolean("vercel_connected").default(false),
  digitaloceanConnected: boolean("digitalocean_connected").default(false),
  renderConnected: boolean("render_connected").default(false),
  isActive: boolean("is_active").default(true),
  lastActiveAt: timestamp("last_active_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// ---- PROJECTS ----
export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  language: varchar("language", { length: 50 }).default("matt"),  // "matt" | "python" | "javascript" | "typescript" | "go" | "rust" etc.
  files: jsonb("files").default({}),             // Virtual filesystem: { "main.ol": "code...", "utils.ol": "..." }
  activeFile: varchar("active_file", { length: 255 }).default("main.ol"),
  template: varchar("template", { length: 50 }),  // "hello-world" | "todo-app" | "api-client" | "data-processing"
  isPublic: boolean("is_public").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ---- DEPLOYMENTS ----
export const deployments = pgTable("deployments", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").notNull().references(() => projects.id),
  userId: integer("user_id").notNull().references(() => users.id),
  platform: varchar("platform", { length: 50 }).notNull(),  // "digitalocean" | "vercel" | "netlify" | "aws" | "railway" | "render" | "flyio" | "github-pages"
  region: varchar("region", { length: 100 }),
  url: text("url"),
  status: varchar("status", { length: 20 }).notNull().default("pending"),  // "pending" | "building" | "live" | "failed"
  buildLog: text("build_log"),
  envVars: jsonb("env_vars").default({}),
  createdAt: timestamp("created_at").defaultNow(),
});

// ---- DATABASE CONNECTIONS ----
export const dbConnections = pgTable("db_connections", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  projectId: integer("project_id").references(() => projects.id),
  dbType: varchar("db_type", { length: 50 }).notNull(),  // "postgresql" | "mongodb" | "mysql" | "redis" | "sqlite" | "firebase" | "supabase" | "planetscale"
  connectionString: text("connection_string"),
  label: varchar("label", { length: 255 }),
  isConnected: boolean("is_connected").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// ---- AI CHAT HISTORY ----
export const aiChats = pgTable("ai_chats", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  projectId: integer("project_id").references(() => projects.id),
  role: varchar("role", { length: 20 }).notNull(),   // "user" | "assistant"
  content: text("content").notNull(),
  model: varchar("model", { length: 50 }),
  provider: varchar("provider", { length: 50 }),       // "openai" | "anthropic" | "google" | "meta" | "mistral" | "custom"
  tokensUsed: integer("tokens_used"),
  createdAt: timestamp("created_at").defaultNow(),
});

// ---- AI AGENTS ----
export const agents = pgTable("agents", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  type: varchar("type", { length: 50 }).notNull(),   // "code-review" | "testing" | "documentation" | "optimization" | "security" | "refactor" | "custom"
  config: jsonb("config").default({}),
  status: varchar("status", { length: 20 }).default("idle"),  // "idle" | "running" | "complete" | "error"
  lastRunAt: timestamp("last_run_at"),
  lastResult: text("last_result"),
  createdAt: timestamp("created_at").defaultNow(),
});

// ---- INTEGRATIONS (user connections to external services) ----
export const integrations = pgTable("integrations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  serviceId: varchar("service_id", { length: 100 }).notNull(),  // e.g. "github", "vercel", "render", "sendgrid"
  category: varchar("category", { length: 50 }).notNull(),       // "hosting" | "database" | "ai" | "email" | "analytics" | "storage" | "ci-cd" | "monitoring" | "communication" | "payment" | "auth"
  status: varchar("status", { length: 20 }).default("disconnected"),  // "connected" | "disconnected" | "error"
  config: jsonb("config").default({}),           // Service-specific config (tokens, project IDs, etc.)
  lastSyncAt: timestamp("last_sync_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// ---- PLATFORM SETTINGS (admin) ----
export const platformSettings = pgTable("platform_settings", {
  id: serial("id").primaryKey(),
  key: varchar("key", { length: 255 }).notNull().unique(),
  value: text("value"),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ---- FEATURE FLAGS (admin) ----
export const featureFlags = pgTable("feature_flags", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull().unique(),
  enabled: boolean("enabled").default(true),
  plans: jsonb("plans").default(["free", "pro", "team"]),  // Which plans have access
  description: text("description"),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ---- ACTIVITY LOG (admin) ----
export const activityLog = pgTable("activity_log", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  action: varchar("action", { length: 255 }).notNull(),
  details: text("details"),
  category: varchar("category", { length: 50 }),   // "deploy" | "project" | "user" | "admin" | "billing" | "system" | "integration"
  createdAt: timestamp("created_at").defaultNow(),
});

// ---- BILLING / TRANSACTIONS (admin) ----
export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  type: varchar("type", { length: 50 }).notNull(),  // "subscription" | "one-time" | "refund"
  amount: integer("amount").notNull(),                // cents
  plan: varchar("plan", { length: 20 }),
  status: varchar("status", { length: 20 }).default("completed"),
  stripePaymentId: varchar("stripe_payment_id", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow(),
});

// ---- SESSIONS (Passport.js) ----
export const sessions = pgTable("sessions", {
  sid: varchar("sid", { length: 255 }).primaryKey(),
  sess: jsonb("sess").notNull(),
  expire: timestamp("expire").notNull(),
});
```

---

## Step 5: Authentication (Passport.js)

### Setup

```typescript
// server/auth.ts

import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import bcrypt from "bcrypt";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";

// Local Strategy: authenticate with email + password
passport.use(new LocalStrategy(
  { usernameField: "email" },
  async (email, password, done) => {
    const user = await storage.getUserByEmail(email);
    if (!user) return done(null, false, { message: "No account found with that email" });
    if (!user.isActive) return done(null, false, { message: "Account is suspended" });
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return done(null, false, { message: "Incorrect password" });
    return done(null, user);
  }
));

// Session store: PostgreSQL (same Neon DB)
const PgStore = connectPgSimple(session);
app.use(session({
  store: new PgStore({ conString: process.env.DATABASE_URL }),
  secret: process.env.SESSION_SECRET || "matt-secret-change-me",
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 30 * 24 * 60 * 60 * 1000 }  // 30 days
}));
```

### Admin Guard

```typescript
// server/middleware.ts

export function isAuthenticated(req, res, next) {
  if (req.isAuthenticated()) return next();
  return res.status(401).json({ error: "Not authenticated" });
}

export function isAdmin(req, res, next) {
  if (req.isAuthenticated() && req.user.email === "jgelet@macrotechtitan.com") return next();
  return res.status(403).json({ error: "Admin access required" });
}
```

**CRITICAL: The admin panel and all /api/admin/* routes MUST only be accessible when the logged-in user's email is `jgelet@macrotechtitan.com`.** This is the sole admin account. No other users should ever see the Admin link, access admin routes, or reach admin pages.

---

## Step 6: API Routes

### Auth Routes
```
POST   /api/auth/register     — { name, email, password } → creates user, logs in
POST   /api/auth/login         — { email, password } → logs in, returns user
POST   /api/auth/logout        — destroys session
GET    /api/auth/me            — returns current user (or 401)
```

### User Routes (authenticated)
```
GET    /api/user/settings      — get user settings
PUT    /api/user/settings      — update settings (profile, editor prefs, AI config)
PUT    /api/user/password      — change password
DELETE /api/user/account       — soft-delete account
POST   /api/user/export        — export all user data as JSON
```

### Project Routes (authenticated)
```
GET    /api/projects                    — list user's projects
POST   /api/projects                    — create project (from template or blank)
GET    /api/projects/:id                — get project with files
PUT    /api/projects/:id                — update project (name, files, etc.)
DELETE /api/projects/:id                — delete project
POST   /api/projects/:id/files          — create/update a file in the project
DELETE /api/projects/:id/files/:path    — delete a file
```

### Transpiler Routes
```
POST   /api/transpile          — { code, filename } → returns { javascript, errors, warnings }
POST   /api/execute            — { code } → transpile + execute in sandboxed VM, return output
```

### AI / Chat Routes (authenticated)
```
POST   /api/ai/chat            — { message, projectId, context, provider, model } → AI response
GET    /api/ai/history/:projectId  — get chat history for a project
POST   /api/ai/explain         — { code } → explain code
POST   /api/ai/fix             — { code, error } → suggest fix
POST   /api/ai/generate        — { prompt, projectId } → generate code
POST   /api/ai/refactor        — { code } → refactored code
POST   /api/ai/document        — { code } → generate documentation
GET    /api/ai/providers       — list available LLM providers and models
```

### Agent Routes (authenticated)
```
GET    /api/agents                  — list user's agents
POST   /api/agents                  — create custom agent
POST   /api/agents/:id/run          — run agent on current project
GET    /api/agents/:id/results      — get agent results
DELETE /api/agents/:id              — delete agent
```

### Deployment Routes (authenticated)
```
GET    /api/deployments                     — list user's deployments
POST   /api/deployments                     — create deployment { projectId, platform, region, envVars }
GET    /api/deployments/:id/logs            — get build logs
DELETE /api/deployments/:id                 — take down deployment
POST   /api/services/connect/:platform      — initiate OAuth for hosting platforms
GET    /api/services/callback/:platform     — OAuth callback
GET    /api/services/status                 — connection status for all services
```

### Integration Routes (authenticated)
```
GET    /api/integrations                    — list all available integrations (with user's connection status)
GET    /api/integrations/connected          — list user's connected integrations only
POST   /api/integrations/:serviceId/connect — initiate connection (OAuth or API key)
POST   /api/integrations/:serviceId/disconnect — disconnect integration
POST   /api/integrations/:serviceId/test    — test connection health
GET    /api/integrations/:serviceId/config  — get integration-specific settings
PUT    /api/integrations/:serviceId/config  — update integration settings
```

### Database Connection Routes (authenticated)
```
GET    /api/db-connections                  — list user's DB connections
POST   /api/db-connections                  — add connection { dbType, connectionString, label }
POST   /api/db-connections/:id/test         — test connection
DELETE /api/db-connections/:id              — remove connection
```

### Admin Routes (admin only — jgelet@macrotechtitan.com)
```
GET    /api/admin/dashboard         — KPIs: total users, active users, projects, deployments, MRR, AI usage
GET    /api/admin/users             — paginated user list with search/filter
GET    /api/admin/users/:id         — user detail with activity
PUT    /api/admin/users/:id/role    — change user role
PUT    /api/admin/users/:id/status  — suspend/activate user
DELETE /api/admin/users/:id         — delete user

GET    /api/admin/projects          — all projects across all users
GET    /api/admin/deployments       — all deployments across all users

GET    /api/admin/settings          — get platform settings
PUT    /api/admin/settings          — update platform settings

GET    /api/admin/billing           — revenue overview, transactions
GET    /api/admin/billing/plans     — plan definitions
PUT    /api/admin/billing/plans     — update plans

GET    /api/admin/features          — get feature flags
PUT    /api/admin/features/:name    — toggle feature flag

GET    /api/admin/integrations      — integration usage analytics across all users
GET    /api/admin/system/health     — system health checks
GET    /api/admin/system/logs       — error logs
GET    /api/admin/activity          — activity feed across all users
```

---

## Step 7: The Multi-Language Transpiler

Port the transpiler from the current `app.js` into `server/services/transpiler.ts` AND `client/src/lib/transpiler.ts` (for real-time client-side preview). The transpiler converts multiple language syntaxes to valid JavaScript:

### Transpilation Rules

| Source Syntax | JavaScript Output | Origin Language |
|---|---|---|
| `def funcName(args) {` | `function funcName(args) {` | Python |
| `func funcName(args) {` | `function funcName(args) {` | Go |
| `fn funcName(args) {` | `function funcName(args) {` | Rust |
| `x := 5` | `let x = 5` | Go |
| `let mut x = 5` | `let x = 5` | Rust |
| `let x = 5` (no mut) | `const x = 5` | Rust |
| `print(...)` | `console.log(...)` | Python |
| `println!(...)` | `console.log(...)` | Rust |
| `fmt.Println(...)` | `console.log(...)` | Go |
| `Console.WriteLine(...)` | `console.log(...)` | C# |
| `System.out.println(...)` | `console.log(...)` | Java |
| `True` / `False` / `None` | `true` / `false` / `null` | Python |
| `nil` | `null` | Go |
| `and` / `or` / `not` | `&&` / `\|\|` / `!` | Python |
| `elif` | `else if` | Python |
| `# comment` | `// comment` | Python |
| `f"Hello {name}"` | `` `Hello ${name}` `` | Python |
| `len(arr)` | `arr.length` | Python |
| `range(n)` | `Array.from({length:n},(_,i)=>i)` | Python |
| `[x*2 for x in range(5)]` | `Array.from({length:5},(_,x)=>x*2)` | Python |
| `match val { ... => ... }` | `switch(val) { case ...: ... }` | Rust |
| `impl ClassName { fn ... }` | Class prototype methods | Rust |

Standard JavaScript also works unchanged — it's a true superset.

---

## Step 8: AI Integration (Any LLM Provider)

Matt supports **any LLM** via an OpenAI-compatible API layer. Users configure their preferred provider and API key in Settings.

```typescript
// server/services/ai-assistant.ts

import OpenAI from "openai";

// Supported providers with their base URLs
const PROVIDERS = {
  openai:    { baseURL: "https://api.openai.com/v1",          models: ["gpt-4o", "gpt-4o-mini", "o1-preview", "o1-mini"] },
  anthropic: { baseURL: "https://api.anthropic.com/v1",       models: ["claude-3.5-sonnet", "claude-3-opus", "claude-3-haiku"] },
  google:    { baseURL: "https://generativelanguage.googleapis.com/v1beta/openai", models: ["gemini-2.0-flash", "gemini-1.5-pro"] },
  mistral:   { baseURL: "https://api.mistral.ai/v1",          models: ["mistral-large", "mistral-medium", "codestral"] },
  groq:      { baseURL: "https://api.groq.com/openai/v1",     models: ["llama-3.1-70b", "mixtral-8x7b"] },
  together:  { baseURL: "https://api.together.xyz/v1",         models: ["meta-llama/Llama-3.1-405B"] },
  openrouter:{ baseURL: "https://openrouter.ai/api/v1",       models: ["auto"] },
  custom:    { baseURL: "",                                     models: [] },  // User-defined endpoint
};

const SYSTEM_PROMPT = `You are Matt AI, the coding assistant for Macro Tech Titan AI.
Matt is a Super Framework — a meta layer that works with any programming language, any API, and any LLM.
The built-in transpiler accepts syntax from Python, Go, Rust, C#, Java, and JavaScript.
Help users write, debug, explain, and refactor code in any language.
When generating code, feel free to use multi-language syntax (def/func/fn for functions, := for declarations, print() for output).
Be concise and practical.`;

export async function chat(
  userMessage: string,
  context: string,
  apiKey: string,
  provider: string = "openai",
  model: string = "gpt-4o"
) {
  const providerConfig = PROVIDERS[provider] || PROVIDERS.openai;
  const openai = new OpenAI({
    apiKey,
    baseURL: provider === "custom" ? undefined : providerConfig.baseURL,
  });
  const response = await openai.chat.completions.create({
    model,
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: context ? `Current code:\n${context}\n\nQuestion: ${userMessage}` : userMessage }
    ],
    max_tokens: 4096,
    temperature: 0.7,
  });
  return response.choices[0].message.content;
}
```

**Environment variable:** `OPENAI_API_KEY` — Platform-level API key for shared usage. Users can also set their own key + provider in Settings.

---

## Step 9: Frontend — 3 Core Modes

### Layout: 3-Column IDE

```
┌─────────────────────────────────────────────────────────────────┐
│ HEADER: [Matt Logo] Matt  [Coding][Chat][Deploy]  [⚙️][👤]     │
├──────────┬────────────────────────────────┬─────────────────────┤
│ LEFT     │ MIDDLE (huge)                  │ RIGHT               │
│ ~220px   │ Monaco Editor (top)            │ ~300px              │
│          │ Console + REPL (bottom)        │                     │
├──────────┴────────────────────────────────┴─────────────────────┤
│ STATUS BAR                                                       │
└──────────────────────────────────────────────────────────────────┘
```

### 3 Core Modes (header tabs switch content in left + right panels)

| Mode | Left Panel | Right Panel | Description |
|---|---|---|---|
| **Coding** | File explorer, packages, project settings | Transpiled output / Problems / Language Ref tabs | Build anything — write code, manage files, see real-time transpilation |
| **Chat** | Conversation history, quick prompts, model selector | AI response area with code blocks, inline actions (insert, copy, explain) | Talk to Matt AI — ask questions, generate code, debug, refactor |
| **Deploy** | Hosting platforms list (8+ services), connected services | Deploy config, env vars, DB connections, build logs, live URL | Ship to any platform — one-click deployment with full config |

### Color Scheme (dark mode default)

```css
--bg-primary: #0d1117;
--bg-secondary: #161b22;
--bg-tertiary: #21262d;
--border: #30363d;
--text-primary: #e6edf3;
--text-secondary: #8b949e;
--accent-blue: #58a6ff;        /* primary actions */
--accent-green: #3fb950;       /* success, run button */
--accent-red: #f85149;         /* errors */
--accent-orange: #d29922;      /* warnings, admin badge */
--accent-purple: #bc8cff;      /* keywords in editor */
```

### Typography
- **UI text:** Inter (Google Fonts)
- **Code:** JetBrains Mono (Google Fonts)

### Light mode: also required, toggled via header button.

---

## Step 10: Integrations Page

Build a dedicated **Integrations** page accessible from the header or settings. This is a marketplace-style grid showing all possible integrations organized by category. Each card shows the service icon, name, description, connection status, and a Connect/Disconnect button.

### Integration Categories & Services

#### Hosting & Deployment
| Service | Description | Auth Method |
|---|---|---|
| **DigitalOcean** | Cloud infrastructure, App Platform, Droplets | OAuth |
| **Render** | Zero-config cloud hosting, auto-deploy from Git | API Key |
| **Vercel** | Frontend cloud, serverless functions, edge network | OAuth |
| **Netlify** | Web hosting, serverless, forms, identity | OAuth |
| **Railway** | Infrastructure platform, instant deploys | OAuth |
| **Fly.io** | Run full-stack apps globally, edge compute | API Token |
| **AWS** | EC2, Lambda, S3, Amplify, Elastic Beanstalk | Access Key + Secret |
| **Google Cloud Platform** | Cloud Run, App Engine, Cloud Functions | Service Account |
| **Microsoft Azure** | App Service, Functions, Static Web Apps | OAuth |
| **GitHub Pages** | Static site hosting from GitHub repos | OAuth (via GitHub) |
| **Heroku** | Platform-as-a-service, add-ons marketplace | OAuth |
| **Cloudflare Pages** | JAMstack hosting, Workers, edge functions | API Token |

#### Databases
| Service | Description | Auth Method |
|---|---|---|
| **Neon** | Serverless PostgreSQL, branching, autoscaling | Connection String |
| **Supabase** | Open-source Firebase alternative, Postgres + Auth + Storage | API Key |
| **PlanetScale** | Serverless MySQL, branching, schema changes | API Token |
| **MongoDB Atlas** | Cloud-hosted MongoDB, search, vector | Connection String |
| **Redis Cloud** | In-memory data store, caching, pub/sub | Connection String |
| **Firebase** | Realtime DB, Firestore, Auth, Storage | Service Account |
| **CockroachDB** | Distributed SQL, global scale | Connection String |
| **Turso** | SQLite at the edge, libSQL | API Token |
| **Upstash** | Serverless Redis and Kafka | API Key |

#### AI & Machine Learning
| Service | Description | Auth Method |
|---|---|---|
| **OpenAI** | GPT-4o, DALL-E, Whisper, Embeddings | API Key |
| **Anthropic** | Claude 3.5 Sonnet, Claude 3 Opus | API Key |
| **Google AI (Gemini)** | Gemini 2.0 Flash, Gemini Pro | API Key |
| **Mistral AI** | Mistral Large, Codestral | API Key |
| **Groq** | Ultra-fast inference, Llama, Mixtral | API Key |
| **Hugging Face** | Model hub, inference API, spaces | API Token |
| **Replicate** | Run open-source models in the cloud | API Token |
| **Together AI** | Open-source model hosting, fine-tuning | API Key |
| **OpenRouter** | Unified API for 100+ models | API Key |
| **Cohere** | Enterprise NLP, embeddings, rerank | API Key |
| **Perplexity AI** | AI-powered search and answer API | API Key |
| **Ollama** | Run local LLMs (connect to local instance) | Local URL |

#### Email & Communication
| Service | Description | Auth Method |
|---|---|---|
| **SendGrid** | Transactional and marketing email API | API Key |
| **Resend** | Modern email API for developers | API Key |
| **Postmark** | Transactional email with delivery tracking | API Token |
| **Mailgun** | Email sending, receiving, and tracking | API Key |
| **AWS SES** | Scalable email sending service | Access Key |
| **Twilio** | SMS, Voice, WhatsApp, Video | Account SID + Auth Token |
| **Slack** | Team messaging, webhooks, bot integration | OAuth |
| **Discord** | Bot integration, webhooks, community tools | Bot Token |
| **Microsoft Teams** | Team messaging, meeting integration | OAuth |

#### Analytics & Monitoring
| Service | Description | Auth Method |
|---|---|---|
| **Google Analytics** | Web analytics, event tracking | OAuth |
| **Mixpanel** | Product analytics, funnels, retention | API Key |
| **PostHog** | Open-source product analytics, feature flags | API Key |
| **Amplitude** | Digital analytics, experimentation | API Key |
| **Sentry** | Error tracking, performance monitoring | DSN / API Key |
| **Datadog** | Infrastructure monitoring, APM, logs | API Key |
| **LogRocket** | Session replay, error tracking | API Key |
| **New Relic** | Full-stack observability | API Key |
| **Grafana Cloud** | Dashboards, alerting, Prometheus, Loki | API Token |
| **Plausible** | Privacy-friendly web analytics | API Key |

#### Storage & CDN
| Service | Description | Auth Method |
|---|---|---|
| **AWS S3** | Object storage, static hosting | Access Key |
| **Cloudflare R2** | S3-compatible storage, zero egress fees | API Token |
| **Google Cloud Storage** | Object storage, CDN integration | Service Account |
| **Azure Blob Storage** | Scalable object storage | Connection String |
| **Backblaze B2** | Affordable cloud storage | API Key |
| **Uploadthing** | File uploads for Next.js / React | API Key |
| **Cloudinary** | Image and video management, transformations | API Key + Secret |
| **imgix** | Real-time image processing CDN | API Key |

#### CI/CD & Version Control
| Service | Description | Auth Method |
|---|---|---|
| **GitHub** | Repos, Actions, Issues, PRs, Packages | OAuth |
| **GitLab** | Repos, CI/CD pipelines, Container Registry | OAuth |
| **Bitbucket** | Repos, Pipelines, Jira integration | OAuth |
| **CircleCI** | CI/CD pipelines, orbs | API Token |
| **GitHub Actions** | Workflow automation, CI/CD | OAuth (via GitHub) |
| **Docker Hub** | Container registry, automated builds | Access Token |

#### Payment & Billing
| Service | Description | Auth Method |
|---|---|---|
| **Stripe** | Payments, subscriptions, billing | API Key |
| **PayPal** | Payments, checkout, subscriptions | Client ID + Secret |
| **Lemon Squeezy** | Payments for digital products, SaaS | API Key |
| **Paddle** | SaaS billing, tax compliance | API Key |

#### Authentication
| Service | Description | Auth Method |
|---|---|---|
| **Auth0** | Identity platform, SSO, MFA | Client ID + Secret |
| **Clerk** | User management, prebuilt auth components | API Key |
| **Supabase Auth** | Open-source auth, social logins | (via Supabase) |
| **Firebase Auth** | Google sign-in, email/password, phone | (via Firebase) |
| **Kinde** | Auth for modern apps, feature flags | API Key |
| **WorkOS** | Enterprise SSO, Directory Sync, Admin Portal | API Key |

#### CMS & Content
| Service | Description | Auth Method |
|---|---|---|
| **Sanity** | Structured content platform, GROQ | API Token |
| **Contentful** | Headless CMS, content modeling | API Key |
| **Strapi** | Open-source headless CMS | API Token |
| **Prismic** | Headless CMS, Slice Machine | API Key |
| **Notion** | Workspace, databases, API | Integration Token |

#### Project Management & Productivity
| Service | Description | Auth Method |
|---|---|---|
| **Linear** | Issue tracking, project management | API Key |
| **Jira** | Issue tracking, agile boards | OAuth |
| **Asana** | Task management, workflows | OAuth |
| **Trello** | Kanban boards, power-ups | API Key |
| **Airtable** | Spreadsheet-database hybrid | API Key |
| **Google Sheets** | Spreadsheet API, data sync | OAuth |

#### Search & Data
| Service | Description | Auth Method |
|---|---|---|
| **Algolia** | Search-as-a-service, instant search | API Key |
| **Typesense** | Open-source search engine | API Key |
| **Meilisearch** | Fast, typo-tolerant search | API Key |
| **Pinecone** | Vector database for AI | API Key |
| **Weaviate** | Vector search engine | API Key |
| **Elasticsearch** | Full-text search, analytics | Connection URL |

#### Scheduling & Automation
| Service | Description | Auth Method |
|---|---|---|
| **Zapier** | Workflow automation, 5000+ app connections | API Key |
| **Make (Integromat)** | Visual automation platform | API Key |
| **n8n** | Self-hostable workflow automation | API Key |
| **Cal.com** | Open-source scheduling | API Key |
| **Cronitor** | Cron job monitoring | API Key |

#### Domain & DNS
| Service | Description | Auth Method |
|---|---|---|
| **Cloudflare** | DNS, CDN, DDoS protection, Workers | API Token |
| **Namecheap** | Domain registration, DNS management | API Key |
| **Google Domains** | Domain registration | OAuth |
| **Route 53 (AWS)** | DNS management, health checks | Access Key |

### Integration Card UI

Each integration card displays:
- Service logo/icon (use brand colors or neutral icon)
- Service name
- Short description
- Category badge
- Connection status indicator (green dot = connected, gray = disconnected)
- "Connect" button (or "Disconnect" if connected)
- "Configure" link for connected services

### Integration Page Layout
- Search bar at top to filter integrations
- Category filter tabs/pills
- Grid layout (3-4 cards per row on desktop, 1-2 on mobile)
- "Connected" section at top showing active integrations
- Each category is a collapsible section

---

## Step 11: Admin Panel Design

The admin panel is a separate view accessed via `#admin` or `/admin` route. It ONLY appears for users with email `jgelet@macrotechtitan.com`.

### Admin sidebar navigation:
1. **Dashboard** — 6 KPI cards, users-over-time chart, deployments-by-platform chart, activity feed
2. **Users** — searchable/filterable table, role management, suspend/activate, bulk actions
3. **Projects** — all projects across all users
4. **Deployments** — all deployments, status indicators, log viewer
5. **Integrations** — integration usage analytics (most popular integrations, connection rates, errors)
6. **Platform Settings** — site name, registration mode, AI defaults, SMTP, maintenance mode
7. **Billing** — plan management, revenue overview, transactions, Stripe settings
8. **Feature Flags** — toggle features per plan (AI Autocomplete, Agents, Deployment, Collaboration, Custom Themes, API Access, Integrations)
9. **System** — health indicators (API, DB, AI, Deploy pipeline), error logs, performance metrics

Admin elements use an amber/orange accent (#d29922) to visually distinguish from the regular IDE.

---

## Step 12: Replit Configuration

### `.replit` file
```toml
run = "npm run dev"
entrypoint = "server/index.ts"

[nix]
channel = "stable-24_05"

[deployment]
run = ["sh", "-c", "npm run start"]
deploymentTarget = "cloudrun"

[[ports]]
localPort = 5000
externalPort = 80
```

### `replit.nix`
```nix
{ pkgs }: {
  deps = [
    pkgs.nodejs_20
    pkgs.nodePackages.typescript
    pkgs.postgresql
  ];
}
```

### `package.json` scripts
```json
{
  "scripts": {
    "dev": "tsx watch server/index.ts",
    "start": "tsx server/index.ts",
    "build": "vite build",
    "db:push": "drizzle-kit push",
    "db:seed": "tsx server/db/seed.ts",
    "db:studio": "drizzle-kit studio"
  }
}
```

### Key dependencies
```json
{
  "dependencies": {
    "express": "^4.18",
    "express-session": "^1.18",
    "connect-pg-simple": "^9.0",
    "passport": "^0.7",
    "passport-local": "^1.0",
    "bcrypt": "^5.1",
    "drizzle-orm": "^0.36",
    "drizzle-kit": "^0.30",
    "@neondatabase/serverless": "^0.10",
    "openai": "^4.70",
    "react": "^18.3",
    "react-dom": "^18.3",
    "wouter": "^3.3",
    "@monaco-editor/react": "^4.6",
    "tailwindcss": "^3.4",
    "vite": "^5.4",
    "tsx": "^4.19",
    "zod": "^3.23"
  }
}
```

---

## Step 13: Environment Variables (Replit Secrets)

Set these in Replit's Secrets tab:

| Key | Value | Required |
|---|---|---|
| `DATABASE_URL` | Neon PostgreSQL connection string | Yes |
| `SESSION_SECRET` | Random 64-char string | Yes |
| `OPENAI_API_KEY` | OpenAI API key (platform-level, for shared AI) | Optional (users can set their own) |
| `ANTHROPIC_API_KEY` | Anthropic API key (for Claude models) | Optional |
| `DIGITALOCEAN_TOKEN` | DigitalOcean API token | Optional |
| `VERCEL_TOKEN` | Vercel API token | Optional |
| `RENDER_API_KEY` | Render API key | Optional |
| `STRIPE_SECRET_KEY` | Stripe secret key for billing | Optional |
| `STRIPE_PUBLISHABLE_KEY` | Stripe publishable key | Optional |
| `SENDGRID_API_KEY` | SendGrid API key for email | Optional |
| `SENTRY_DSN` | Sentry DSN for error tracking | Optional |

---

## Step 14: Seed Data

Run `npm run db:seed` to populate the database with:

### Admin user (pre-created):
- **Email:** jgelet@macrotechtitan.com
- **Password:** admin123 (bcrypt hashed)
- **Role:** admin
- **Plan:** team

### Demo user:
- **Email:** demo@matt.dev
- **Password:** demo123 (bcrypt hashed)
- **Role:** user
- **Plan:** pro

### Additional seed data (for admin dashboard):
- 15 additional sample users with varied roles, plans, and activity levels
- 5 sample projects with code files in various languages
- 3 sample deployments (Vercel, DigitalOcean, Render)
- 6 feature flags (AI Autocomplete, Agents, Deployment, Collaboration, Custom Themes, API Access, Integrations)
- 10 sample integrations across categories (GitHub, Vercel, Neon, OpenAI, SendGrid, etc.)
- Platform settings (site name: "Matt", registration open, default plan: free)
- 20+ activity log entries
- 5 sample transactions

---

## Step 15: First Run Checklist

After cloning and setting up on Replit:

1. `npm install`
2. Add `DATABASE_URL` to Replit Secrets (create a Neon PostgreSQL database at neon.tech)
3. Add `SESSION_SECRET` to Replit Secrets
4. `npm run db:push` — creates all tables in Neon
5. `npm run db:seed` — populates demo data
6. `npm run dev` — starts the app on port 5000
7. Log in with `jgelet@macrotechtitan.com` / `admin123`
8. Verify IDE loads with Monaco editor, all 3 modes work (Coding, Chat, Deploy)
9. Verify the Integrations page loads with all categories
10. Verify Admin Panel is accessible (click avatar → Admin Panel)
11. Log out, log in with `demo@matt.dev` / `demo123`
12. Verify Admin link is NOT visible for this user
13. Test Sign Up with a new email — confirm it creates a "free" plan user
14. Test connecting an integration (e.g., GitHub OAuth flow)

---

## Key Design Principles

1. **Matt is a Super Framework.** The branding, UI copy, and AI persona should all reinforce that this is a meta layer — not just another code editor. It works with *any* API, *any* language, *any* LLM.
2. **3 modes are the product.** Coding, Chat, and Deploy are the three pillars. The mode tabs should be prominent and switching should be instant.
3. **Monaco Editor is non-negotiable.** Use `@monaco-editor/react` for the code editor. Register a custom language with syntax highlighting, autocomplete, and hover providers.
4. **The transpiler must be real.** Multi-language syntax should actually transpile to JavaScript and execute. This is the core differentiator.
5. **Admin is hidden.** Regular users should have zero awareness that an admin panel exists. No admin routes, no admin UI elements, no admin data leaks.
6. **Settings persist.** When a user changes their editor font size, AI model, or LLM provider, it should persist across sessions (stored in the users table).
7. **AI is provider-agnostic.** The AI assistant should work with any OpenAI-compatible endpoint. Users choose their provider and model in Settings.
8. **Integrations are first-class.** The Integrations page is a key differentiator — it shows that Matt connects to *everything*. Even if connections are simulated at first, the UI and data model should be production-ready.
9. **Deployments are real-ready.** The deployment panel should be structured to wire up to real DigitalOcean/Vercel/Render/Netlify APIs. For now, simulate the flow with realistic UI and status updates.
