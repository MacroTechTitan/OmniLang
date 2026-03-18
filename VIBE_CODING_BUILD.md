# Matt — Vibe Coding Engine & Deployment Pipeline: Replit Build Prompt

## Overview

Build a **Vibe Coding** system on top of the existing Matt platform. Vibe coding lets users describe what they want to build in natural language, and Matt's AI generates a full working project — wiring up connected API services automatically — and then deploys it to **Render, Vercel, or Cloudflare Pages** with one click.

The system has 3 layers:
1. **Vibe Engine** — The AI-powered code generation system that takes natural language prompts and produces full project files
2. **Service Wiring** — Automatically detects which connected integrations the user has and injects the appropriate SDKs, credentials, and boilerplate
3. **Deployment Pipeline** — Real API calls to Render, Vercel, and Cloudflare to create services and push code live

**This prompt assumes the base Matt platform + integrations system (REPLIT_SETUP.md + INTEGRATIONS_BUILD.md) are already built.**

---

## Part 1: Vibe Engine — AI Code Generation

### 1.1 Database: Vibe Projects

```typescript
// Add to server/db/schema.ts

export const vibeProjects = pgTable("vibe_projects", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  name: varchar("name", { length: 255 }).notNull(),
  prompt: text("prompt").notNull(),                    // The user's original natural language description
  refinedSpec: text("refined_spec"),                   // AI-refined specification after clarification
  framework: varchar("framework", { length: 50 }),     // "react" | "next" | "express" | "fastapi" | "static" | "fullstack"
  language: varchar("language", { length: 50 }),        // "typescript" | "javascript" | "python"
  files: jsonb("files").default({}),                   // Generated project files: { "src/App.tsx": "code...", "package.json": "..." }
  dependencies: jsonb("dependencies").default({}),     // { "react": "^18.3", "openai": "^4.70", ... }
  connectedServices: jsonb("connected_services").default([]),  // ["openai", "supabase", "stripe"] — which integrations are wired in
  versions: jsonb("versions").default([]),              // Array of { timestamp, prompt, filesSnapshot } for version history
  status: varchar("status", { length: 20 }).default("draft"),  // "draft" | "generating" | "ready" | "deployed" | "error"
  generationLog: text("generation_log"),               // Step-by-step log of what the AI did
  deploymentId: integer("deployment_id").references(() => deployments.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Vibe chat — conversation thread per vibe project for iterative refinement
export const vibeChats = pgTable("vibe_chats", {
  id: serial("id").primaryKey(),
  vibeProjectId: integer("vibe_project_id").notNull().references(() => vibeProjects.id),
  role: varchar("role", { length: 20 }).notNull(),     // "user" | "assistant" | "system"
  content: text("content").notNull(),
  filesChanged: jsonb("files_changed").default([]),     // Which files this message created/modified
  createdAt: timestamp("created_at").defaultNow(),
});
```

### 1.2 Vibe Engine Service

```typescript
// server/services/vibe-engine.ts

import { integrationManager } from "./integration-manager";
import { INTEGRATION_REGISTRY } from "./integration-registry";

// ──────────────────────────────────────────────────────
// PROJECT TEMPLATES — starting scaffolds per framework
// ──────────────────────────────────────────────────────

const TEMPLATES: Record<string, Record<string, string>> = {
  react: {
    "package.json": JSON.stringify({
      name: "matt-vibe-project",
      private: true,
      scripts: { dev: "vite", build: "vite build", preview: "vite preview" },
      dependencies: { react: "^18.3.1", "react-dom": "^18.3.1" },
      devDependencies: { "@vitejs/plugin-react": "^4.3.0", vite: "^5.4.0" },
    }, null, 2),
    "vite.config.js": `import { defineConfig } from 'vite';\nimport react from '@vitejs/plugin-react';\nexport default defineConfig({ plugins: [react()] });`,
    "index.html": `<!DOCTYPE html>\n<html lang="en">\n<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Matt Vibe Project</title></head>\n<body><div id="root"></div><script type="module" src="/src/main.jsx"></script></body>\n</html>`,
    "src/main.jsx": `import React from 'react';\nimport ReactDOM from 'react-dom/client';\nimport App from './App';\nimport './index.css';\nReactDOM.createRoot(document.getElementById('root')).render(<React.StrictMode><App /></React.StrictMode>);`,
    "src/App.jsx": `export default function App() {\n  return <div>Hello from Matt</div>;\n}`,
    "src/index.css": `*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }\nbody { font-family: system-ui, sans-serif; }`,
  },

  next: {
    "package.json": JSON.stringify({
      name: "matt-vibe-project",
      private: true,
      scripts: { dev: "next dev", build: "next build", start: "next start" },
      dependencies: { next: "^14.2.0", react: "^18.3.1", "react-dom": "^18.3.1" },
    }, null, 2),
    "next.config.js": `/** @type {import('next').NextConfig} */\nconst nextConfig = {};\nmodule.exports = nextConfig;`,
    "app/layout.tsx": `export const metadata = { title: 'Matt Vibe Project' };\nexport default function RootLayout({ children }: { children: React.ReactNode }) {\n  return <html lang="en"><body>{children}</body></html>;\n}`,
    "app/page.tsx": `export default function Home() {\n  return <main>Hello from Matt</main>;\n}`,
  },

  express: {
    "package.json": JSON.stringify({
      name: "matt-vibe-api",
      private: true,
      scripts: { dev: "tsx watch server.ts", start: "tsx server.ts", build: "tsc" },
      dependencies: { express: "^4.18.0", cors: "^2.8.5" },
      devDependencies: { "@types/express": "^4.17.0", "@types/cors": "^2.8.0", typescript: "^5.5.0", tsx: "^4.19.0" },
    }, null, 2),
    "server.ts": `import express from 'express';\nimport cors from 'cors';\n\nconst app = express();\napp.use(cors());\napp.use(express.json());\n\napp.get('/api/health', (req, res) => res.json({ status: 'ok' }));\n\nconst PORT = process.env.PORT || 3000;\napp.listen(PORT, () => console.log(\`Server running on port \${PORT}\`));`,
    "tsconfig.json": JSON.stringify({ compilerOptions: { target: "ES2022", module: "ESNext", moduleResolution: "bundler", esModuleInterop: true, strict: true, outDir: "dist" } }, null, 2),
  },

  fastapi: {
    "requirements.txt": "fastapi>=0.115.0\nuvicorn>=0.30.0\npydantic>=2.9.0",
    "main.py": `from fastapi import FastAPI\nfrom fastapi.middleware.cors import CORSMiddleware\n\napp = FastAPI(title="Matt Vibe API")\napp.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])\n\n@app.get("/api/health")\ndef health():\n    return {"status": "ok"}`,
    "Dockerfile": `FROM python:3.12-slim\nWORKDIR /app\nCOPY requirements.txt .\nRUN pip install --no-cache-dir -r requirements.txt\nCOPY . .\nCMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]`,
  },

  static: {
    "index.html": `<!DOCTYPE html>\n<html lang="en">\n<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Matt Vibe Project</title><link rel="stylesheet" href="style.css"></head>\n<body><script src="app.js"></script></body>\n</html>`,
    "style.css": `*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }\nbody { font-family: system-ui, sans-serif; }`,
    "app.js": `// Generated by Matt Vibe Coding`,
  },

  fullstack: {
    // Combines Express backend + React frontend (Vite)
    // Uses the same structure as the Matt platform itself
    "package.json": JSON.stringify({
      name: "matt-vibe-fullstack",
      private: true,
      scripts: {
        dev: "concurrently \"tsx watch server/index.ts\" \"vite\"",
        build: "vite build",
        start: "tsx server/index.ts",
      },
      dependencies: {
        express: "^4.18.0", cors: "^2.8.5", react: "^18.3.1", "react-dom": "^18.3.1",
      },
      devDependencies: {
        "@vitejs/plugin-react": "^4.3.0", vite: "^5.4.0", concurrently: "^8.2.0",
        tsx: "^4.19.0", typescript: "^5.5.0",
      },
    }, null, 2),
    "server/index.ts": `import express from 'express';\nimport cors from 'cors';\nimport path from 'path';\n\nconst app = express();\napp.use(cors());\napp.use(express.json());\n\n// API routes\napp.get('/api/health', (req, res) => res.json({ status: 'ok' }));\n\n// Serve frontend in production\nif (process.env.NODE_ENV === 'production') {\n  app.use(express.static(path.join(__dirname, '../dist')));\n  app.get('*', (req, res) => res.sendFile(path.join(__dirname, '../dist/index.html')));\n}\n\nconst PORT = process.env.PORT || 3000;\napp.listen(PORT, () => console.log(\`Server running on port \${PORT}\`));`,
    "src/main.jsx": `import React from 'react';\nimport ReactDOM from 'react-dom/client';\nimport App from './App';\nReactDOM.createRoot(document.getElementById('root')).render(<App />);`,
    "src/App.jsx": `export default function App() { return <div>Hello from Matt Fullstack</div>; }`,
    "index.html": `<!DOCTYPE html>\n<html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Matt Vibe Project</title></head><body><div id="root"></div><script type="module" src="/src/main.jsx"></script></body></html>`,
    "vite.config.js": `import { defineConfig } from 'vite';\nimport react from '@vitejs/plugin-react';\nexport default defineConfig({ plugins: [react()], server: { proxy: { '/api': 'http://localhost:3000' } } });`,
  },
};

// ──────────────────────────────────────────────────────
// SERVICE WIRING — inject SDKs based on connected integrations
// ──────────────────────────────────────────────────────

interface ServiceWiring {
  serviceId: string;
  npmPackage?: string;              // Package to add to dependencies
  pipPackage?: string;              // Python package for fastapi projects
  envVars: Record<string, string>;  // Env var name → description (values come from integration credentials)
  boilerplate: Record<string, string>;  // File path → code to inject or create
  importLine?: string;              // Import statement to add to main file
}

const SERVICE_WIRINGS: Record<string, ServiceWiring> = {

  openai: {
    serviceId: "openai",
    npmPackage: "openai@^4.70",
    pipPackage: "openai>=1.50",
    envVars: { OPENAI_API_KEY: "OpenAI API key" },
    boilerplate: {
      "lib/ai.ts": `import OpenAI from "openai";\n\nconst openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });\n\nexport async function chat(message: string, systemPrompt?: string) {\n  const response = await openai.chat.completions.create({\n    model: "gpt-4o",\n    messages: [\n      { role: "system", content: systemPrompt || "You are a helpful assistant." },\n      { role: "user", content: message },\n    ],\n  });\n  return response.choices[0].message.content;\n}\n\nexport async function generateImage(prompt: string) {\n  const response = await openai.images.generate({ model: "dall-e-3", prompt, size: "1024x1024" });\n  return response.data[0].url;\n}\n\nexport { openai };`,
    },
  },

  anthropic: {
    serviceId: "anthropic",
    npmPackage: "@anthropic-ai/sdk@^0.30",
    pipPackage: "anthropic>=0.35",
    envVars: { ANTHROPIC_API_KEY: "Anthropic API key" },
    boilerplate: {
      "lib/ai.ts": `import Anthropic from "@anthropic-ai/sdk";\n\nconst anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });\n\nexport async function chat(message: string, systemPrompt?: string) {\n  const response = await anthropic.messages.create({\n    model: "claude-sonnet-4-20250514",\n    max_tokens: 4096,\n    system: systemPrompt || "You are a helpful assistant.",\n    messages: [{ role: "user", content: message }],\n  });\n  return response.content[0].type === "text" ? response.content[0].text : "";\n}\n\nexport { anthropic };`,
    },
  },

  supabase: {
    serviceId: "supabase",
    npmPackage: "@supabase/supabase-js@^2.45",
    envVars: { SUPABASE_URL: "Supabase project URL", SUPABASE_ANON_KEY: "Supabase anon/public key" },
    boilerplate: {
      "lib/supabase.ts": `import { createClient } from "@supabase/supabase-js";\n\nexport const supabase = createClient(\n  process.env.SUPABASE_URL!,\n  process.env.SUPABASE_ANON_KEY!\n);`,
    },
  },

  neon: {
    serviceId: "neon",
    npmPackage: "@neondatabase/serverless@^0.10",
    envVars: { DATABASE_URL: "Neon PostgreSQL connection string" },
    boilerplate: {
      "lib/db.ts": `import { neon } from "@neondatabase/serverless";\n\nconst sql = neon(process.env.DATABASE_URL!);\n\nexport async function query(text: string, params?: any[]) {\n  return sql(text, params);\n}\n\nexport { sql };`,
    },
  },

  firebase: {
    serviceId: "firebase",
    npmPackage: "firebase@^10.14",
    envVars: { FIREBASE_PROJECT_ID: "Firebase project ID" },
    boilerplate: {
      "lib/firebase.ts": `import { initializeApp } from "firebase/app";\nimport { getFirestore } from "firebase/firestore";\nimport { getAuth } from "firebase/auth";\n\nconst firebaseConfig = { projectId: process.env.FIREBASE_PROJECT_ID };\nconst app = initializeApp(firebaseConfig);\nexport const db = getFirestore(app);\nexport const auth = getAuth(app);`,
    },
  },

  mongodb: {
    serviceId: "mongodb",
    npmPackage: "mongodb@^6.10",
    envVars: { MONGODB_URI: "MongoDB Atlas connection string" },
    boilerplate: {
      "lib/db.ts": `import { MongoClient } from "mongodb";\n\nconst client = new MongoClient(process.env.MONGODB_URI!);\nconst db = client.db();\n\nexport { client, db };`,
    },
  },

  stripe: {
    serviceId: "stripe",
    npmPackage: "stripe@^16.12",
    envVars: { STRIPE_SECRET_KEY: "Stripe secret key", STRIPE_PUBLISHABLE_KEY: "Stripe publishable key" },
    boilerplate: {
      "lib/stripe.ts": `import Stripe from "stripe";\n\nexport const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2024-11-20.acacia" });\n\nexport async function createCheckout(priceId: string, successUrl: string, cancelUrl: string) {\n  return stripe.checkout.sessions.create({\n    mode: "payment",\n    line_items: [{ price: priceId, quantity: 1 }],\n    success_url: successUrl,\n    cancel_url: cancelUrl,\n  });\n}`,
    },
  },

  sendgrid: {
    serviceId: "sendgrid",
    npmPackage: "@sendgrid/mail@^8.1",
    envVars: { SENDGRID_API_KEY: "SendGrid API key" },
    boilerplate: {
      "lib/email.ts": `import sgMail from "@sendgrid/mail";\n\nsgMail.setApiKey(process.env.SENDGRID_API_KEY!);\n\nexport async function sendEmail(to: string, subject: string, html: string, from?: string) {\n  return sgMail.send({ to, from: from || "noreply@example.com", subject, html });\n}`,
    },
  },

  resend: {
    serviceId: "resend",
    npmPackage: "resend@^4.0",
    envVars: { RESEND_API_KEY: "Resend API key" },
    boilerplate: {
      "lib/email.ts": `import { Resend } from "resend";\n\nconst resend = new Resend(process.env.RESEND_API_KEY);\n\nexport async function sendEmail(to: string, subject: string, html: string) {\n  return resend.emails.send({ from: "Matt <noreply@example.com>", to, subject, html });\n}`,
    },
  },

  twilio: {
    serviceId: "twilio",
    npmPackage: "twilio@^5.3",
    envVars: { TWILIO_ACCOUNT_SID: "Twilio Account SID", TWILIO_AUTH_TOKEN: "Twilio Auth Token", TWILIO_PHONE_NUMBER: "Twilio phone number" },
    boilerplate: {
      "lib/sms.ts": `import twilio from "twilio";\n\nconst client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);\n\nexport async function sendSMS(to: string, body: string) {\n  return client.messages.create({ to, from: process.env.TWILIO_PHONE_NUMBER, body });\n}`,
    },
  },

  slack: {
    serviceId: "slack",
    npmPackage: "@slack/web-api@^7.5",
    envVars: { SLACK_BOT_TOKEN: "Slack Bot OAuth Token" },
    boilerplate: {
      "lib/slack.ts": `import { WebClient } from "@slack/web-api";\n\nconst slack = new WebClient(process.env.SLACK_BOT_TOKEN);\n\nexport async function sendMessage(channel: string, text: string) {\n  return slack.chat.postMessage({ channel, text });\n}\n\nexport { slack };`,
    },
  },

  algolia: {
    serviceId: "algolia",
    npmPackage: "algoliasearch@^4.24",
    envVars: { ALGOLIA_APP_ID: "Algolia App ID", ALGOLIA_ADMIN_KEY: "Algolia Admin API Key" },
    boilerplate: {
      "lib/search.ts": `import algoliasearch from "algoliasearch";\n\nconst client = algoliasearch(process.env.ALGOLIA_APP_ID!, process.env.ALGOLIA_ADMIN_KEY!);\n\nexport function getIndex(name: string) { return client.initIndex(name); }\n\nexport { client };`,
    },
  },

  sentry: {
    serviceId: "sentry",
    npmPackage: "@sentry/node@^8.30",
    envVars: { SENTRY_DSN: "Sentry DSN" },
    boilerplate: {
      "lib/sentry.ts": `import * as Sentry from "@sentry/node";\n\nSentry.init({ dsn: process.env.SENTRY_DSN, tracesSampleRate: 1.0 });\n\nexport { Sentry };`,
    },
  },

  cloudinary: {
    serviceId: "cloudinary",
    npmPackage: "cloudinary@^2.5",
    envVars: { CLOUDINARY_CLOUD_NAME: "Cloudinary cloud name", CLOUDINARY_API_KEY: "Cloudinary API key", CLOUDINARY_API_SECRET: "Cloudinary API secret" },
    boilerplate: {
      "lib/cloudinary.ts": `import { v2 as cloudinary } from "cloudinary";\n\ncloudinary.config({\n  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,\n  api_key: process.env.CLOUDINARY_API_KEY,\n  api_secret: process.env.CLOUDINARY_API_SECRET,\n});\n\nexport async function uploadImage(filePath: string) {\n  return cloudinary.uploader.upload(filePath, { folder: "matt-vibe" });\n}\n\nexport { cloudinary };`,
    },
  },

  redis: {
    serviceId: "redis",
    npmPackage: "redis@^4.7",
    envVars: { REDIS_URL: "Redis connection URL" },
    boilerplate: {
      "lib/redis.ts": `import { createClient } from "redis";\n\nconst redis = createClient({ url: process.env.REDIS_URL });\nredis.on("error", (err) => console.error("Redis error:", err));\nawait redis.connect();\n\nexport { redis };`,
    },
  },

  "google-analytics": {
    serviceId: "google-analytics",
    envVars: { GA_MEASUREMENT_ID: "Google Analytics Measurement ID" },
    boilerplate: {
      "lib/analytics.ts": `// Client-side only — inject into HTML head\nexport const GA_SCRIPT = \`\n<script async src="https://www.googletagmanager.com/gtag/js?id=\${process.env.GA_MEASUREMENT_ID}"></script>\n<script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','\${process.env.GA_MEASUREMENT_ID}');</script>\`;`,
    },
  },
};

// ──────────────────────────────────────────────────────
// VIBE ENGINE — the core generation pipeline
// ──────────────────────────────────────────────────────

export class VibeEngine {

  /**
   * Step 1: Analyze the user's prompt and determine:
   * - What framework to use
   * - What services are needed
   * - What files need to be generated
   */
  async analyzePrompt(userId: number, prompt: string) {
    // Get user's connected integrations
    const userIntegrations = await integrationManager.getUserIntegrations(userId);
    const connectedIds = userIntegrations
      .filter(i => i.status === "connected")
      .map(i => i.serviceId);

    // Build the analysis prompt for the LLM
    const analysisPrompt = `You are Matt AI, a vibe coding assistant. A user wants to build something. Analyze their request and return a JSON plan.

User's request: "${prompt}"

Connected services available: ${connectedIds.join(", ") || "none"}

Return a JSON object with:
{
  "name": "project-name-slug",
  "framework": "react" | "next" | "express" | "fastapi" | "static" | "fullstack",
  "language": "typescript" | "javascript" | "python",
  "description": "One-line description of what we're building",
  "servicesNeeded": ["openai", "supabase", ...],  // Only include services the user has connected
  "servicesRecommended": ["stripe", ...],           // Services that would help but aren't connected
  "pages": ["Home", "Dashboard", ...],              // For frontend projects
  "apiRoutes": ["/api/users", "/api/generate", ...], // For backend projects
  "features": ["AI chat", "user auth", "payment", ...],
  "clarifyingQuestions": []  // Empty if the prompt is clear enough to build
}

Rules:
- Pick the simplest framework that handles the request
- Only wire services the user actually has connected
- If the request is ambiguous, add 1-2 clarifying questions
- For "build me an app that..." style requests, default to fullstack
- For "build me a website..." default to react
- For "build me an API..." default to express`;

    // Call the AI (use user's connected AI provider or platform default)
    const aiResponse = await this.callAI(userId, analysisPrompt);
    return JSON.parse(aiResponse);
  }

  /**
   * Step 2: Generate the full project
   */
  async generateProject(userId: number, plan: any, originalPrompt: string) {
    // Start with the framework template
    const framework = plan.framework || "react";
    const files = { ...TEMPLATES[framework] };

    // Wire up connected services
    const wiredServices: string[] = [];
    for (const serviceId of plan.servicesNeeded) {
      const wiring = SERVICE_WIRINGS[serviceId];
      if (!wiring) continue;

      // Add boilerplate files
      for (const [filePath, code] of Object.entries(wiring.boilerplate)) {
        files[filePath] = code;
      }

      // Add npm dependency to package.json
      if (wiring.npmPackage && files["package.json"]) {
        const pkg = JSON.parse(files["package.json"]);
        const [name, version] = wiring.npmPackage.split("@^");
        pkg.dependencies = pkg.dependencies || {};
        pkg.dependencies[name] = `^${version}`;
        files["package.json"] = JSON.stringify(pkg, null, 2);
      }

      // Create .env.example with required vars
      const envExample = Object.entries(wiring.envVars)
        .map(([key, desc]) => `${key}=  # ${desc}`)
        .join("\n");
      files[".env.example"] = (files[".env.example"] || "") + envExample + "\n";

      wiredServices.push(serviceId);
    }

    // Now generate the actual application code with the LLM
    const generatePrompt = `You are Matt AI, a vibe coding engine. Generate a complete working project based on this spec.

PROJECT SPEC:
- Name: ${plan.name}
- Description: ${plan.description}
- Framework: ${plan.framework}
- Language: ${plan.language}
- Features: ${plan.features.join(", ")}
- Pages: ${(plan.pages || []).join(", ")}
- API Routes: ${(plan.apiRoutes || []).join(", ")}

ORIGINAL USER PROMPT: "${originalPrompt}"

AVAILABLE SERVICE LIBRARIES (already installed and configured):
${wiredServices.map(s => {
  const w = SERVICE_WIRINGS[s];
  return `- ${s}: import from "${Object.keys(w.boilerplate)[0].replace('.ts','').replace('.js','')}" — env vars: ${Object.keys(w.envVars).join(", ")}`;
}).join("\n")}

EXISTING TEMPLATE FILES:
${Object.keys(files).join("\n")}

INSTRUCTIONS:
Generate the application code. Return a JSON object where keys are file paths and values are the full file contents.
Only return files that need to be CREATED or MODIFIED from the template.
Do NOT return files that don't need changes.
Use the service libraries that are already set up (import from lib/ai.ts, lib/db.ts, etc.).
Make the app fully functional — not placeholder code.
Include proper error handling.
Include a README.md with setup instructions.
Use Tailwind CSS via CDN for styling if the project is frontend/fullstack.
Make it look professional — dark mode, clean layout, good spacing.

Return ONLY valid JSON: { "filepath": "file content", ... }`;

    const generatedCode = await this.callAI(userId, generatePrompt);
    const generatedFiles = JSON.parse(generatedCode);

    // Merge generated files with template
    Object.assign(files, generatedFiles);

    // Generate .env.example from all wired services
    let envContent = "# Generated by Matt Vibe Coding\n# Fill in your actual values\n\n";
    for (const serviceId of wiredServices) {
      const wiring = SERVICE_WIRINGS[serviceId];
      if (!wiring) continue;
      envContent += `# ${serviceId.toUpperCase()}\n`;
      for (const [key, desc] of Object.entries(wiring.envVars)) {
        envContent += `${key}=  # ${desc}\n`;
      }
      envContent += "\n";
    }
    files[".env.example"] = envContent;
    files[".gitignore"] = "node_modules/\ndist/\n.env\n.env.local\n__pycache__/\n*.pyc";

    return { files, wiredServices, dependencies: JSON.parse(files["package.json"] || "{}").dependencies || {} };
  }

  /**
   * Step 3: Iterate — user asks for changes, AI modifies specific files
   */
  async iterateProject(userId: number, vibeProjectId: number, userMessage: string, currentFiles: Record<string, string>) {
    const iteratePrompt = `You are Matt AI. The user has a vibe-coded project and wants changes.

USER REQUEST: "${userMessage}"

CURRENT PROJECT FILES:
${Object.entries(currentFiles).map(([path, content]) =>
  `--- ${path} ---\n${content.substring(0, 2000)}${content.length > 2000 ? "\n... (truncated)" : ""}`
).join("\n\n")}

Return a JSON object with ONLY the files that need to change:
{ "filepath": "new file content", ... }

If a file should be deleted, set its value to null.
If no changes are needed, return {}.`;

    const changes = await this.callAI(userId, iteratePrompt);
    return JSON.parse(changes);
  }

  /**
   * Call the AI using the user's connected provider or platform default
   */
  private async callAI(userId: number, prompt: string): Promise<string> {
    // Try user's connected AI integrations in order of preference
    const providers = ["openai", "anthropic", "google-ai", "mistral", "groq"];
    for (const provider of providers) {
      const creds = await integrationManager.getCredentials(userId, provider);
      if (creds) {
        // Use OpenAI SDK with provider's base URL
        const OpenAI = (await import("openai")).default;
        const providerConfigs: Record<string, { baseURL: string; model: string }> = {
          openai:    { baseURL: "https://api.openai.com/v1", model: "gpt-4o" },
          anthropic: { baseURL: "https://api.anthropic.com/v1", model: "claude-sonnet-4-20250514" },
          "google-ai": { baseURL: "https://generativelanguage.googleapis.com/v1beta/openai", model: "gemini-2.0-flash" },
          mistral:   { baseURL: "https://api.mistral.ai/v1", model: "mistral-large-latest" },
          groq:      { baseURL: "https://api.groq.com/openai/v1", model: "llama-3.1-70b-versatile" },
        };
        const config = providerConfigs[provider];
        const client = new OpenAI({ apiKey: creds.api_key, baseURL: config.baseURL });
        const response = await client.chat.completions.create({
          model: config.model,
          messages: [{ role: "user", content: prompt }],
          max_tokens: 16384,
          temperature: 0.2,  // Low temp for code generation
          response_format: { type: "json_object" },
        });
        return response.choices[0].message.content || "{}";
      }
    }

    // Fallback to platform key
    if (process.env.OPENAI_API_KEY) {
      const OpenAI = (await import("openai")).default;
      const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
      const response = await client.chat.completions.create({
        model: "gpt-4o",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 16384,
        temperature: 0.2,
        response_format: { type: "json_object" },
      });
      return response.choices[0].message.content || "{}";
    }

    throw new Error("No AI provider connected. Connect OpenAI, Anthropic, or another AI service in Integrations.");
  }
}

export const vibeEngine = new VibeEngine();
```

### 1.3 Vibe API Routes

```typescript
// Add to server/routes.ts

import { vibeEngine } from "./services/vibe-engine";

// --- VIBE CODING ROUTES ---

// POST /api/vibe/analyze — analyze a prompt and return a build plan
app.post("/api/vibe/analyze", isAuthenticated, async (req, res) => {
  const { prompt } = req.body;
  if (!prompt) return res.status(400).json({ error: "Prompt is required" });
  try {
    const plan = await vibeEngine.analyzePrompt(req.user.id, prompt);
    res.json(plan);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

// POST /api/vibe/generate — generate a full project from a plan
app.post("/api/vibe/generate", isAuthenticated, async (req, res) => {
  const { plan, prompt } = req.body;
  try {
    // Create the vibe project record
    const [vibeProject] = await db.insert(vibeProjects).values({
      userId: req.user.id,
      name: plan.name,
      prompt,
      refinedSpec: JSON.stringify(plan),
      framework: plan.framework,
      language: plan.language,
      status: "generating",
    }).returning();

    // Generate the project
    const result = await vibeEngine.generateProject(req.user.id, plan, prompt);

    // Save generated files
    await db.update(vibeProjects)
      .set({
        files: result.files,
        dependencies: result.dependencies,
        connectedServices: result.wiredServices,
        status: "ready",
        updatedAt: new Date(),
      })
      .where(eq(vibeProjects.id, vibeProject.id));

    res.json({ id: vibeProject.id, ...result });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

// POST /api/vibe/:id/iterate — make changes to an existing vibe project
app.post("/api/vibe/:id/iterate", isAuthenticated, async (req, res) => {
  const { message } = req.body;
  const project = await db.select().from(vibeProjects)
    .where(and(eq(vibeProjects.id, parseInt(req.params.id)), eq(vibeProjects.userId, req.user.id)))
    .limit(1);

  if (!project.length) return res.status(404).json({ error: "Project not found" });

  try {
    const changes = await vibeEngine.iterateProject(
      req.user.id,
      project[0].id,
      message,
      project[0].files as Record<string, string>
    );

    // Apply changes to existing files
    const currentFiles = project[0].files as Record<string, string>;
    for (const [path, content] of Object.entries(changes)) {
      if (content === null) {
        delete currentFiles[path];
      } else {
        currentFiles[path] = content as string;
      }
    }

    // Save version history
    const versions = (project[0].versions as any[]) || [];
    versions.push({ timestamp: new Date().toISOString(), prompt: message, filesChanged: Object.keys(changes) });

    await db.update(vibeProjects)
      .set({ files: currentFiles, versions, updatedAt: new Date() })
      .where(eq(vibeProjects.id, project[0].id));

    // Log chat
    await db.insert(vibeChats).values([
      { vibeProjectId: project[0].id, role: "user", content: message },
      { vibeProjectId: project[0].id, role: "assistant", content: `Updated ${Object.keys(changes).length} files: ${Object.keys(changes).join(", ")}`, filesChanged: Object.keys(changes) },
    ]);

    res.json({ changes, updatedFiles: currentFiles });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

// GET /api/vibe — list user's vibe projects
app.get("/api/vibe", isAuthenticated, async (req, res) => {
  const projects = await db.select().from(vibeProjects)
    .where(eq(vibeProjects.userId, req.user.id))
    .orderBy(desc(vibeProjects.updatedAt));
  res.json(projects);
});

// GET /api/vibe/:id — get a specific vibe project with files
app.get("/api/vibe/:id", isAuthenticated, async (req, res) => {
  const project = await db.select().from(vibeProjects)
    .where(and(eq(vibeProjects.id, parseInt(req.params.id)), eq(vibeProjects.userId, req.user.id)))
    .limit(1);
  if (!project.length) return res.status(404).json({ error: "Not found" });
  res.json(project[0]);
});

// GET /api/vibe/:id/chat — get chat history for a vibe project
app.get("/api/vibe/:id/chat", isAuthenticated, async (req, res) => {
  const chats = await db.select().from(vibeChats)
    .where(eq(vibeChats.vibeProjectId, parseInt(req.params.id)))
    .orderBy(vibeChats.createdAt);
  res.json(chats);
});

// POST /api/vibe/:id/deploy — deploy a vibe project (see Part 2)
// ... defined in the deployment pipeline section
```

---

## Part 2: Deployment Pipeline — Render, Vercel, Cloudflare

### 2.1 Deployment Service

```typescript
// server/services/deploy-pipeline.ts

import { integrationManager } from "./integration-manager";

// ──────────────────────────────────────────────────────
// DEPLOYMENT TARGETS
// ──────────────────────────────────────────────────────

interface DeployResult {
  success: boolean;
  url?: string;
  serviceId?: string;
  buildLog?: string;
  error?: string;
}

export class DeployPipeline {

  // ──────────────────────────────────────────────────────
  // RENDER — Create a web service via the Render REST API
  // Docs: https://api-docs.render.com/reference/create-service
  // ──────────────────────────────────────────────────────

  async deployToRender(
    userId: number,
    projectName: string,
    files: Record<string, string>,
    envVars: Record<string, string>,
    options: { region?: string; plan?: string; buildCommand?: string; startCommand?: string } = {}
  ): Promise<DeployResult> {
    const creds = await integrationManager.getCredentials(userId, "render");
    if (!creds) return { success: false, error: "Render is not connected. Go to Integrations and add your Render API key." };

    const apiKey = creds.api_key;

    try {
      // Step 1: Push files to a GitHub repo (Render deploys from Git)
      // The user needs GitHub connected — we push to a new repo, then Render auto-deploys from it
      const githubCreds = await integrationManager.getCredentials(userId, "github");

      if (githubCreds) {
        // Create a new repo or use existing one
        const repoName = `matt-${projectName}`.toLowerCase().replace(/[^a-z0-9-]/g, "-");
        await this.pushToGitHub(githubCreds.access_token, repoName, files);

        // Step 2: Create a Render web service pointing at the GitHub repo
        const framework = this.detectFramework(files);
        const response = await fetch("https://api.render.com/v1/services", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            type: "web_service",
            name: repoName,
            repo: `https://github.com/${await this.getGitHubUsername(githubCreds.access_token)}/${repoName}`,
            autoDeploy: "yes",
            branch: "main",
            region: options.region || "oregon",
            plan: options.plan || "free",
            runtime: framework === "python" ? "python" : "node",
            buildCommand: options.buildCommand || this.getBuildCommand(framework),
            startCommand: options.startCommand || this.getStartCommand(framework),
            envVars: Object.entries(envVars).map(([key, value]) => ({ key, value })),
          }),
        });

        if (!response.ok) {
          const err = await response.json();
          return { success: false, error: `Render API error: ${err.message || response.statusText}` };
        }

        const service = await response.json();
        return {
          success: true,
          url: `https://${service.service.serviceDetails?.url || repoName + ".onrender.com"}`,
          serviceId: service.service.id,
          buildLog: "Deployment initiated. Render is building from GitHub. Check the Render dashboard for build logs.",
        };
      } else {
        return { success: false, error: "GitHub is not connected. Render deploys from Git repos — connect GitHub in Integrations first." };
      }
    } catch (err) {
      return { success: false, error: (err as Error).message };
    }
  }

  // ──────────────────────────────────────────────────────
  // VERCEL — Deploy via the Vercel REST API
  // Docs: https://vercel.com/docs/rest-api
  // ──────────────────────────────────────────────────────

  async deployToVercel(
    userId: number,
    projectName: string,
    files: Record<string, string>,
    envVars: Record<string, string>,
    options: { framework?: string; teamId?: string } = {}
  ): Promise<DeployResult> {
    const creds = await integrationManager.getCredentials(userId, "vercel");
    if (!creds) return { success: false, error: "Vercel is not connected. Go to Integrations and connect your Vercel account." };

    const token = creds.access_token;
    const headers = { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" };

    try {
      // Step 1: Upload each file to Vercel
      const uploadedFiles: { file: string; sha: string; size: number }[] = [];

      for (const [filePath, content] of Object.entries(files)) {
        const blob = new Blob([content]);
        const arrayBuffer = await blob.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const sha = require("crypto").createHash("sha1").update(buffer).digest("hex");

        // Upload the file
        const uploadResponse = await fetch("https://api.vercel.com/v2/files", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/octet-stream",
            "x-vercel-digest": sha,
            "Content-Length": String(buffer.length),
          },
          body: buffer,
        });

        if (uploadResponse.ok || uploadResponse.status === 409) {
          // 409 = file already exists, which is fine
          uploadedFiles.push({ file: filePath, sha, size: buffer.length });
        }
      }

      // Step 2: Create the deployment
      const slug = projectName.toLowerCase().replace(/[^a-z0-9-]/g, "-");
      const deployResponse = await fetch("https://api.vercel.com/v13/deployments", {
        method: "POST",
        headers,
        body: JSON.stringify({
          name: slug,
          files: uploadedFiles,
          projectSettings: {
            framework: options.framework || this.detectVercelFramework(files),
            buildCommand: this.getBuildCommand(this.detectFramework(files)),
            outputDirectory: this.getOutputDir(files),
          },
          env: envVars,
          target: "production",
        }),
      });

      if (!deployResponse.ok) {
        const err = await deployResponse.json();
        return { success: false, error: `Vercel API error: ${err.error?.message || deployResponse.statusText}` };
      }

      const deployment = await deployResponse.json();
      return {
        success: true,
        url: `https://${deployment.url}`,
        serviceId: deployment.id,
        buildLog: `Deployment created. Building at https://vercel.com/${deployment.creator?.username}/${slug}/${deployment.id}`,
      };
    } catch (err) {
      return { success: false, error: (err as Error).message };
    }
  }

  // ──────────────────────────────────────────────────────
  // CLOUDFLARE PAGES — Deploy via Cloudflare API
  // Docs: https://developers.cloudflare.com/pages/
  // ──────────────────────────────────────────────────────

  async deployToCloudflare(
    userId: number,
    projectName: string,
    files: Record<string, string>,
    options: { accountId?: string } = {}
  ): Promise<DeployResult> {
    const creds = await integrationManager.getCredentials(userId, "cloudflare-pages") ||
                  await integrationManager.getCredentials(userId, "cloudflare-dns");
    if (!creds) return { success: false, error: "Cloudflare is not connected. Go to Integrations and add your Cloudflare API token." };

    const apiToken = creds.api_token || creds.api_key;
    const accountId = creds.account_id || options.accountId;
    if (!accountId) return { success: false, error: "Cloudflare Account ID is required. Update your Cloudflare integration settings." };

    const slug = projectName.toLowerCase().replace(/[^a-z0-9-]/g, "-");

    try {
      // Step 1: Create or get the Pages project
      let projectExists = false;
      const checkResponse = await fetch(
        `https://api.cloudflare.com/client/v4/accounts/${accountId}/pages/projects/${slug}`,
        { headers: { "Authorization": `Bearer ${apiToken}` } }
      );
      projectExists = checkResponse.ok;

      if (!projectExists) {
        const createResponse = await fetch(
          `https://api.cloudflare.com/client/v4/accounts/${accountId}/pages/projects`,
          {
            method: "POST",
            headers: { "Authorization": `Bearer ${apiToken}`, "Content-Type": "application/json" },
            body: JSON.stringify({
              name: slug,
              production_branch: "main",
            }),
          }
        );
        if (!createResponse.ok) {
          const err = await createResponse.json();
          return { success: false, error: `Cloudflare API error: ${err.errors?.[0]?.message || createResponse.statusText}` };
        }
      }

      // Step 2: Build the project locally (for static output)
      // For Cloudflare Pages, we need to determine the build output
      // If it's a static site, upload files directly
      // If it's React/Next, we'd need to build first
      const framework = this.detectFramework(files);

      // For static sites, upload directly
      // For React/Next, upload source and let Cloudflare build
      const formData = new FormData();

      if (framework === "static") {
        // Direct upload of static files
        for (const [filePath, content] of Object.entries(files)) {
          formData.append(filePath, new Blob([content]), filePath);
        }
      } else {
        // For non-static projects, push to GitHub and use Cloudflare's Git integration
        // Or upload as a direct upload with build configuration
        for (const [filePath, content] of Object.entries(files)) {
          formData.append(filePath, new Blob([content]), filePath);
        }
      }

      // Step 3: Create deployment via direct upload
      const deployResponse = await fetch(
        `https://api.cloudflare.com/client/v4/accounts/${accountId}/pages/projects/${slug}/deployments`,
        {
          method: "POST",
          headers: { "Authorization": `Bearer ${apiToken}` },
          body: formData,
        }
      );

      if (!deployResponse.ok) {
        const err = await deployResponse.json();
        return { success: false, error: `Cloudflare deploy error: ${err.errors?.[0]?.message || deployResponse.statusText}` };
      }

      const deployment = await deployResponse.json();
      return {
        success: true,
        url: `https://${slug}.pages.dev`,
        serviceId: deployment.result?.id,
        buildLog: `Deployed to Cloudflare Pages. Live at https://${slug}.pages.dev`,
      };
    } catch (err) {
      return { success: false, error: (err as Error).message };
    }
  }

  // ──────────────────────────────────────────────────────
  // HELPER: Push files to a GitHub repo
  // ──────────────────────────────────────────────────────

  private async pushToGitHub(token: string, repoName: string, files: Record<string, string>) {
    const headers = { "Authorization": `Bearer ${token}`, "Content-Type": "application/json", "Accept": "application/vnd.github+json" };
    const username = await this.getGitHubUsername(token);

    // Create repo if it doesn't exist
    const repoCheck = await fetch(`https://api.github.com/repos/${username}/${repoName}`, { headers });
    if (!repoCheck.ok) {
      await fetch("https://api.github.com/user/repos", {
        method: "POST",
        headers,
        body: JSON.stringify({ name: repoName, private: false, auto_init: true }),
      });
      // Wait for repo initialization
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    // Get the current commit SHA for the main branch
    const refResponse = await fetch(`https://api.github.com/repos/${username}/${repoName}/git/ref/heads/main`, { headers });
    const refData = await refResponse.json();
    const latestCommitSha = refData.object?.sha;

    // Create blobs for each file
    const treeItems: any[] = [];
    for (const [filePath, content] of Object.entries(files)) {
      const blobResponse = await fetch(`https://api.github.com/repos/${username}/${repoName}/git/blobs`, {
        method: "POST",
        headers,
        body: JSON.stringify({ content, encoding: "utf-8" }),
      });
      const blob = await blobResponse.json();
      treeItems.push({ path: filePath, mode: "100644", type: "blob", sha: blob.sha });
    }

    // Create tree
    const treeResponse = await fetch(`https://api.github.com/repos/${username}/${repoName}/git/trees`, {
      method: "POST",
      headers,
      body: JSON.stringify({ tree: treeItems, base_tree: latestCommitSha ? undefined : undefined }),
    });
    const tree = await treeResponse.json();

    // Create commit
    const commitBody: any = { message: "Deploy from Matt Vibe Coding", tree: tree.sha };
    if (latestCommitSha) commitBody.parents = [latestCommitSha];
    const commitResponse = await fetch(`https://api.github.com/repos/${username}/${repoName}/git/commits`, {
      method: "POST", headers, body: JSON.stringify(commitBody),
    });
    const commit = await commitResponse.json();

    // Update ref
    if (latestCommitSha) {
      await fetch(`https://api.github.com/repos/${username}/${repoName}/git/refs/heads/main`, {
        method: "PATCH", headers, body: JSON.stringify({ sha: commit.sha }),
      });
    } else {
      await fetch(`https://api.github.com/repos/${username}/${repoName}/git/refs`, {
        method: "POST", headers, body: JSON.stringify({ ref: "refs/heads/main", sha: commit.sha }),
      });
    }
  }

  private async getGitHubUsername(token: string): Promise<string> {
    const response = await fetch("https://api.github.com/user", {
      headers: { "Authorization": `Bearer ${token}` },
    });
    const user = await response.json();
    return user.login;
  }

  // ──────────────────────────────────────────────────────
  // HELPERS
  // ──────────────────────────────────────────────────────

  private detectFramework(files: Record<string, string>): string {
    if (files["next.config.js"] || files["next.config.ts"]) return "next";
    if (files["vite.config.js"] || files["vite.config.ts"]) return "react";
    if (files["requirements.txt"] || files["main.py"]) return "python";
    if (files["server.ts"] || files["server.js"] || files["server/index.ts"]) return "express";
    return "static";
  }

  private detectVercelFramework(files: Record<string, string>): string | null {
    if (files["next.config.js"]) return "nextjs";
    if (files["vite.config.js"]) return "vite";
    if (files["nuxt.config.js"]) return "nuxtjs";
    return null;
  }

  private getBuildCommand(framework: string): string {
    switch (framework) {
      case "next": return "npm install && npm run build";
      case "react": return "npm install && npm run build";
      case "express": return "npm install && npm run build";
      case "python": return "pip install -r requirements.txt";
      default: return "";
    }
  }

  private getStartCommand(framework: string): string {
    switch (framework) {
      case "next": return "npm start";
      case "express": return "npm start";
      case "python": return "uvicorn main:app --host 0.0.0.0 --port $PORT";
      default: return "";
    }
  }

  private getOutputDir(files: Record<string, string>): string {
    if (files["next.config.js"]) return ".next";
    if (files["vite.config.js"]) return "dist";
    return "";
  }
}

export const deployPipeline = new DeployPipeline();
```

### 2.2 Deploy API Routes

```typescript
// Add to server/routes.ts

import { deployPipeline } from "./services/deploy-pipeline";

// POST /api/vibe/:id/deploy — deploy a vibe project to a platform
app.post("/api/vibe/:id/deploy", isAuthenticated, async (req, res) => {
  const { platform, envVars, options } = req.body;
  // platform: "render" | "vercel" | "cloudflare"

  const project = await db.select().from(vibeProjects)
    .where(and(eq(vibeProjects.id, parseInt(req.params.id)), eq(vibeProjects.userId, req.user.id)))
    .limit(1);

  if (!project.length) return res.status(404).json({ error: "Project not found" });
  if (project[0].status !== "ready") return res.status(400).json({ error: "Project is not ready for deployment" });

  const files = project[0].files as Record<string, string>;
  const projectName = project[0].name;

  // Resolve env vars: merge user-provided with auto-resolved from connected integrations
  const resolvedEnvVars: Record<string, string> = { ...(envVars || {}) };
  const connectedServices = project[0].connectedServices as string[];

  for (const serviceId of connectedServices) {
    const creds = await integrationManager.getCredentials(req.user.id, serviceId);
    if (!creds) continue;
    // Map integration credentials to env vars using the SERVICE_WIRINGS
    const wiring = SERVICE_WIRINGS[serviceId];
    if (!wiring) continue;
    for (const envKey of Object.keys(wiring.envVars)) {
      // Try to auto-fill from credentials
      const credKey = envKey.toLowerCase().replace(/_/g, "");
      for (const [ck, cv] of Object.entries(creds)) {
        if (ck.toLowerCase().replace(/_/g, "").includes(credKey.replace(serviceId, "")) || ck === "api_key") {
          resolvedEnvVars[envKey] = resolvedEnvVars[envKey] || cv;
        }
      }
    }
  }

  let result;
  switch (platform) {
    case "render":
      result = await deployPipeline.deployToRender(req.user.id, projectName, files, resolvedEnvVars, options);
      break;
    case "vercel":
      result = await deployPipeline.deployToVercel(req.user.id, projectName, files, resolvedEnvVars, options);
      break;
    case "cloudflare":
      result = await deployPipeline.deployToCloudflare(req.user.id, projectName, files, options);
      break;
    default:
      return res.status(400).json({ error: "Unsupported platform. Use: render, vercel, or cloudflare" });
  }

  // Save deployment record
  if (result.success) {
    const [deployment] = await db.insert(deployments).values({
      projectId: project[0].id,
      userId: req.user.id,
      platform,
      url: result.url,
      status: "building",
      buildLog: result.buildLog,
    }).returning();

    await db.update(vibeProjects)
      .set({ status: "deployed", deploymentId: deployment.id })
      .where(eq(vibeProjects.id, project[0].id));
  }

  res.json(result);
});

// GET /api/vibe/:id/deploy/status — check deployment status
app.get("/api/vibe/:id/deploy/status", isAuthenticated, async (req, res) => {
  const project = await db.select().from(vibeProjects)
    .where(and(eq(vibeProjects.id, parseInt(req.params.id)), eq(vibeProjects.userId, req.user.id)))
    .limit(1);

  if (!project.length || !project[0].deploymentId) return res.status(404).json({ error: "No deployment found" });

  const deployment = await db.select().from(deployments)
    .where(eq(deployments.id, project[0].deploymentId))
    .limit(1);

  res.json(deployment[0]);
});
```

---

## Part 3: Vibe Coding UI

### 3.1 Vibe Mode Entry Point

Add a "Vibe" button/mode to the Chat tab (or as a sub-mode within Chat). When the user enters Vibe mode, the UI changes to a focused vibe coding workflow:

```
┌─────────────────────────────────────────────────────────────────────┐
│ HEADER: [Matt Logo]  [Coding][Chat][Deploy][Integrations]          │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌──────────────────────── VIBE MODE ──────────────────────────┐   │
│  │                                                              │   │
│  │  ✨ What do you want to build?                               │   │
│  │                                                              │   │
│  │  ┌────────────────────────────────────────────────────────┐  │   │
│  │  │ Build me a SaaS landing page with Stripe checkout     │  │   │
│  │  │ that sends confirmation emails via SendGrid and       │  │   │
│  │  │ stores customer data in Supabase                      │  │   │
│  │  └────────────────────────────────────────────────────────┘  │   │
│  │                                                              │   │
│  │  Connected services that will be auto-wired:                 │   │
│  │  ● Stripe  ● SendGrid  ● Supabase  ● Vercel                │   │
│  │                                                              │   │
│  │  Framework: React (Vite)  │  Deploy to: [Vercel ▾]          │   │
│  │                                                              │   │
│  │                     [✨ Generate Project]                    │   │
│  │                                                              │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### 3.2 Generation Progress View

After clicking "Generate Project", show a step-by-step progress view:

```
┌────────────────────────────────────────────────────────────────┐
│  ✨ Generating: saas-landing-page                              │
│                                                                │
│  ✅ Analyzed prompt — React (Vite) + Stripe + SendGrid        │
│  ✅ Created project scaffold (7 template files)                │
│  ✅ Wired Stripe SDK with checkout boilerplate                 │
│  ✅ Wired SendGrid with email template                         │
│  ✅ Wired Supabase with auth + database client                 │
│  🔄 Generating application code... (this takes 15-30 seconds) │
│  ⏳ Writing 12 files...                                        │
│  ⏳ Deploy to Vercel                                           │
│                                                                │
│  ████████████████░░░░  75%                                     │
└────────────────────────────────────────────────────────────────┘
```

### 3.3 Project Review & Edit View

Once generated, the user sees a split view:
- **Left**: File tree of generated project
- **Middle**: Monaco editor showing the selected file (fully editable)
- **Right**: Chat panel for iterating ("Add a pricing table", "Change the hero section to blue")
- **Bottom**: Preview panel or deploy button

```
┌──────────┬────────────────────────────────┬─────────────────────┐
│ FILES    │ EDITOR                         │ VIBE CHAT           │
│          │                                │                     │
│ ▾ src/   │ // src/App.jsx                 │ 🤖 Generated 14    │
│   App.jsx│ import { useState } from ...   │    files with       │
│   main.js│ import { supabase } from ...   │    Stripe, SendGrid │
│   Hero.  │                                │    and Supabase     │
│   Pricin │ export default function App()  │    wired in.        │
│ ▾ lib/   │ {                              │                     │
│   stripe │   const [plan, setPlan] = ...  │ You: Add a dark     │
│   email. │   ...                          │      mode toggle    │
│   supaba │                                │                     │
│ package. │                                │ 🤖 Updated 3 files: │
│ .env.exa │                                │    App.jsx, index.  │
│          │                                │    css, Header.jsx  │
├──────────┴────────────────────────────────┴─────────────────────┤
│ [▶ Preview]  [📋 Copy All]  Connected: ● Stripe ● SendGrid    │
│                                                                  │
│ Deploy to: [Vercel ▾]  Region: [US East ▾]  [🚀 Deploy Now]   │
└──────────────────────────────────────────────────────────────────┘
```

### 3.4 Deploy Confirmation Modal

Before deploying, show a confirmation with:
- Target platform (Render / Vercel / Cloudflare)
- Environment variables that will be injected (auto-resolved from connected integrations, with ability to override)
- Estimated build time
- "Deploy" and "Cancel" buttons

```
┌──────────────────────────────────────────────────────┐
│  🚀 Deploy to Vercel                                 │
│                                                      │
│  Project: saas-landing-page                          │
│  Framework: React (Vite)                             │
│  Files: 14                                           │
│                                                      │
│  Environment Variables (auto-filled from connected   │
│  integrations):                                      │
│                                                      │
│  STRIPE_SECRET_KEY      ••••••••••••7F2a    [Edit]   │
│  STRIPE_PUBLISHABLE_KEY pk_live_xxxxx       [Edit]   │
│  SENDGRID_API_KEY       ••••••••••••3kQ9    [Edit]   │
│  SUPABASE_URL           https://xxx.sup...  [Edit]   │
│  SUPABASE_ANON_KEY      ••••••••••••eyJh    [Edit]   │
│                                                      │
│  ⚠️ These values come from your connected            │
│     integrations. Change them if needed.             │
│                                                      │
│              [Cancel]  [🚀 Deploy Now]               │
└──────────────────────────────────────────────────────┘
```

---

## Part 4: Example Flow — End to End

Here's what happens when a user says "Build me a todo app with AI prioritization":

1. **User types prompt** in Vibe mode
2. **Analyze**: Matt AI determines → framework: `react`, services needed: `openai` (for AI prioritization), `supabase` (for storage)
3. **Check connections**: User has OpenAI and Supabase connected → ✅
4. **Generate scaffold**: Start with React (Vite) template
5. **Wire services**: Add `openai` SDK + `lib/ai.ts`, add `@supabase/supabase-js` + `lib/supabase.ts`, create `.env.example`
6. **Generate code**: LLM generates `App.jsx`, `components/TodoList.jsx`, `components/AddTodo.jsx`, `lib/ai-prioritize.ts`, Supabase table schema, Tailwind styling
7. **User reviews** in split editor view
8. **User iterates**: "Make it dark mode and add a calendar view" → AI updates 4 files
9. **User clicks Deploy** → selects Vercel → env vars auto-filled from connected integrations
10. **Deploy**: Files uploaded to Vercel API → build starts → live URL returned
11. **Done**: `https://todo-ai-prioritize.vercel.app` is live

---

## Part 5: Build Verification Checklist

1. [ ] Vibe mode accessible from Chat tab or header
2. [ ] User can type a natural language prompt and get a build plan
3. [ ] Build plan shows detected framework, services to wire, and pages/routes
4. [ ] "Generate Project" produces real, functional code (not placeholder)
5. [ ] Connected integrations are auto-detected and wired with SDKs + boilerplate
6. [ ] Generated project includes `.env.example` with all required env vars
7. [ ] User can view all generated files in a file tree
8. [ ] User can edit any file in Monaco editor
9. [ ] User can iterate via chat ("add dark mode", "change the layout")
10. [ ] Iterations produce targeted file changes (not full regeneration)
11. [ ] Version history tracks each iteration
12. [ ] Deploy to Render works (pushes to GitHub, creates web service via API)
13. [ ] Deploy to Vercel works (uploads files, creates deployment via API)
14. [ ] Deploy to Cloudflare Pages works (creates project, uploads assets via API)
15. [ ] Environment variables auto-resolve from connected integration credentials
16. [ ] User can override env vars before deploying
17. [ ] Deploy progress shows real status updates
18. [ ] Live URL is returned after successful deploy
19. [ ] Admin dashboard shows vibe project analytics (total generated, deployed, services used)
20. [ ] Error states handled: no AI connected, no hosting connected, generation failure, deploy failure
