# OmniLang IDE — Replit Setup Prompt

## Overview

Convert the OmniLang IDE from a static HTML/JS demo into a full-stack production application on Replit. OmniLang is a master superset programming language that extends JavaScript with syntax from Python, Go, Rust, C#, and Java. The platform includes an online IDE with Monaco editor, AI coding assistant, one-click deployment panel, and an admin backend.

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

## Step 2: Convert to Full-Stack Architecture

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
OmniLang/
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
│   │   ├── transpiler.ts       # OmniLang transpiler (port from app.js)
│   │   ├── ai-assistant.ts     # AI integration (OpenAI API)
│   │   ├── deployment.ts       # Deployment service (DigitalOcean, Vercel APIs)
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
│   │   │   ├── Header.tsx           # Top bar with mode tabs
│   │   │   ├── StatusBar.tsx        # Bottom status bar
│   │   │   ├── LeftPanel.tsx        # Left sidebar (content per mode)
│   │   │   ├── RightPanel.tsx       # Right sidebar (content per mode)
│   │   │   ├── EditorPanel.tsx      # Monaco editor wrapper
│   │   │   ├── ConsolePanel.tsx     # Bottom console with REPL
│   │   │   ├── FileExplorer.tsx     # File tree component
│   │   │   ├── AIChat.tsx           # AI assistant chat panel
│   │   │   ├── AgentCards.tsx       # AI agents list
│   │   │   ├── DeployPanel.tsx      # Deployment services
│   │   │   └── ResizeHandle.tsx     # Panel resize handles
│   │   │
│   │   ├── pages/
│   │   │   ├── LoginPage.tsx        # Login/Signup
│   │   │   ├── IDEPage.tsx          # Main IDE view
│   │   │   ├── SettingsPage.tsx     # User settings
│   │   │   ├── admin/
│   │   │   │   ├── AdminLayout.tsx  # Admin shell with sidebar
│   │   │   │   ├── Dashboard.tsx    # KPIs, charts, activity feed
│   │   │   │   ├── Users.tsx        # User management table
│   │   │   │   ├── Projects.tsx     # All projects table
│   │   │   │   ├── Deployments.tsx  # Deployment logs
│   │   │   │   ├── PlatformSettings.tsx  # Site config
│   │   │   │   ├── Billing.tsx      # Plan/revenue management
│   │   │   │   ├── FeatureFlags.tsx # Feature toggles
│   │   │   │   └── System.tsx       # Health, logs, backups
│   │   │
│   │   ├── hooks/
│   │   │   ├── useAuth.ts          # Auth context + session management
│   │   │   ├── useEditor.ts        # Monaco editor state
│   │   │   ├── useTranspiler.ts    # Transpiler hook
│   │   │   └── useApi.ts           # API request helpers
│   │   │
│   │   ├── lib/
│   │   │   ├── transpiler.ts       # Client-side transpiler (real-time preview)
│   │   │   ├── omnilang-monarch.ts # Monaco language definition for OmniLang
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

## Step 3: Database Schema (Drizzle ORM + Neon PostgreSQL)

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
  dbType: varchar("db_type", { length: 50 }).notNull(),  // "postgresql" | "mongodb" | "mysql" | "redis" | "sqlite" | "firebase"
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
  category: varchar("category", { length: 50 }),   // "deploy" | "project" | "user" | "admin" | "billing" | "system"
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

## Step 4: Authentication (Passport.js)

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
  secret: process.env.SESSION_SECRET || "omnilang-secret-change-me",
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

## Step 5: API Routes

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

### AI Routes (authenticated)
```
POST   /api/ai/chat            — { message, projectId, context } → AI response
GET    /api/ai/history/:projectId  — get chat history for a project
POST   /api/ai/explain         — { code } → explain code
POST   /api/ai/fix             — { code, error } → suggest fix
POST   /api/ai/generate        — { prompt, projectId } → generate OmniLang code
POST   /api/ai/refactor        — { code } → refactored code
POST   /api/ai/document        — { code } → generate documentation
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
POST   /api/services/connect/:platform      — initiate OAuth for DigitalOcean/Vercel/etc.
GET    /api/services/callback/:platform     — OAuth callback
GET    /api/services/status                 — connection status for all services
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

GET    /api/admin/system/health     — system health checks
GET    /api/admin/system/logs       — error logs
GET    /api/admin/activity          — activity feed across all users
```

---

## Step 6: The OmniLang Transpiler

Port the transpiler from the current `app.js` into `server/services/transpiler.ts` AND `client/src/lib/transpiler.ts` (for real-time client-side preview). The transpiler converts OmniLang (a JavaScript superset) to valid JavaScript:

### Transpilation Rules

| OmniLang | JavaScript | Source |
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

## Step 7: AI Integration (OpenAI)

Use the OpenAI API for the AI coding assistant. Users configure their own API key in Settings, or the platform can provide a shared key for Pro/Team plans.

```typescript
// server/services/ai-assistant.ts

import OpenAI from "openai";

const SYSTEM_PROMPT = `You are OmniLang AI, a coding assistant for the OmniLang programming language.
OmniLang is a JavaScript superset that accepts syntax from Python, Go, Rust, C#, and Java.
Help users write, debug, explain, and refactor OmniLang code.
When generating code, use OmniLang syntax (def/func/fn for functions, := for declarations, print() for output).
Be concise and practical.`;

export async function chat(userMessage: string, context: string, apiKey: string, model: string = "gpt-4o") {
  const openai = new OpenAI({ apiKey });
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

**Environment variable:** `OPENAI_API_KEY` — Platform-level API key for shared usage. Users can also set their own key in Settings.

---

## Step 8: Frontend Design System

### Layout: 3-Column IDE

```
┌─────────────────────────────────────────────────────────────────┐
│ HEADER: [Logo] OmniLang  [Question][Coding][Agents][Deploy]    │
├──────────┬────────────────────────────────┬─────────────────────┤
│ LEFT     │ MIDDLE (huge)                  │ RIGHT               │
│ ~220px   │ Monaco Editor (top)            │ ~300px              │
│          │ Console + REPL (bottom)        │                     │
├──────────┴────────────────────────────────┴─────────────────────┤
│ STATUS BAR                                                       │
└──────────────────────────────────────────────────────────────────┘
```

### 4 Modes (header tabs switch content in left + right panels)

| Mode | Left Panel | Right Panel |
|---|---|---|
| **Question** | Search, quick prompts, conversation history | AI response area with code blocks |
| **Coding** | File explorer, packages, settings | Transpiled JS / Problems / Language Ref tabs |
| **Agents** | Agent cards (Code Review, Testing, Docs, Optimization, Security, Refactor) | Agent detail, config, results |
| **Deploy** | Hosting services list (8 platforms) | Deploy config, env vars, DB connections, logs |

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

## Step 9: Admin Panel Design

The admin panel is a separate view accessed via `#admin` or `/admin` route. It ONLY appears for users with email `jgelet@macrotechtitan.com`.

### Admin sidebar navigation:
1. **Dashboard** — 6 KPI cards, users-over-time chart, deployments-by-platform chart, activity feed
2. **Users** — searchable/filterable table, role management, suspend/activate, bulk actions
3. **Projects** — all projects across all users
4. **Deployments** — all deployments, status indicators, log viewer
5. **Platform Settings** — site name, registration mode, AI defaults, SMTP, maintenance mode
6. **Billing** — plan management, revenue overview, transactions, Stripe settings
7. **Feature Flags** — toggle features per plan (AI Autocomplete, Agents, Deployment, Collaboration, Custom Themes, API Access)
8. **System** — health indicators (API, DB, AI, Deploy pipeline), error logs, performance metrics

Admin elements use an amber/orange accent (#d29922) to visually distinguish from the regular IDE.

---

## Step 10: Replit Configuration

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

## Step 11: Environment Variables (Replit Secrets)

Set these in Replit's Secrets tab:

| Key | Value | Required |
|---|---|---|
| `DATABASE_URL` | Neon PostgreSQL connection string | Yes |
| `SESSION_SECRET` | Random 64-char string | Yes |
| `OPENAI_API_KEY` | OpenAI API key for AI assistant | Optional (users can set their own) |
| `DIGITALOCEAN_TOKEN` | DigitalOcean API token | Optional |
| `VERCEL_TOKEN` | Vercel API token | Optional |
| `STRIPE_SECRET_KEY` | Stripe secret key for billing | Optional |
| `STRIPE_PUBLISHABLE_KEY` | Stripe publishable key | Optional |

---

## Step 12: Seed Data

Run `npm run db:seed` to populate the database with:

### Admin user (pre-created):
- **Email:** jgelet@macrotechtitan.com
- **Password:** admin123 (bcrypt hashed)
- **Role:** admin
- **Plan:** team

### Demo user:
- **Email:** demo@omnilang.dev
- **Password:** demo123 (bcrypt hashed)
- **Role:** user
- **Plan:** pro

### Additional seed data (for admin dashboard):
- 15 additional sample users with varied roles, plans, and activity levels
- 5 sample projects with OmniLang files
- 3 sample deployments (Vercel, DigitalOcean, Netlify)
- 6 feature flags (AI Autocomplete, Agents, Deployment, Collaboration, Custom Themes, API Access)
- Platform settings (site name, registration open, default plan: free)
- 20+ activity log entries
- 5 sample transactions

---

## Step 13: First Run Checklist

After cloning and setting up on Replit:

1. `npm install`
2. Add `DATABASE_URL` to Replit Secrets (create a Neon PostgreSQL database at neon.tech)
3. Add `SESSION_SECRET` to Replit Secrets
4. `npm run db:push` — creates all tables in Neon
5. `npm run db:seed` — populates demo data
6. `npm run dev` — starts the app on port 5000
7. Log in with `jgelet@macrotechtitan.com` / `admin123`
8. Verify IDE loads with Monaco editor, all 4 modes work
9. Verify Admin Panel is accessible (click avatar → Admin Panel)
10. Log out, log in with `demo@omnilang.dev` / `demo123`
11. Verify Admin link is NOT visible for this user
12. Test Sign Up with a new email — confirm it creates a "free" plan user

---

## Key Design Principles

1. **The IDE is the product.** Every pixel of the 3-column layout should feel like VS Code — professional, fast, keyboard-driven.
2. **Monaco Editor is non-negotiable.** Use `@monaco-editor/react` for the code editor. Register a custom "omnilang" language with syntax highlighting, autocomplete, and hover providers.
3. **The transpiler must be real.** OmniLang code should actually transpile to JavaScript and execute. This is the core differentiator.
4. **Admin is hidden.** Regular users should have zero awareness that an admin panel exists. No admin routes, no admin UI elements, no admin data leaks.
5. **Settings persist.** When a user changes their editor font size or AI model, it should persist across sessions (stored in the users table).
6. **AI is contextual.** The AI assistant should receive the current file content as context, understand OmniLang syntax, and respond with OmniLang code (not plain JavaScript).
7. **Deployments are real-ready.** The deployment panel should be structured to wire up to real DigitalOcean/Vercel/Netlify APIs. For now, simulate the flow with realistic UI and status updates.
