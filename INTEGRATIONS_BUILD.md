# Matt — Integrations System & Onboarding Wizard: Replit Build Prompt

## Overview

Build on top of the existing Matt (Macro Tech Titan AI) codebase. This prompt covers two major features:

1. **Functional Integrations System** — All ~100 integrations listed in the platform must be fully buildable with real connection flows (OAuth, API key, connection string), stored in the database, and accessible under a dedicated **Integrations tab** in the IDE header alongside Coding, Chat, and Deploy.
2. **Onboarding Wizard** — A swipeable card-based wizard shown to new users on first login that suggests integrations based on their profile, with the ability to swipe/dismiss cards they don't need.

**This prompt assumes the base Matt platform is already built per REPLIT_SETUP.md.** Everything here extends that foundation.

---

## Part 1: Integration Registry Architecture

### 1.1 Integration Registry (Server-Side)

Create a centralized integration registry that defines every supported service. This is a static configuration file — not stored in the database. The database only stores user-specific connection state.

```typescript
// server/services/integration-registry.ts

export type AuthMethod = "oauth" | "api_key" | "connection_string" | "access_key" | "service_account" | "bot_token" | "local_url" | "sid_token" | "client_credentials" | "via_parent";

export type IntegrationCategory =
  | "hosting"
  | "database"
  | "ai"
  | "email"
  | "analytics"
  | "storage"
  | "cicd"
  | "payment"
  | "auth"
  | "cms"
  | "productivity"
  | "search"
  | "automation"
  | "dns";

export interface IntegrationField {
  key: string;            // e.g. "api_key", "connection_string", "client_id"
  label: string;          // e.g. "API Key", "Connection String"
  type: "text" | "password" | "url" | "textarea";
  placeholder?: string;
  required: boolean;
  helpText?: string;      // e.g. "Find this in your Stripe Dashboard → Developers → API Keys"
  helpUrl?: string;       // Link to the service's API key page
}

export interface IntegrationDefinition {
  id: string;                    // unique slug: "digitalocean", "openai", "sendgrid"
  name: string;                  // display name: "DigitalOcean", "OpenAI"
  description: string;           // one-line description
  category: IntegrationCategory;
  authMethod: AuthMethod;
  fields: IntegrationField[];    // what the user needs to provide
  oauthConfig?: {                // only if authMethod === "oauth"
    authUrl: string;
    tokenUrl: string;
    scopes: string[];
    clientIdEnvVar: string;      // env var name for client ID
    clientSecretEnvVar: string;  // env var name for client secret
  };
  icon: string;                  // service icon — either a URL or an inline SVG identifier
  brandColor: string;            // hex color for the card accent
  docsUrl: string;               // link to service's API docs
  features: string[];            // what Matt can do with this integration
  testEndpoint?: string;         // API endpoint to call to verify the connection works
  tier: "free" | "pro" | "team"; // minimum plan required
  popular: boolean;              // show in "Popular" section of integrations page
  onboardingSuggested: boolean;  // suggest during onboarding wizard
  onboardingTags: string[];      // used to match suggestions to user profile: ["web", "backend", "frontend", "fullstack", "mobile", "data", "devops"]
}

// ============================================================
// FULL INTEGRATION REGISTRY — ALL SERVICES
// ============================================================

export const INTEGRATION_REGISTRY: IntegrationDefinition[] = [

  // ──────────────────────────────────────────────────────
  // HOSTING & DEPLOYMENT (12 services)
  // ──────────────────────────────────────────────────────

  {
    id: "digitalocean",
    name: "DigitalOcean",
    description: "Cloud infrastructure, App Platform, Droplets",
    category: "hosting",
    authMethod: "oauth",
    fields: [],
    oauthConfig: {
      authUrl: "https://cloud.digitalocean.com/v1/oauth/authorize",
      tokenUrl: "https://cloud.digitalocean.com/v1/oauth/token",
      scopes: ["read", "write"],
      clientIdEnvVar: "DIGITALOCEAN_CLIENT_ID",
      clientSecretEnvVar: "DIGITALOCEAN_CLIENT_SECRET",
    },
    icon: "digitalocean",
    brandColor: "#0080FF",
    docsUrl: "https://docs.digitalocean.com/reference/api/",
    features: ["Deploy to App Platform", "Create Droplets", "Manage databases", "Configure domains"],
    testEndpoint: "https://api.digitalocean.com/v2/account",
    tier: "free",
    popular: true,
    onboardingSuggested: true,
    onboardingTags: ["backend", "fullstack", "devops"],
  },
  {
    id: "render",
    name: "Render",
    description: "Zero-config cloud hosting, auto-deploy from Git",
    category: "hosting",
    authMethod: "api_key",
    fields: [
      { key: "api_key", label: "API Key", type: "password", placeholder: "rnd_...", required: true, helpText: "Find in Render Dashboard → Account Settings → API Keys", helpUrl: "https://dashboard.render.com/u/settings#api-keys" }
    ],
    icon: "render",
    brandColor: "#46E3B7",
    docsUrl: "https://render.com/docs/api",
    features: ["Deploy web services", "Deploy static sites", "Deploy cron jobs", "Manage environment groups"],
    testEndpoint: "https://api.render.com/v1/owners",
    tier: "free",
    popular: true,
    onboardingSuggested: true,
    onboardingTags: ["web", "backend", "fullstack"],
  },
  {
    id: "vercel",
    name: "Vercel",
    description: "Frontend cloud, serverless functions, edge network",
    category: "hosting",
    authMethod: "oauth",
    fields: [],
    oauthConfig: {
      authUrl: "https://vercel.com/integrations/matt/new",
      tokenUrl: "https://api.vercel.com/v2/oauth/access_token",
      scopes: ["read:project", "write:project", "read:deployment", "write:deployment"],
      clientIdEnvVar: "VERCEL_CLIENT_ID",
      clientSecretEnvVar: "VERCEL_CLIENT_SECRET",
    },
    icon: "vercel",
    brandColor: "#000000",
    docsUrl: "https://vercel.com/docs/rest-api",
    features: ["Deploy frontend apps", "Serverless functions", "Edge config", "Environment variables"],
    testEndpoint: "https://api.vercel.com/v2/user",
    tier: "free",
    popular: true,
    onboardingSuggested: true,
    onboardingTags: ["frontend", "web", "fullstack"],
  },
  {
    id: "netlify",
    name: "Netlify",
    description: "Web hosting, serverless functions, forms, identity",
    category: "hosting",
    authMethod: "oauth",
    fields: [],
    oauthConfig: {
      authUrl: "https://app.netlify.com/authorize",
      tokenUrl: "https://api.netlify.com/oauth/token",
      scopes: [],
      clientIdEnvVar: "NETLIFY_CLIENT_ID",
      clientSecretEnvVar: "NETLIFY_CLIENT_SECRET",
    },
    icon: "netlify",
    brandColor: "#00C7B7",
    docsUrl: "https://docs.netlify.com/api/",
    features: ["Deploy sites", "Serverless functions", "Form handling", "Split testing"],
    testEndpoint: "https://api.netlify.com/api/v1/user",
    tier: "free",
    popular: true,
    onboardingSuggested: true,
    onboardingTags: ["frontend", "web"],
  },
  {
    id: "railway",
    name: "Railway",
    description: "Infrastructure platform, instant deploys",
    category: "hosting",
    authMethod: "api_key",
    fields: [
      { key: "api_key", label: "API Token", type: "password", placeholder: "railway_...", required: true, helpText: "Generate at Railway Dashboard → Account → Tokens", helpUrl: "https://railway.app/account/tokens" }
    ],
    icon: "railway",
    brandColor: "#0B0D0E",
    docsUrl: "https://docs.railway.app/reference/public-api",
    features: ["Deploy services", "Provision databases", "Manage environment variables", "View logs"],
    testEndpoint: "https://backboard.railway.app/graphql/v2",
    tier: "free",
    popular: false,
    onboardingSuggested: false,
    onboardingTags: ["backend", "fullstack"],
  },
  {
    id: "flyio",
    name: "Fly.io",
    description: "Run full-stack apps globally, edge compute",
    category: "hosting",
    authMethod: "api_key",
    fields: [
      { key: "api_key", label: "Access Token", type: "password", placeholder: "fo1_...", required: true, helpText: "Create at fly.io/dashboard → Access Tokens", helpUrl: "https://fly.io/dashboard/personal/access-tokens" }
    ],
    icon: "flyio",
    brandColor: "#7B3BE2",
    docsUrl: "https://fly.io/docs/machines/api/",
    features: ["Deploy machines", "Auto-scale globally", "Volumes & storage", "Private networking"],
    testEndpoint: "https://api.machines.dev/v1/apps",
    tier: "pro",
    popular: false,
    onboardingSuggested: false,
    onboardingTags: ["backend", "devops"],
  },
  {
    id: "aws",
    name: "AWS",
    description: "EC2, Lambda, S3, Amplify, Elastic Beanstalk",
    category: "hosting",
    authMethod: "access_key",
    fields: [
      { key: "access_key_id", label: "Access Key ID", type: "password", placeholder: "AKIA...", required: true, helpText: "Create in IAM → Security credentials" },
      { key: "secret_access_key", label: "Secret Access Key", type: "password", required: true },
      { key: "region", label: "Default Region", type: "text", placeholder: "us-east-1", required: true }
    ],
    icon: "aws",
    brandColor: "#FF9900",
    docsUrl: "https://docs.aws.amazon.com/",
    features: ["Deploy to Lambda", "Deploy to EC2", "S3 storage", "Amplify hosting", "RDS databases"],
    tier: "pro",
    popular: true,
    onboardingSuggested: false,
    onboardingTags: ["backend", "devops", "fullstack"],
  },
  {
    id: "gcp",
    name: "Google Cloud Platform",
    description: "Cloud Run, App Engine, Cloud Functions",
    category: "hosting",
    authMethod: "service_account",
    fields: [
      { key: "service_account_json", label: "Service Account JSON", type: "textarea", placeholder: '{"type": "service_account", ...}', required: true, helpText: "Download from GCP Console → IAM → Service Accounts", helpUrl: "https://console.cloud.google.com/iam-admin/serviceaccounts" },
      { key: "project_id", label: "Project ID", type: "text", required: true }
    ],
    icon: "gcp",
    brandColor: "#4285F4",
    docsUrl: "https://cloud.google.com/docs",
    features: ["Deploy to Cloud Run", "Cloud Functions", "Cloud Storage", "Cloud SQL"],
    tier: "pro",
    popular: false,
    onboardingSuggested: false,
    onboardingTags: ["backend", "devops"],
  },
  {
    id: "azure",
    name: "Microsoft Azure",
    description: "App Service, Functions, Static Web Apps",
    category: "hosting",
    authMethod: "oauth",
    fields: [],
    oauthConfig: {
      authUrl: "https://login.microsoftonline.com/common/oauth2/v2.0/authorize",
      tokenUrl: "https://login.microsoftonline.com/common/oauth2/v2.0/token",
      scopes: ["https://management.azure.com/.default"],
      clientIdEnvVar: "AZURE_CLIENT_ID",
      clientSecretEnvVar: "AZURE_CLIENT_SECRET",
    },
    icon: "azure",
    brandColor: "#0078D4",
    docsUrl: "https://learn.microsoft.com/en-us/rest/api/azure/",
    features: ["Deploy to App Service", "Azure Functions", "Static Web Apps", "Cosmos DB"],
    tier: "pro",
    popular: false,
    onboardingSuggested: false,
    onboardingTags: ["backend", "devops"],
  },
  {
    id: "github-pages",
    name: "GitHub Pages",
    description: "Static site hosting from GitHub repos",
    category: "hosting",
    authMethod: "via_parent",
    fields: [],
    icon: "github",
    brandColor: "#24292E",
    docsUrl: "https://docs.github.com/en/pages",
    features: ["Deploy static sites", "Custom domains", "HTTPS", "Jekyll builds"],
    tier: "free",
    popular: true,
    onboardingSuggested: true,
    onboardingTags: ["frontend", "web"],
  },
  {
    id: "heroku",
    name: "Heroku",
    description: "Platform-as-a-service, add-ons marketplace",
    category: "hosting",
    authMethod: "api_key",
    fields: [
      { key: "api_key", label: "API Key", type: "password", required: true, helpText: "Find in Heroku Dashboard → Account Settings → API Key", helpUrl: "https://dashboard.heroku.com/account" }
    ],
    icon: "heroku",
    brandColor: "#430098",
    docsUrl: "https://devcenter.heroku.com/articles/platform-api-reference",
    features: ["Deploy apps", "Add-ons marketplace", "Pipelines", "Review apps"],
    tier: "free",
    popular: false,
    onboardingSuggested: false,
    onboardingTags: ["backend", "fullstack"],
  },
  {
    id: "cloudflare-pages",
    name: "Cloudflare Pages",
    description: "JAMstack hosting, Workers, edge functions",
    category: "hosting",
    authMethod: "api_key",
    fields: [
      { key: "api_token", label: "API Token", type: "password", required: true, helpText: "Create at Cloudflare Dashboard → My Profile → API Tokens", helpUrl: "https://dash.cloudflare.com/profile/api-tokens" },
      { key: "account_id", label: "Account ID", type: "text", required: true }
    ],
    icon: "cloudflare",
    brandColor: "#F38020",
    docsUrl: "https://developers.cloudflare.com/pages/",
    features: ["Deploy JAMstack sites", "Workers functions", "Edge compute", "Web analytics"],
    tier: "free",
    popular: false,
    onboardingSuggested: false,
    onboardingTags: ["frontend", "web"],
  },

  // ──────────────────────────────────────────────────────
  // DATABASES (9 services)
  // ──────────────────────────────────────────────────────

  {
    id: "neon",
    name: "Neon",
    description: "Serverless PostgreSQL, branching, autoscaling",
    category: "database",
    authMethod: "connection_string",
    fields: [
      { key: "connection_string", label: "Connection String", type: "password", placeholder: "postgresql://user:pass@ep-cool-name.us-east-2.aws.neon.tech/neondb", required: true, helpText: "Copy from Neon Console → Connection Details", helpUrl: "https://console.neon.tech/" }
    ],
    icon: "neon",
    brandColor: "#00E599",
    docsUrl: "https://neon.tech/docs",
    features: ["PostgreSQL queries", "Branch databases", "Connection pooling", "Auto-suspend"],
    tier: "free",
    popular: true,
    onboardingSuggested: true,
    onboardingTags: ["backend", "fullstack", "data"],
  },
  {
    id: "supabase",
    name: "Supabase",
    description: "Open-source Firebase alternative, Postgres + Auth + Storage",
    category: "database",
    authMethod: "api_key",
    fields: [
      { key: "project_url", label: "Project URL", type: "url", placeholder: "https://xxxxx.supabase.co", required: true },
      { key: "anon_key", label: "Anon / Public Key", type: "password", required: true },
      { key: "service_role_key", label: "Service Role Key", type: "password", required: false, helpText: "Only needed for server-side admin operations" }
    ],
    icon: "supabase",
    brandColor: "#3ECF8E",
    docsUrl: "https://supabase.com/docs",
    features: ["PostgreSQL queries", "Auth users", "Storage buckets", "Realtime subscriptions", "Edge Functions"],
    tier: "free",
    popular: true,
    onboardingSuggested: true,
    onboardingTags: ["backend", "fullstack", "frontend"],
  },
  {
    id: "planetscale",
    name: "PlanetScale",
    description: "Serverless MySQL, branching, schema changes",
    category: "database",
    authMethod: "api_key",
    fields: [
      { key: "connection_string", label: "Connection String", type: "password", required: true, helpText: "Create in PlanetScale Dashboard → Connect → Create password" }
    ],
    icon: "planetscale",
    brandColor: "#000000",
    docsUrl: "https://planetscale.com/docs",
    features: ["MySQL queries", "Branch databases", "Schema migrations", "Query insights"],
    tier: "free",
    popular: false,
    onboardingSuggested: false,
    onboardingTags: ["backend", "data"],
  },
  {
    id: "mongodb",
    name: "MongoDB Atlas",
    description: "Cloud-hosted MongoDB, search, vector",
    category: "database",
    authMethod: "connection_string",
    fields: [
      { key: "connection_string", label: "Connection String", type: "password", placeholder: "mongodb+srv://user:pass@cluster0.xxxxx.mongodb.net/", required: true, helpText: "Copy from Atlas → Connect → Drivers", helpUrl: "https://cloud.mongodb.com/" }
    ],
    icon: "mongodb",
    brandColor: "#47A248",
    docsUrl: "https://www.mongodb.com/docs/atlas/",
    features: ["CRUD operations", "Aggregation pipelines", "Atlas Search", "Vector search"],
    tier: "free",
    popular: true,
    onboardingSuggested: false,
    onboardingTags: ["backend", "fullstack", "data"],
  },
  {
    id: "redis",
    name: "Redis Cloud",
    description: "In-memory data store, caching, pub/sub",
    category: "database",
    authMethod: "connection_string",
    fields: [
      { key: "connection_string", label: "Connection URL", type: "password", placeholder: "redis://default:pass@redis-xxxxx.c1.us-east-1.ec2.cloud.redislabs.com:6379", required: true }
    ],
    icon: "redis",
    brandColor: "#DC382D",
    docsUrl: "https://redis.io/docs/",
    features: ["Key-value store", "Caching layer", "Pub/sub messaging", "Streams", "Session store"],
    tier: "free",
    popular: false,
    onboardingSuggested: false,
    onboardingTags: ["backend", "devops"],
  },
  {
    id: "firebase",
    name: "Firebase",
    description: "Realtime DB, Firestore, Auth, Storage",
    category: "database",
    authMethod: "service_account",
    fields: [
      { key: "service_account_json", label: "Service Account JSON", type: "textarea", required: true, helpText: "Download from Firebase Console → Project Settings → Service Accounts → Generate new private key" },
      { key: "project_id", label: "Project ID", type: "text", required: true }
    ],
    icon: "firebase",
    brandColor: "#FFCA28",
    docsUrl: "https://firebase.google.com/docs",
    features: ["Firestore CRUD", "Realtime Database", "Firebase Auth", "Cloud Storage", "Cloud Functions"],
    tier: "free",
    popular: true,
    onboardingSuggested: true,
    onboardingTags: ["frontend", "mobile", "fullstack"],
  },
  {
    id: "cockroachdb",
    name: "CockroachDB",
    description: "Distributed SQL, global scale",
    category: "database",
    authMethod: "connection_string",
    fields: [
      { key: "connection_string", label: "Connection String", type: "password", required: true, helpText: "Copy from CockroachDB Cloud → Connect" }
    ],
    icon: "cockroachdb",
    brandColor: "#6933FF",
    docsUrl: "https://www.cockroachlabs.com/docs/",
    features: ["Distributed SQL queries", "Multi-region", "Change data capture", "Schema management"],
    tier: "pro",
    popular: false,
    onboardingSuggested: false,
    onboardingTags: ["backend", "data", "devops"],
  },
  {
    id: "turso",
    name: "Turso",
    description: "SQLite at the edge, libSQL",
    category: "database",
    authMethod: "api_key",
    fields: [
      { key: "database_url", label: "Database URL", type: "url", placeholder: "libsql://db-name-org.turso.io", required: true },
      { key: "auth_token", label: "Auth Token", type: "password", required: true }
    ],
    icon: "turso",
    brandColor: "#4FF8D2",
    docsUrl: "https://docs.turso.tech/",
    features: ["SQLite queries", "Edge replicas", "Embedded databases", "Branching"],
    tier: "free",
    popular: false,
    onboardingSuggested: false,
    onboardingTags: ["backend", "frontend"],
  },
  {
    id: "upstash",
    name: "Upstash",
    description: "Serverless Redis and Kafka",
    category: "database",
    authMethod: "api_key",
    fields: [
      { key: "redis_url", label: "Redis REST URL", type: "url", required: true },
      { key: "redis_token", label: "Redis REST Token", type: "password", required: true }
    ],
    icon: "upstash",
    brandColor: "#00E9A3",
    docsUrl: "https://upstash.com/docs",
    features: ["Serverless Redis", "Rate limiting", "Kafka messaging", "QStash scheduling"],
    tier: "free",
    popular: false,
    onboardingSuggested: false,
    onboardingTags: ["backend"],
  },

  // ──────────────────────────────────────────────────────
  // AI & MACHINE LEARNING (12 services)
  // ──────────────────────────────────────────────────────

  {
    id: "openai",
    name: "OpenAI",
    description: "GPT-4o, DALL-E, Whisper, Embeddings",
    category: "ai",
    authMethod: "api_key",
    fields: [
      { key: "api_key", label: "API Key", type: "password", placeholder: "sk-...", required: true, helpText: "Create at platform.openai.com → API Keys", helpUrl: "https://platform.openai.com/api-keys" }
    ],
    icon: "openai",
    brandColor: "#10A37F",
    docsUrl: "https://platform.openai.com/docs",
    features: ["Chat completions (GPT-4o)", "Image generation (DALL-E)", "Audio transcription (Whisper)", "Embeddings", "Assistants API"],
    testEndpoint: "https://api.openai.com/v1/models",
    tier: "free",
    popular: true,
    onboardingSuggested: true,
    onboardingTags: ["web", "backend", "frontend", "fullstack", "data"],
  },
  {
    id: "anthropic",
    name: "Anthropic",
    description: "Claude 3.5 Sonnet, Claude 3 Opus",
    category: "ai",
    authMethod: "api_key",
    fields: [
      { key: "api_key", label: "API Key", type: "password", placeholder: "sk-ant-...", required: true, helpText: "Create at console.anthropic.com → API Keys", helpUrl: "https://console.anthropic.com/settings/keys" }
    ],
    icon: "anthropic",
    brandColor: "#D4A27F",
    docsUrl: "https://docs.anthropic.com/",
    features: ["Chat completions (Claude)", "Long context (200K tokens)", "Vision", "Tool use"],
    testEndpoint: "https://api.anthropic.com/v1/messages",
    tier: "free",
    popular: true,
    onboardingSuggested: true,
    onboardingTags: ["web", "backend", "frontend", "fullstack"],
  },
  {
    id: "google-ai",
    name: "Google AI (Gemini)",
    description: "Gemini 2.0 Flash, Gemini Pro",
    category: "ai",
    authMethod: "api_key",
    fields: [
      { key: "api_key", label: "API Key", type: "password", required: true, helpText: "Create at aistudio.google.com → Get API Key", helpUrl: "https://aistudio.google.com/apikey" }
    ],
    icon: "google-ai",
    brandColor: "#4285F4",
    docsUrl: "https://ai.google.dev/docs",
    features: ["Chat completions (Gemini)", "Multimodal (image + text)", "Code generation", "Long context (1M tokens)"],
    tier: "free",
    popular: true,
    onboardingSuggested: false,
    onboardingTags: ["web", "fullstack"],
  },
  {
    id: "mistral",
    name: "Mistral AI",
    description: "Mistral Large, Codestral",
    category: "ai",
    authMethod: "api_key",
    fields: [
      { key: "api_key", label: "API Key", type: "password", required: true, helpUrl: "https://console.mistral.ai/api-keys/" }
    ],
    icon: "mistral",
    brandColor: "#F7D046",
    docsUrl: "https://docs.mistral.ai/",
    features: ["Chat completions", "Code generation (Codestral)", "Embeddings", "Function calling"],
    tier: "free",
    popular: false,
    onboardingSuggested: false,
    onboardingTags: ["backend", "fullstack"],
  },
  {
    id: "groq",
    name: "Groq",
    description: "Ultra-fast inference, Llama, Mixtral",
    category: "ai",
    authMethod: "api_key",
    fields: [
      { key: "api_key", label: "API Key", type: "password", placeholder: "gsk_...", required: true, helpUrl: "https://console.groq.com/keys" }
    ],
    icon: "groq",
    brandColor: "#F55036",
    docsUrl: "https://console.groq.com/docs/",
    features: ["Ultra-fast chat completions", "Llama 3.1 models", "Mixtral", "Whisper transcription"],
    tier: "free",
    popular: false,
    onboardingSuggested: false,
    onboardingTags: ["backend"],
  },
  {
    id: "huggingface",
    name: "Hugging Face",
    description: "Model hub, inference API, Spaces",
    category: "ai",
    authMethod: "api_key",
    fields: [
      { key: "api_key", label: "Access Token", type: "password", placeholder: "hf_...", required: true, helpUrl: "https://huggingface.co/settings/tokens" }
    ],
    icon: "huggingface",
    brandColor: "#FFD21E",
    docsUrl: "https://huggingface.co/docs/api-inference/",
    features: ["Inference API", "Model search", "Spaces deployment", "Datasets", "Fine-tuning"],
    tier: "free",
    popular: false,
    onboardingSuggested: false,
    onboardingTags: ["data", "backend"],
  },
  {
    id: "replicate",
    name: "Replicate",
    description: "Run open-source models in the cloud",
    category: "ai",
    authMethod: "api_key",
    fields: [
      { key: "api_key", label: "API Token", type: "password", placeholder: "r8_...", required: true, helpUrl: "https://replicate.com/account/api-tokens" }
    ],
    icon: "replicate",
    brandColor: "#000000",
    docsUrl: "https://replicate.com/docs",
    features: ["Run any open model", "Image generation", "Video generation", "Audio models", "Custom models"],
    tier: "free",
    popular: false,
    onboardingSuggested: false,
    onboardingTags: ["data", "backend"],
  },
  {
    id: "together",
    name: "Together AI",
    description: "Open-source model hosting, fine-tuning",
    category: "ai",
    authMethod: "api_key",
    fields: [
      { key: "api_key", label: "API Key", type: "password", required: true, helpUrl: "https://api.together.xyz/settings/api-keys" }
    ],
    icon: "together",
    brandColor: "#0066FF",
    docsUrl: "https://docs.together.ai/",
    features: ["Chat completions (Llama, Mistral)", "Fine-tuning", "Embeddings", "Image generation"],
    tier: "free",
    popular: false,
    onboardingSuggested: false,
    onboardingTags: ["backend", "data"],
  },
  {
    id: "openrouter",
    name: "OpenRouter",
    description: "Unified API for 100+ models",
    category: "ai",
    authMethod: "api_key",
    fields: [
      { key: "api_key", label: "API Key", type: "password", placeholder: "sk-or-...", required: true, helpUrl: "https://openrouter.ai/keys" }
    ],
    icon: "openrouter",
    brandColor: "#6366F1",
    docsUrl: "https://openrouter.ai/docs",
    features: ["Access 100+ models via one API", "Auto-routing", "Fallback models", "Usage tracking"],
    tier: "free",
    popular: false,
    onboardingSuggested: false,
    onboardingTags: ["backend", "fullstack"],
  },
  {
    id: "cohere",
    name: "Cohere",
    description: "Enterprise NLP, embeddings, rerank",
    category: "ai",
    authMethod: "api_key",
    fields: [
      { key: "api_key", label: "API Key", type: "password", required: true, helpUrl: "https://dashboard.cohere.com/api-keys" }
    ],
    icon: "cohere",
    brandColor: "#39594D",
    docsUrl: "https://docs.cohere.com/",
    features: ["Chat completions", "Embeddings", "Rerank", "Classify", "Summarize"],
    tier: "pro",
    popular: false,
    onboardingSuggested: false,
    onboardingTags: ["data", "backend"],
  },
  {
    id: "perplexity",
    name: "Perplexity AI",
    description: "AI-powered search and answer API",
    category: "ai",
    authMethod: "api_key",
    fields: [
      { key: "api_key", label: "API Key", type: "password", placeholder: "pplx-...", required: true, helpUrl: "https://www.perplexity.ai/settings/api" }
    ],
    icon: "perplexity",
    brandColor: "#20808D",
    docsUrl: "https://docs.perplexity.ai/",
    features: ["Online search completions", "Citation-backed answers", "Research API"],
    tier: "pro",
    popular: false,
    onboardingSuggested: false,
    onboardingTags: ["data", "backend"],
  },
  {
    id: "ollama",
    name: "Ollama",
    description: "Run local LLMs (connect to local instance)",
    category: "ai",
    authMethod: "local_url",
    fields: [
      { key: "base_url", label: "Ollama URL", type: "url", placeholder: "http://localhost:11434", required: true, helpText: "Default is http://localhost:11434 — make sure Ollama is running" }
    ],
    icon: "ollama",
    brandColor: "#FFFFFF",
    docsUrl: "https://github.com/ollama/ollama/blob/main/docs/api.md",
    features: ["Run local models", "Llama, Mistral, CodeLlama", "No API costs", "Full privacy"],
    tier: "free",
    popular: false,
    onboardingSuggested: false,
    onboardingTags: ["backend"],
  },

  // ──────────────────────────────────────────────────────
  // EMAIL & COMMUNICATION (9 services)
  // ──────────────────────────────────────────────────────

  {
    id: "sendgrid",
    name: "SendGrid",
    description: "Transactional and marketing email API",
    category: "email",
    authMethod: "api_key",
    fields: [
      { key: "api_key", label: "API Key", type: "password", placeholder: "SG...", required: true, helpUrl: "https://app.sendgrid.com/settings/api_keys" }
    ],
    icon: "sendgrid",
    brandColor: "#1A82E2",
    docsUrl: "https://docs.sendgrid.com/",
    features: ["Send transactional emails", "Email templates", "Marketing campaigns", "Analytics"],
    testEndpoint: "https://api.sendgrid.com/v3/user/profile",
    tier: "free",
    popular: true,
    onboardingSuggested: true,
    onboardingTags: ["web", "backend", "fullstack"],
  },
  {
    id: "resend",
    name: "Resend",
    description: "Modern email API for developers",
    category: "email",
    authMethod: "api_key",
    fields: [
      { key: "api_key", label: "API Key", type: "password", placeholder: "re_...", required: true, helpUrl: "https://resend.com/api-keys" }
    ],
    icon: "resend",
    brandColor: "#000000",
    docsUrl: "https://resend.com/docs",
    features: ["Send transactional emails", "React Email templates", "Webhooks", "Analytics"],
    testEndpoint: "https://api.resend.com/domains",
    tier: "free",
    popular: false,
    onboardingSuggested: false,
    onboardingTags: ["backend", "fullstack"],
  },
  {
    id: "postmark",
    name: "Postmark",
    description: "Transactional email with delivery tracking",
    category: "email",
    authMethod: "api_key",
    fields: [
      { key: "server_token", label: "Server API Token", type: "password", required: true, helpUrl: "https://account.postmarkapp.com/servers" }
    ],
    icon: "postmark",
    brandColor: "#FFDE00",
    docsUrl: "https://postmarkapp.com/developer",
    features: ["Transactional emails", "Templates", "Inbound email", "Message streams"],
    tier: "free",
    popular: false,
    onboardingSuggested: false,
    onboardingTags: ["backend"],
  },
  {
    id: "mailgun",
    name: "Mailgun",
    description: "Email sending, receiving, and tracking",
    category: "email",
    authMethod: "api_key",
    fields: [
      { key: "api_key", label: "API Key", type: "password", required: true },
      { key: "domain", label: "Sending Domain", type: "text", placeholder: "mg.yourdomain.com", required: true }
    ],
    icon: "mailgun",
    brandColor: "#F06B66",
    docsUrl: "https://documentation.mailgun.com/",
    features: ["Send emails", "Email validation", "Inbound routing", "Analytics"],
    tier: "free",
    popular: false,
    onboardingSuggested: false,
    onboardingTags: ["backend"],
  },
  {
    id: "aws-ses",
    name: "AWS SES",
    description: "Scalable email sending service",
    category: "email",
    authMethod: "access_key",
    fields: [
      { key: "access_key_id", label: "Access Key ID", type: "password", required: true },
      { key: "secret_access_key", label: "Secret Access Key", type: "password", required: true },
      { key: "region", label: "SES Region", type: "text", placeholder: "us-east-1", required: true }
    ],
    icon: "aws",
    brandColor: "#FF9900",
    docsUrl: "https://docs.aws.amazon.com/ses/",
    features: ["Send bulk emails", "Email templates", "Reputation dashboard", "Deliverability"],
    tier: "pro",
    popular: false,
    onboardingSuggested: false,
    onboardingTags: ["backend", "devops"],
  },
  {
    id: "twilio",
    name: "Twilio",
    description: "SMS, Voice, WhatsApp, Video",
    category: "email",
    authMethod: "sid_token",
    fields: [
      { key: "account_sid", label: "Account SID", type: "text", placeholder: "AC...", required: true },
      { key: "auth_token", label: "Auth Token", type: "password", required: true },
      { key: "phone_number", label: "Twilio Phone Number", type: "text", placeholder: "+1...", required: false }
    ],
    icon: "twilio",
    brandColor: "#F22F46",
    docsUrl: "https://www.twilio.com/docs",
    features: ["Send SMS", "Voice calls", "WhatsApp messaging", "Video", "Verify (2FA)"],
    tier: "pro",
    popular: true,
    onboardingSuggested: false,
    onboardingTags: ["backend", "fullstack", "mobile"],
  },
  {
    id: "slack",
    name: "Slack",
    description: "Team messaging, webhooks, bot integration",
    category: "email",
    authMethod: "oauth",
    fields: [],
    oauthConfig: {
      authUrl: "https://slack.com/oauth/v2/authorize",
      tokenUrl: "https://slack.com/api/oauth.v2.access",
      scopes: ["chat:write", "channels:read", "users:read"],
      clientIdEnvVar: "SLACK_CLIENT_ID",
      clientSecretEnvVar: "SLACK_CLIENT_SECRET",
    },
    icon: "slack",
    brandColor: "#4A154B",
    docsUrl: "https://api.slack.com/",
    features: ["Send messages", "Create channels", "Bot interactions", "Webhooks", "Deployment notifications"],
    tier: "free",
    popular: true,
    onboardingSuggested: true,
    onboardingTags: ["web", "backend", "fullstack", "devops"],
  },
  {
    id: "discord",
    name: "Discord",
    description: "Bot integration, webhooks, community tools",
    category: "email",
    authMethod: "bot_token",
    fields: [
      { key: "bot_token", label: "Bot Token", type: "password", required: true, helpText: "Create at discord.com/developers/applications", helpUrl: "https://discord.com/developers/applications" },
      { key: "webhook_url", label: "Webhook URL (optional)", type: "url", required: false }
    ],
    icon: "discord",
    brandColor: "#5865F2",
    docsUrl: "https://discord.com/developers/docs",
    features: ["Send messages", "Bot commands", "Webhooks", "Community management"],
    tier: "free",
    popular: false,
    onboardingSuggested: false,
    onboardingTags: ["web"],
  },
  {
    id: "teams",
    name: "Microsoft Teams",
    description: "Team messaging, meeting integration",
    category: "email",
    authMethod: "oauth",
    fields: [],
    oauthConfig: {
      authUrl: "https://login.microsoftonline.com/common/oauth2/v2.0/authorize",
      tokenUrl: "https://login.microsoftonline.com/common/oauth2/v2.0/token",
      scopes: ["https://graph.microsoft.com/Chat.ReadWrite", "https://graph.microsoft.com/ChannelMessage.Send"],
      clientIdEnvVar: "TEAMS_CLIENT_ID",
      clientSecretEnvVar: "TEAMS_CLIENT_SECRET",
    },
    icon: "teams",
    brandColor: "#6264A7",
    docsUrl: "https://learn.microsoft.com/en-us/graph/teams-concept-overview",
    features: ["Send channel messages", "Create meetings", "Webhooks"],
    tier: "pro",
    popular: false,
    onboardingSuggested: false,
    onboardingTags: ["devops"],
  },

  // ──────────────────────────────────────────────────────
  // ANALYTICS & MONITORING (10 services)
  // ──────────────────────────────────────────────────────

  {
    id: "google-analytics",
    name: "Google Analytics",
    description: "Web analytics, event tracking",
    category: "analytics",
    authMethod: "api_key",
    fields: [
      { key: "measurement_id", label: "Measurement ID", type: "text", placeholder: "G-XXXXXXXXXX", required: true },
      { key: "api_secret", label: "API Secret", type: "password", required: false, helpText: "For server-side events via Measurement Protocol" }
    ],
    icon: "google-analytics",
    brandColor: "#E37400",
    docsUrl: "https://developers.google.com/analytics",
    features: ["Track page views", "Custom events", "Conversions", "Real-time reporting"],
    tier: "free",
    popular: true,
    onboardingSuggested: true,
    onboardingTags: ["web", "frontend"],
  },
  {
    id: "mixpanel",
    name: "Mixpanel",
    description: "Product analytics, funnels, retention",
    category: "analytics",
    authMethod: "api_key",
    fields: [
      { key: "project_token", label: "Project Token", type: "password", required: true },
      { key: "api_secret", label: "API Secret (for exports)", type: "password", required: false }
    ],
    icon: "mixpanel",
    brandColor: "#7856FF",
    docsUrl: "https://developer.mixpanel.com/",
    features: ["Event tracking", "Funnels", "Retention analysis", "A/B testing"],
    tier: "free",
    popular: false,
    onboardingSuggested: false,
    onboardingTags: ["frontend", "data"],
  },
  {
    id: "posthog",
    name: "PostHog",
    description: "Open-source product analytics, feature flags",
    category: "analytics",
    authMethod: "api_key",
    fields: [
      { key: "api_key", label: "Project API Key", type: "password", required: true },
      { key: "host", label: "Instance Host", type: "url", placeholder: "https://app.posthog.com", required: true }
    ],
    icon: "posthog",
    brandColor: "#F9BD2B",
    docsUrl: "https://posthog.com/docs",
    features: ["Event tracking", "Session replays", "Feature flags", "A/B testing", "Funnels"],
    tier: "free",
    popular: false,
    onboardingSuggested: false,
    onboardingTags: ["frontend", "fullstack"],
  },
  {
    id: "amplitude",
    name: "Amplitude",
    description: "Digital analytics, experimentation",
    category: "analytics",
    authMethod: "api_key",
    fields: [
      { key: "api_key", label: "API Key", type: "password", required: true }
    ],
    icon: "amplitude",
    brandColor: "#1324B5",
    docsUrl: "https://www.docs.developers.amplitude.com/",
    features: ["Event tracking", "User segmentation", "Behavioral analytics", "Experimentation"],
    tier: "pro",
    popular: false,
    onboardingSuggested: false,
    onboardingTags: ["frontend", "data"],
  },
  {
    id: "sentry",
    name: "Sentry",
    description: "Error tracking, performance monitoring",
    category: "analytics",
    authMethod: "api_key",
    fields: [
      { key: "dsn", label: "DSN", type: "password", placeholder: "https://xxxxx@o0.ingest.sentry.io/0", required: true, helpText: "Find in Sentry → Project Settings → Client Keys (DSN)" },
      { key: "auth_token", label: "Auth Token (for releases)", type: "password", required: false }
    ],
    icon: "sentry",
    brandColor: "#362D59",
    docsUrl: "https://docs.sentry.io/",
    features: ["Error tracking", "Performance monitoring", "Release tracking", "Session replays", "Alerts"],
    tier: "free",
    popular: true,
    onboardingSuggested: true,
    onboardingTags: ["web", "backend", "frontend", "fullstack"],
  },
  {
    id: "datadog",
    name: "Datadog",
    description: "Infrastructure monitoring, APM, logs",
    category: "analytics",
    authMethod: "api_key",
    fields: [
      { key: "api_key", label: "API Key", type: "password", required: true },
      { key: "app_key", label: "Application Key", type: "password", required: false },
      { key: "site", label: "Site", type: "text", placeholder: "datadoghq.com", required: true }
    ],
    icon: "datadog",
    brandColor: "#632CA6",
    docsUrl: "https://docs.datadoghq.com/",
    features: ["Infrastructure monitoring", "APM", "Log management", "Alerts", "Dashboards"],
    tier: "pro",
    popular: false,
    onboardingSuggested: false,
    onboardingTags: ["devops", "backend"],
  },
  {
    id: "logrocket",
    name: "LogRocket",
    description: "Session replay, error tracking",
    category: "analytics",
    authMethod: "api_key",
    fields: [
      { key: "app_id", label: "App ID", type: "text", required: true }
    ],
    icon: "logrocket",
    brandColor: "#764ABC",
    docsUrl: "https://docs.logrocket.com/",
    features: ["Session replay", "Error tracking", "Performance monitoring", "Product analytics"],
    tier: "pro",
    popular: false,
    onboardingSuggested: false,
    onboardingTags: ["frontend"],
  },
  {
    id: "newrelic",
    name: "New Relic",
    description: "Full-stack observability",
    category: "analytics",
    authMethod: "api_key",
    fields: [
      { key: "license_key", label: "License Key", type: "password", required: true },
      { key: "account_id", label: "Account ID", type: "text", required: true }
    ],
    icon: "newrelic",
    brandColor: "#008C99",
    docsUrl: "https://docs.newrelic.com/",
    features: ["APM", "Infrastructure", "Logs", "Browser monitoring", "Alerts"],
    tier: "pro",
    popular: false,
    onboardingSuggested: false,
    onboardingTags: ["devops", "backend"],
  },
  {
    id: "grafana",
    name: "Grafana Cloud",
    description: "Dashboards, alerting, Prometheus, Loki",
    category: "analytics",
    authMethod: "api_key",
    fields: [
      { key: "api_key", label: "API Token", type: "password", required: true },
      { key: "stack_url", label: "Stack URL", type: "url", placeholder: "https://xxxxx.grafana.net", required: true }
    ],
    icon: "grafana",
    brandColor: "#F46800",
    docsUrl: "https://grafana.com/docs/grafana-cloud/",
    features: ["Dashboards", "Prometheus metrics", "Loki logs", "Alerting", "Traces"],
    tier: "pro",
    popular: false,
    onboardingSuggested: false,
    onboardingTags: ["devops"],
  },
  {
    id: "plausible",
    name: "Plausible",
    description: "Privacy-friendly web analytics",
    category: "analytics",
    authMethod: "api_key",
    fields: [
      { key: "api_key", label: "API Key", type: "password", required: true },
      { key: "site_id", label: "Site ID (domain)", type: "text", placeholder: "yourdomain.com", required: true }
    ],
    icon: "plausible",
    brandColor: "#5850EC",
    docsUrl: "https://plausible.io/docs/",
    features: ["Cookieless analytics", "Page views", "Referral sources", "Goals & conversions"],
    tier: "free",
    popular: false,
    onboardingSuggested: false,
    onboardingTags: ["web", "frontend"],
  },

  // ──────────────────────────────────────────────────────
  // STORAGE & CDN (8 services)
  // ──────────────────────────────────────────────────────

  {
    id: "s3", name: "AWS S3", description: "Object storage, static hosting", category: "storage", authMethod: "access_key",
    fields: [
      { key: "access_key_id", label: "Access Key ID", type: "password", required: true },
      { key: "secret_access_key", label: "Secret Access Key", type: "password", required: true },
      { key: "bucket", label: "Bucket Name", type: "text", required: true },
      { key: "region", label: "Region", type: "text", placeholder: "us-east-1", required: true }
    ],
    icon: "aws", brandColor: "#FF9900", docsUrl: "https://docs.aws.amazon.com/s3/", features: ["Upload files", "Static hosting", "Pre-signed URLs", "Lifecycle rules"], tier: "pro", popular: true, onboardingSuggested: false, onboardingTags: ["backend", "devops"],
  },
  {
    id: "r2", name: "Cloudflare R2", description: "S3-compatible storage, zero egress fees", category: "storage", authMethod: "api_key",
    fields: [
      { key: "account_id", label: "Account ID", type: "text", required: true },
      { key: "access_key_id", label: "Access Key ID", type: "password", required: true },
      { key: "secret_access_key", label: "Secret Access Key", type: "password", required: true },
      { key: "bucket", label: "Bucket Name", type: "text", required: true }
    ],
    icon: "cloudflare", brandColor: "#F38020", docsUrl: "https://developers.cloudflare.com/r2/", features: ["S3-compatible API", "Zero egress fees", "Workers integration"], tier: "free", popular: false, onboardingSuggested: false, onboardingTags: ["backend"],
  },
  {
    id: "gcs", name: "Google Cloud Storage", description: "Object storage, CDN integration", category: "storage", authMethod: "service_account",
    fields: [
      { key: "service_account_json", label: "Service Account JSON", type: "textarea", required: true },
      { key: "bucket", label: "Bucket Name", type: "text", required: true }
    ],
    icon: "gcp", brandColor: "#4285F4", docsUrl: "https://cloud.google.com/storage/docs", features: ["Upload files", "CDN serving", "Signed URLs", "Lifecycle management"], tier: "pro", popular: false, onboardingSuggested: false, onboardingTags: ["backend", "devops"],
  },
  {
    id: "azure-blob", name: "Azure Blob Storage", description: "Scalable object storage", category: "storage", authMethod: "connection_string",
    fields: [
      { key: "connection_string", label: "Connection String", type: "password", required: true },
      { key: "container", label: "Container Name", type: "text", required: true }
    ],
    icon: "azure", brandColor: "#0078D4", docsUrl: "https://learn.microsoft.com/en-us/azure/storage/blobs/", features: ["Upload files", "Blob tiers", "CDN integration"], tier: "pro", popular: false, onboardingSuggested: false, onboardingTags: ["backend", "devops"],
  },
  {
    id: "backblaze", name: "Backblaze B2", description: "Affordable cloud storage", category: "storage", authMethod: "api_key",
    fields: [
      { key: "application_key_id", label: "Application Key ID", type: "password", required: true },
      { key: "application_key", label: "Application Key", type: "password", required: true },
      { key: "bucket_id", label: "Bucket ID", type: "text", required: true }
    ],
    icon: "backblaze", brandColor: "#E21D27", docsUrl: "https://www.backblaze.com/docs/cloud-storage", features: ["S3-compatible API", "Low-cost storage", "Lifecycle rules"], tier: "free", popular: false, onboardingSuggested: false, onboardingTags: ["backend"],
  },
  {
    id: "uploadthing", name: "Uploadthing", description: "File uploads for Next.js / React", category: "storage", authMethod: "api_key",
    fields: [
      { key: "secret", label: "Secret Key", type: "password", placeholder: "sk_live_...", required: true, helpUrl: "https://uploadthing.com/dashboard" }
    ],
    icon: "uploadthing", brandColor: "#EF4444", docsUrl: "https://docs.uploadthing.com/", features: ["File uploads", "Image optimization", "Pre-signed URLs"], tier: "free", popular: false, onboardingSuggested: false, onboardingTags: ["frontend", "fullstack"],
  },
  {
    id: "cloudinary", name: "Cloudinary", description: "Image and video management, transformations", category: "storage", authMethod: "api_key",
    fields: [
      { key: "cloud_name", label: "Cloud Name", type: "text", required: true },
      { key: "api_key", label: "API Key", type: "password", required: true },
      { key: "api_secret", label: "API Secret", type: "password", required: true }
    ],
    icon: "cloudinary", brandColor: "#3448C5", docsUrl: "https://cloudinary.com/documentation", features: ["Image upload & transformation", "Video processing", "AI tagging", "CDN delivery"], tier: "free", popular: true, onboardingSuggested: false, onboardingTags: ["frontend", "fullstack"],
  },
  {
    id: "imgix", name: "imgix", description: "Real-time image processing CDN", category: "storage", authMethod: "api_key",
    fields: [
      { key: "api_key", label: "API Key", type: "password", required: true },
      { key: "domain", label: "imgix Domain", type: "text", placeholder: "your-source.imgix.net", required: true }
    ],
    icon: "imgix", brandColor: "#FF6600", docsUrl: "https://docs.imgix.com/", features: ["Real-time image transformations", "CDN delivery", "Face detection", "Auto-format"], tier: "pro", popular: false, onboardingSuggested: false, onboardingTags: ["frontend"],
  },

  // ──────────────────────────────────────────────────────
  // CI/CD & VERSION CONTROL (6 services)
  // ──────────────────────────────────────────────────────

  {
    id: "github", name: "GitHub", description: "Repos, Actions, Issues, PRs, Packages", category: "cicd", authMethod: "oauth",
    fields: [],
    oauthConfig: { authUrl: "https://github.com/login/oauth/authorize", tokenUrl: "https://github.com/login/oauth/access_token", scopes: ["repo", "read:user", "workflow"], clientIdEnvVar: "GITHUB_CLIENT_ID", clientSecretEnvVar: "GITHUB_CLIENT_SECRET" },
    icon: "github", brandColor: "#24292E", docsUrl: "https://docs.github.com/en/rest", features: ["Push/pull repos", "Create issues", "Trigger Actions", "Manage PRs", "Deploy to Pages"], testEndpoint: "https://api.github.com/user", tier: "free", popular: true, onboardingSuggested: true, onboardingTags: ["web", "backend", "frontend", "fullstack", "devops"],
  },
  {
    id: "gitlab", name: "GitLab", description: "Repos, CI/CD pipelines, Container Registry", category: "cicd", authMethod: "oauth",
    fields: [],
    oauthConfig: { authUrl: "https://gitlab.com/oauth/authorize", tokenUrl: "https://gitlab.com/oauth/token", scopes: ["api", "read_user", "read_repository"], clientIdEnvVar: "GITLAB_CLIENT_ID", clientSecretEnvVar: "GITLAB_CLIENT_SECRET" },
    icon: "gitlab", brandColor: "#FC6D26", docsUrl: "https://docs.gitlab.com/ee/api/", features: ["Push/pull repos", "CI/CD pipelines", "Container registry", "Issue tracking"], tier: "free", popular: false, onboardingSuggested: false, onboardingTags: ["devops", "backend"],
  },
  {
    id: "bitbucket", name: "Bitbucket", description: "Repos, Pipelines, Jira integration", category: "cicd", authMethod: "oauth",
    fields: [],
    oauthConfig: { authUrl: "https://bitbucket.org/site/oauth2/authorize", tokenUrl: "https://bitbucket.org/site/oauth2/access_token", scopes: ["repository", "pullrequest"], clientIdEnvVar: "BITBUCKET_CLIENT_ID", clientSecretEnvVar: "BITBUCKET_CLIENT_SECRET" },
    icon: "bitbucket", brandColor: "#0052CC", docsUrl: "https://developer.atlassian.com/cloud/bitbucket/rest/", features: ["Push/pull repos", "Pipelines CI/CD", "Pull requests", "Jira linking"], tier: "free", popular: false, onboardingSuggested: false, onboardingTags: ["devops"],
  },
  {
    id: "circleci", name: "CircleCI", description: "CI/CD pipelines, orbs", category: "cicd", authMethod: "api_key",
    fields: [{ key: "api_token", label: "Personal API Token", type: "password", required: true, helpUrl: "https://app.circleci.com/settings/user/tokens" }],
    icon: "circleci", brandColor: "#343434", docsUrl: "https://circleci.com/docs/api/v2/", features: ["Trigger pipelines", "View builds", "Manage orbs", "Artifacts"], tier: "pro", popular: false, onboardingSuggested: false, onboardingTags: ["devops"],
  },
  {
    id: "github-actions", name: "GitHub Actions", description: "Workflow automation, CI/CD", category: "cicd", authMethod: "via_parent",
    fields: [],
    icon: "github", brandColor: "#2088FF", docsUrl: "https://docs.github.com/en/actions", features: ["Trigger workflows", "View run status", "Download artifacts", "Manage secrets"], tier: "free", popular: true, onboardingSuggested: false, onboardingTags: ["devops", "fullstack"],
  },
  {
    id: "dockerhub", name: "Docker Hub", description: "Container registry, automated builds", category: "cicd", authMethod: "api_key",
    fields: [
      { key: "username", label: "Docker Hub Username", type: "text", required: true },
      { key: "access_token", label: "Access Token", type: "password", required: true, helpUrl: "https://hub.docker.com/settings/security" }
    ],
    icon: "docker", brandColor: "#2496ED", docsUrl: "https://docs.docker.com/docker-hub/api/latest/", features: ["Push/pull images", "Automated builds", "Webhooks", "Vulnerability scanning"], tier: "pro", popular: false, onboardingSuggested: false, onboardingTags: ["devops", "backend"],
  },

  // ──────────────────────────────────────────────────────
  // PAYMENT & BILLING (4 services)
  // ──────────────────────────────────────────────────────

  {
    id: "stripe", name: "Stripe", description: "Payments, subscriptions, billing", category: "payment", authMethod: "api_key",
    fields: [
      { key: "secret_key", label: "Secret Key", type: "password", placeholder: "sk_live_...", required: true, helpUrl: "https://dashboard.stripe.com/apikeys" },
      { key: "publishable_key", label: "Publishable Key", type: "text", placeholder: "pk_live_...", required: true },
      { key: "webhook_secret", label: "Webhook Signing Secret", type: "password", placeholder: "whsec_...", required: false }
    ],
    icon: "stripe", brandColor: "#635BFF", docsUrl: "https://stripe.com/docs/api", features: ["Accept payments", "Subscriptions", "Invoices", "Payment links", "Webhooks"], tier: "free", popular: true, onboardingSuggested: false, onboardingTags: ["fullstack", "backend"],
  },
  {
    id: "paypal", name: "PayPal", description: "Payments, checkout, subscriptions", category: "payment", authMethod: "client_credentials",
    fields: [
      { key: "client_id", label: "Client ID", type: "text", required: true },
      { key: "client_secret", label: "Client Secret", type: "password", required: true },
      { key: "mode", label: "Mode", type: "text", placeholder: "sandbox or live", required: true }
    ],
    icon: "paypal", brandColor: "#003087", docsUrl: "https://developer.paypal.com/docs/", features: ["Accept payments", "Checkout", "Subscriptions", "Payouts"], tier: "free", popular: false, onboardingSuggested: false, onboardingTags: ["fullstack"],
  },
  {
    id: "lemonsqueezy", name: "Lemon Squeezy", description: "Payments for digital products, SaaS", category: "payment", authMethod: "api_key",
    fields: [{ key: "api_key", label: "API Key", type: "password", required: true, helpUrl: "https://app.lemonsqueezy.com/settings/api" }],
    icon: "lemonsqueezy", brandColor: "#FFC233", docsUrl: "https://docs.lemonsqueezy.com/api", features: ["Sell digital products", "Subscriptions", "License keys", "Checkout links"], tier: "free", popular: false, onboardingSuggested: false, onboardingTags: ["fullstack"],
  },
  {
    id: "paddle", name: "Paddle", description: "SaaS billing, tax compliance", category: "payment", authMethod: "api_key",
    fields: [
      { key: "api_key", label: "API Key", type: "password", required: true },
      { key: "environment", label: "Environment", type: "text", placeholder: "sandbox or production", required: true }
    ],
    icon: "paddle", brandColor: "#000000", docsUrl: "https://developer.paddle.com/", features: ["SaaS billing", "Tax compliance", "Subscriptions", "Checkout"], tier: "pro", popular: false, onboardingSuggested: false, onboardingTags: ["fullstack"],
  },

  // ──────────────────────────────────────────────────────
  // AUTHENTICATION (6 services)
  // ──────────────────────────────────────────────────────

  {
    id: "auth0", name: "Auth0", description: "Identity platform, SSO, MFA", category: "auth", authMethod: "client_credentials",
    fields: [
      { key: "domain", label: "Auth0 Domain", type: "text", placeholder: "your-tenant.auth0.com", required: true },
      { key: "client_id", label: "Client ID", type: "text", required: true },
      { key: "client_secret", label: "Client Secret", type: "password", required: true }
    ],
    icon: "auth0", brandColor: "#EB5424", docsUrl: "https://auth0.com/docs", features: ["Social login", "SSO", "MFA", "User management", "Passwordless"], tier: "free", popular: true, onboardingSuggested: false, onboardingTags: ["fullstack", "frontend"],
  },
  {
    id: "clerk", name: "Clerk", description: "User management, prebuilt auth components", category: "auth", authMethod: "api_key",
    fields: [
      { key: "publishable_key", label: "Publishable Key", type: "text", placeholder: "pk_...", required: true },
      { key: "secret_key", label: "Secret Key", type: "password", placeholder: "sk_...", required: true }
    ],
    icon: "clerk", brandColor: "#6C47FF", docsUrl: "https://clerk.com/docs", features: ["Prebuilt auth UI", "User management", "Social login", "Organizations", "Webhooks"], tier: "free", popular: true, onboardingSuggested: false, onboardingTags: ["frontend", "fullstack"],
  },
  {
    id: "supabase-auth", name: "Supabase Auth", description: "Open-source auth, social logins", category: "auth", authMethod: "via_parent", fields: [],
    icon: "supabase", brandColor: "#3ECF8E", docsUrl: "https://supabase.com/docs/guides/auth", features: ["Email/password", "Magic links", "Social providers", "Row level security"], tier: "free", popular: false, onboardingSuggested: false, onboardingTags: ["fullstack"],
  },
  {
    id: "firebase-auth", name: "Firebase Auth", description: "Google sign-in, email/password, phone", category: "auth", authMethod: "via_parent", fields: [],
    icon: "firebase", brandColor: "#FFCA28", docsUrl: "https://firebase.google.com/docs/auth", features: ["Email/password", "Google sign-in", "Phone auth", "Anonymous auth"], tier: "free", popular: false, onboardingSuggested: false, onboardingTags: ["mobile", "frontend"],
  },
  {
    id: "kinde", name: "Kinde", description: "Auth for modern apps, feature flags", category: "auth", authMethod: "client_credentials",
    fields: [
      { key: "domain", label: "Kinde Domain", type: "url", placeholder: "https://your-app.kinde.com", required: true },
      { key: "client_id", label: "Client ID", type: "text", required: true },
      { key: "client_secret", label: "Client Secret", type: "password", required: true }
    ],
    icon: "kinde", brandColor: "#000000", docsUrl: "https://docs.kinde.com/", features: ["Auth", "Feature flags", "User management", "Organizations"], tier: "free", popular: false, onboardingSuggested: false, onboardingTags: ["fullstack"],
  },
  {
    id: "workos", name: "WorkOS", description: "Enterprise SSO, Directory Sync, Admin Portal", category: "auth", authMethod: "api_key",
    fields: [{ key: "api_key", label: "API Key", type: "password", required: true, helpUrl: "https://dashboard.workos.com/api-keys" }],
    icon: "workos", brandColor: "#6363F1", docsUrl: "https://workos.com/docs", features: ["Enterprise SSO", "Directory Sync", "Admin Portal", "Audit Logs"], tier: "pro", popular: false, onboardingSuggested: false, onboardingTags: ["backend"],
  },

  // ──────────────────────────────────────────────────────
  // CMS & CONTENT (5 services)
  // ──────────────────────────────────────────────────────

  {
    id: "sanity", name: "Sanity", description: "Structured content platform, GROQ", category: "cms", authMethod: "api_key",
    fields: [
      { key: "project_id", label: "Project ID", type: "text", required: true },
      { key: "dataset", label: "Dataset", type: "text", placeholder: "production", required: true },
      { key: "token", label: "API Token", type: "password", required: true }
    ],
    icon: "sanity", brandColor: "#F03E2F", docsUrl: "https://www.sanity.io/docs", features: ["GROQ queries", "Content editing", "Image pipeline", "Real-time collaboration"], tier: "free", popular: false, onboardingSuggested: false, onboardingTags: ["frontend"],
  },
  {
    id: "contentful", name: "Contentful", description: "Headless CMS, content modeling", category: "cms", authMethod: "api_key",
    fields: [
      { key: "space_id", label: "Space ID", type: "text", required: true },
      { key: "delivery_token", label: "Content Delivery Token", type: "password", required: true },
      { key: "management_token", label: "Content Management Token", type: "password", required: false }
    ],
    icon: "contentful", brandColor: "#2478CC", docsUrl: "https://www.contentful.com/developers/docs/", features: ["Content API", "Content modeling", "Localization", "Webhooks"], tier: "free", popular: false, onboardingSuggested: false, onboardingTags: ["frontend"],
  },
  {
    id: "strapi", name: "Strapi", description: "Open-source headless CMS", category: "cms", authMethod: "api_key",
    fields: [
      { key: "base_url", label: "Strapi URL", type: "url", placeholder: "https://your-strapi.com", required: true },
      { key: "api_token", label: "API Token", type: "password", required: true }
    ],
    icon: "strapi", brandColor: "#4945FF", docsUrl: "https://docs.strapi.io/", features: ["REST & GraphQL API", "Content types", "Media library", "Roles & permissions"], tier: "free", popular: false, onboardingSuggested: false, onboardingTags: ["backend", "fullstack"],
  },
  {
    id: "prismic", name: "Prismic", description: "Headless CMS, Slice Machine", category: "cms", authMethod: "api_key",
    fields: [
      { key: "repository_name", label: "Repository Name", type: "text", required: true },
      { key: "access_token", label: "Access Token", type: "password", required: false }
    ],
    icon: "prismic", brandColor: "#5163BA", docsUrl: "https://prismic.io/docs", features: ["Slice Machine", "Content API", "Previews", "Release scheduling"], tier: "free", popular: false, onboardingSuggested: false, onboardingTags: ["frontend"],
  },
  {
    id: "notion", name: "Notion", description: "Workspace, databases, API", category: "cms", authMethod: "api_key",
    fields: [{ key: "integration_token", label: "Internal Integration Token", type: "password", placeholder: "ntn_...", required: true, helpUrl: "https://www.notion.so/my-integrations" }],
    icon: "notion", brandColor: "#000000", docsUrl: "https://developers.notion.com/", features: ["Query databases", "Create pages", "Search content", "Manage blocks"], tier: "free", popular: true, onboardingSuggested: false, onboardingTags: ["fullstack"],
  },

  // ──────────────────────────────────────────────────────
  // PROJECT MANAGEMENT & PRODUCTIVITY (6 services)
  // ──────────────────────────────────────────────────────

  {
    id: "linear", name: "Linear", description: "Issue tracking, project management", category: "productivity", authMethod: "api_key",
    fields: [{ key: "api_key", label: "API Key", type: "password", required: true, helpUrl: "https://linear.app/settings/api" }],
    icon: "linear", brandColor: "#5E6AD2", docsUrl: "https://developers.linear.app/docs", features: ["Create issues", "Track projects", "Cycles", "Roadmaps", "Webhooks"], tier: "free", popular: false, onboardingSuggested: false, onboardingTags: ["devops", "fullstack"],
  },
  {
    id: "jira", name: "Jira", description: "Issue tracking, agile boards", category: "productivity", authMethod: "oauth",
    fields: [],
    oauthConfig: { authUrl: "https://auth.atlassian.com/authorize", tokenUrl: "https://auth.atlassian.com/oauth/token", scopes: ["read:jira-work", "write:jira-work", "read:jira-user"], clientIdEnvVar: "JIRA_CLIENT_ID", clientSecretEnvVar: "JIRA_CLIENT_SECRET" },
    icon: "jira", brandColor: "#0052CC", docsUrl: "https://developer.atlassian.com/cloud/jira/platform/rest/v3/", features: ["Create issues", "Sprint management", "Agile boards", "JQL search"], tier: "free", popular: false, onboardingSuggested: false, onboardingTags: ["devops"],
  },
  {
    id: "asana", name: "Asana", description: "Task management, workflows", category: "productivity", authMethod: "oauth",
    fields: [],
    oauthConfig: { authUrl: "https://app.asana.com/-/oauth_authorize", tokenUrl: "https://app.asana.com/-/oauth_token", scopes: ["default"], clientIdEnvVar: "ASANA_CLIENT_ID", clientSecretEnvVar: "ASANA_CLIENT_SECRET" },
    icon: "asana", brandColor: "#F06A6A", docsUrl: "https://developers.asana.com/docs", features: ["Create tasks", "Project management", "Workflows", "Timelines"], tier: "free", popular: false, onboardingSuggested: false, onboardingTags: ["fullstack"],
  },
  {
    id: "trello", name: "Trello", description: "Kanban boards, power-ups", category: "productivity", authMethod: "api_key",
    fields: [
      { key: "api_key", label: "API Key", type: "password", required: true },
      { key: "token", label: "Token", type: "password", required: true }
    ],
    icon: "trello", brandColor: "#0052CC", docsUrl: "https://developer.atlassian.com/cloud/trello/rest/", features: ["Manage boards", "Create cards", "Lists & labels", "Webhooks"], tier: "free", popular: false, onboardingSuggested: false, onboardingTags: [],
  },
  {
    id: "airtable", name: "Airtable", description: "Spreadsheet-database hybrid", category: "productivity", authMethod: "api_key",
    fields: [{ key: "api_key", label: "Personal Access Token", type: "password", placeholder: "pat...", required: true, helpUrl: "https://airtable.com/create/tokens" }],
    icon: "airtable", brandColor: "#18BFFF", docsUrl: "https://airtable.com/developers/web/api", features: ["Query bases", "Create records", "Upload attachments", "Webhooks"], tier: "free", popular: false, onboardingSuggested: false, onboardingTags: ["data", "frontend"],
  },
  {
    id: "google-sheets", name: "Google Sheets", description: "Spreadsheet API, data sync", category: "productivity", authMethod: "oauth",
    fields: [],
    oauthConfig: { authUrl: "https://accounts.google.com/o/oauth2/v2/auth", tokenUrl: "https://oauth2.googleapis.com/token", scopes: ["https://www.googleapis.com/auth/spreadsheets"], clientIdEnvVar: "GOOGLE_CLIENT_ID", clientSecretEnvVar: "GOOGLE_CLIENT_SECRET" },
    icon: "google-sheets", brandColor: "#34A853", docsUrl: "https://developers.google.com/sheets/api", features: ["Read/write sheets", "Create spreadsheets", "Append rows", "Data sync"], tier: "free", popular: false, onboardingSuggested: false, onboardingTags: ["data"],
  },

  // ──────────────────────────────────────────────────────
  // SEARCH & DATA (6 services)
  // ──────────────────────────────────────────────────────

  {
    id: "algolia", name: "Algolia", description: "Search-as-a-service, instant search", category: "search", authMethod: "api_key",
    fields: [
      { key: "app_id", label: "Application ID", type: "text", required: true },
      { key: "admin_key", label: "Admin API Key", type: "password", required: true },
      { key: "search_key", label: "Search-Only API Key", type: "text", required: true }
    ],
    icon: "algolia", brandColor: "#5468FF", docsUrl: "https://www.algolia.com/doc/", features: ["Full-text search", "Faceting", "Autocomplete", "Analytics"], tier: "free", popular: false, onboardingSuggested: false, onboardingTags: ["fullstack"],
  },
  {
    id: "typesense", name: "Typesense", description: "Open-source search engine", category: "search", authMethod: "api_key",
    fields: [
      { key: "api_key", label: "API Key", type: "password", required: true },
      { key: "host", label: "Host", type: "url", required: true },
      { key: "port", label: "Port", type: "text", placeholder: "443", required: true }
    ],
    icon: "typesense", brandColor: "#D23E79", docsUrl: "https://typesense.org/docs/", features: ["Instant search", "Typo tolerance", "Geo search", "Faceting"], tier: "free", popular: false, onboardingSuggested: false, onboardingTags: ["backend"],
  },
  {
    id: "meilisearch", name: "Meilisearch", description: "Fast, typo-tolerant search", category: "search", authMethod: "api_key",
    fields: [
      { key: "host", label: "Host URL", type: "url", placeholder: "https://ms-xxxxx.meilisearch.io", required: true },
      { key: "api_key", label: "API Key", type: "password", required: true }
    ],
    icon: "meilisearch", brandColor: "#FF5CAA", docsUrl: "https://www.meilisearch.com/docs", features: ["Full-text search", "Typo tolerance", "Filtering", "Faceted search"], tier: "free", popular: false, onboardingSuggested: false, onboardingTags: ["backend"],
  },
  {
    id: "pinecone", name: "Pinecone", description: "Vector database for AI", category: "search", authMethod: "api_key",
    fields: [
      { key: "api_key", label: "API Key", type: "password", required: true },
      { key: "environment", label: "Environment", type: "text", placeholder: "us-east-1-aws", required: true }
    ],
    icon: "pinecone", brandColor: "#000000", docsUrl: "https://docs.pinecone.io/", features: ["Vector storage", "Similarity search", "Metadata filtering", "Namespaces"], tier: "pro", popular: false, onboardingSuggested: false, onboardingTags: ["data", "backend"],
  },
  {
    id: "weaviate", name: "Weaviate", description: "Vector search engine", category: "search", authMethod: "api_key",
    fields: [
      { key: "host", label: "Cluster URL", type: "url", required: true },
      { key: "api_key", label: "API Key", type: "password", required: true }
    ],
    icon: "weaviate", brandColor: "#00D1B2", docsUrl: "https://weaviate.io/developers/weaviate", features: ["Vector search", "Hybrid search", "Classification", "Multi-tenancy"], tier: "pro", popular: false, onboardingSuggested: false, onboardingTags: ["data", "backend"],
  },
  {
    id: "elasticsearch", name: "Elasticsearch", description: "Full-text search, analytics", category: "search", authMethod: "connection_string",
    fields: [
      { key: "node_url", label: "Node URL", type: "url", placeholder: "https://xxxxx.es.us-east-1.aws.found.io:9243", required: true },
      { key: "api_key", label: "API Key", type: "password", required: false },
      { key: "username", label: "Username", type: "text", required: false },
      { key: "password", label: "Password", type: "password", required: false }
    ],
    icon: "elasticsearch", brandColor: "#FEC514", docsUrl: "https://www.elastic.co/docs", features: ["Full-text search", "Analytics", "Aggregations", "Machine learning"], tier: "pro", popular: false, onboardingSuggested: false, onboardingTags: ["backend", "data", "devops"],
  },

  // ──────────────────────────────────────────────────────
  // SCHEDULING & AUTOMATION (5 services)
  // ──────────────────────────────────────────────────────

  {
    id: "zapier", name: "Zapier", description: "Workflow automation, 5000+ app connections", category: "automation", authMethod: "api_key",
    fields: [{ key: "api_key", label: "API Key", type: "password", required: true }],
    icon: "zapier", brandColor: "#FF4A00", docsUrl: "https://platform.zapier.com/docs/", features: ["Trigger Zaps", "Webhooks", "5000+ app integrations", "Multi-step workflows"], tier: "free", popular: true, onboardingSuggested: false, onboardingTags: ["fullstack"],
  },
  {
    id: "make", name: "Make (Integromat)", description: "Visual automation platform", category: "automation", authMethod: "api_key",
    fields: [{ key: "api_token", label: "API Token", type: "password", required: true }],
    icon: "make", brandColor: "#6D00CC", docsUrl: "https://www.make.com/en/api-documentation", features: ["Visual workflows", "Webhooks", "HTTP modules", "Data transformation"], tier: "free", popular: false, onboardingSuggested: false, onboardingTags: [],
  },
  {
    id: "n8n", name: "n8n", description: "Self-hostable workflow automation", category: "automation", authMethod: "api_key",
    fields: [
      { key: "base_url", label: "n8n Instance URL", type: "url", required: true },
      { key: "api_key", label: "API Key", type: "password", required: true }
    ],
    icon: "n8n", brandColor: "#EA4B71", docsUrl: "https://docs.n8n.io/", features: ["Workflow automation", "Webhooks", "Self-hosted", "200+ integrations"], tier: "free", popular: false, onboardingSuggested: false, onboardingTags: ["devops"],
  },
  {
    id: "calcom", name: "Cal.com", description: "Open-source scheduling", category: "automation", authMethod: "api_key",
    fields: [{ key: "api_key", label: "API Key", type: "password", required: true, helpUrl: "https://cal.com/settings/developer/api-keys" }],
    icon: "calcom", brandColor: "#292929", docsUrl: "https://cal.com/docs", features: ["Create event types", "Manage bookings", "Availability", "Webhooks"], tier: "free", popular: false, onboardingSuggested: false, onboardingTags: [],
  },
  {
    id: "cronitor", name: "Cronitor", description: "Cron job monitoring", category: "automation", authMethod: "api_key",
    fields: [{ key: "api_key", label: "API Key", type: "password", required: true }],
    icon: "cronitor", brandColor: "#4B32C3", docsUrl: "https://cronitor.io/docs", features: ["Monitor cron jobs", "Uptime monitoring", "Alerts", "Status pages"], tier: "free", popular: false, onboardingSuggested: false, onboardingTags: ["devops"],
  },

  // ──────────────────────────────────────────────────────
  // DOMAIN & DNS (4 services)
  // ──────────────────────────────────────────────────────

  {
    id: "cloudflare-dns", name: "Cloudflare", description: "DNS, CDN, DDoS protection, Workers", category: "dns", authMethod: "api_key",
    fields: [
      { key: "api_token", label: "API Token", type: "password", required: true, helpUrl: "https://dash.cloudflare.com/profile/api-tokens" },
      { key: "zone_id", label: "Zone ID (optional)", type: "text", required: false }
    ],
    icon: "cloudflare", brandColor: "#F38020", docsUrl: "https://developers.cloudflare.com/", features: ["DNS management", "CDN caching", "SSL/TLS", "Workers", "DDoS protection"], tier: "free", popular: true, onboardingSuggested: false, onboardingTags: ["devops", "web"],
  },
  {
    id: "namecheap", name: "Namecheap", description: "Domain registration, DNS management", category: "dns", authMethod: "api_key",
    fields: [
      { key: "api_user", label: "API User", type: "text", required: true },
      { key: "api_key", label: "API Key", type: "password", required: true },
      { key: "client_ip", label: "Whitelisted IP", type: "text", required: true }
    ],
    icon: "namecheap", brandColor: "#DE3723", docsUrl: "https://www.namecheap.com/support/api/", features: ["Domain registration", "DNS records", "Domain transfer", "SSL certificates"], tier: "pro", popular: false, onboardingSuggested: false, onboardingTags: ["devops"],
  },
  {
    id: "google-domains", name: "Google Domains", description: "Domain registration", category: "dns", authMethod: "oauth",
    fields: [],
    oauthConfig: { authUrl: "https://accounts.google.com/o/oauth2/v2/auth", tokenUrl: "https://oauth2.googleapis.com/token", scopes: ["https://www.googleapis.com/auth/domains"], clientIdEnvVar: "GOOGLE_CLIENT_ID", clientSecretEnvVar: "GOOGLE_CLIENT_SECRET" },
    icon: "google", brandColor: "#4285F4", docsUrl: "https://developers.google.com/domains", features: ["Domain registration", "DNS management", "Domain forwarding"], tier: "pro", popular: false, onboardingSuggested: false, onboardingTags: ["devops"],
  },
  {
    id: "route53", name: "Route 53 (AWS)", description: "DNS management, health checks", category: "dns", authMethod: "access_key",
    fields: [
      { key: "access_key_id", label: "Access Key ID", type: "password", required: true },
      { key: "secret_access_key", label: "Secret Access Key", type: "password", required: true }
    ],
    icon: "aws", brandColor: "#FF9900", docsUrl: "https://docs.aws.amazon.com/Route53/", features: ["DNS management", "Health checks", "Traffic routing", "Domain registration"], tier: "pro", popular: false, onboardingSuggested: false, onboardingTags: ["devops"],
  },
];

// ============================================================
// HELPER FUNCTIONS
// ============================================================

export function getIntegrationById(id: string): IntegrationDefinition | undefined {
  return INTEGRATION_REGISTRY.find(i => i.id === id);
}

export function getIntegrationsByCategory(category: IntegrationCategory): IntegrationDefinition[] {
  return INTEGRATION_REGISTRY.filter(i => i.category === category);
}

export function getPopularIntegrations(): IntegrationDefinition[] {
  return INTEGRATION_REGISTRY.filter(i => i.popular);
}

export function getOnboardingSuggestions(tags: string[]): IntegrationDefinition[] {
  return INTEGRATION_REGISTRY
    .filter(i => i.onboardingSuggested && i.onboardingTags.some(t => tags.includes(t)))
    .sort((a, b) => {
      const aMatch = a.onboardingTags.filter(t => tags.includes(t)).length;
      const bMatch = b.onboardingTags.filter(t => tags.includes(t)).length;
      return bMatch - aMatch;  // More matching tags = higher priority
    });
}

export const CATEGORY_LABELS: Record<IntegrationCategory, { label: string; icon: string; description: string }> = {
  hosting:      { label: "Hosting & Deployment", icon: "🚀", description: "Deploy your apps to any cloud platform" },
  database:     { label: "Databases",            icon: "🗄️", description: "Connect to any database service" },
  ai:           { label: "AI & Machine Learning", icon: "🤖", description: "Plug in any LLM or AI service" },
  email:        { label: "Email & Communication", icon: "📧", description: "Send emails, SMS, and team messages" },
  analytics:    { label: "Analytics & Monitoring", icon: "📊", description: "Track errors, performance, and user behavior" },
  storage:      { label: "Storage & CDN",         icon: "💾", description: "Store files, images, and media" },
  cicd:         { label: "CI/CD & Version Control",icon: "🔄", description: "Connect your repos and pipelines" },
  payment:      { label: "Payment & Billing",     icon: "💳", description: "Accept payments and manage subscriptions" },
  auth:         { label: "Authentication",        icon: "🔐", description: "Add user auth to your projects" },
  cms:          { label: "CMS & Content",         icon: "📝", description: "Manage content from headless CMS platforms" },
  productivity: { label: "Project Management",    icon: "📋", description: "Connect issue trackers and productivity tools" },
  search:       { label: "Search & Data",         icon: "🔍", description: "Add search, vectors, and data pipelines" },
  automation:   { label: "Scheduling & Automation",icon: "⚡", description: "Automate workflows and schedule tasks" },
  dns:          { label: "Domain & DNS",          icon: "🌐", description: "Manage domains, DNS, and CDN" },
};
```

---

## Part 2: Integration Connection Service

### 2.1 Connection Manager

```typescript
// server/services/integration-manager.ts

import { db } from "../db/connection";
import { integrations } from "../db/schema";
import { eq, and } from "drizzle-orm";
import { getIntegrationById, IntegrationDefinition } from "./integration-registry";
import crypto from "crypto";

// Encrypt sensitive values before storing in DB
const ENCRYPTION_KEY = process.env.INTEGRATION_ENCRYPTION_KEY || process.env.SESSION_SECRET!;

function encrypt(text: string): string {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv("aes-256-cbc", crypto.scryptSync(ENCRYPTION_KEY, "salt", 32), iv);
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  return iv.toString("hex") + ":" + encrypted;
}

function decrypt(text: string): string {
  const [ivHex, encrypted] = text.split(":");
  const iv = Buffer.from(ivHex, "hex");
  const decipher = crypto.createDecipheriv("aes-256-cbc", crypto.scryptSync(ENCRYPTION_KEY, "salt", 32), iv);
  let decrypted = decipher.update(encrypted, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
}

export class IntegrationManager {

  // Connect a service (API key / connection string method)
  async connectService(userId: number, serviceId: string, credentials: Record<string, string>) {
    const definition = getIntegrationById(serviceId);
    if (!definition) throw new Error(`Unknown service: ${serviceId}`);

    // Encrypt all credential values
    const encryptedConfig: Record<string, string> = {};
    for (const [key, value] of Object.entries(credentials)) {
      encryptedConfig[key] = encrypt(value);
    }

    // Upsert the integration record
    const existing = await db.select().from(integrations)
      .where(and(eq(integrations.userId, userId), eq(integrations.serviceId, serviceId)))
      .limit(1);

    if (existing.length > 0) {
      await db.update(integrations)
        .set({ config: encryptedConfig, status: "connected", lastSyncAt: new Date() })
        .where(eq(integrations.id, existing[0].id));
      return existing[0].id;
    } else {
      const [result] = await db.insert(integrations).values({
        userId,
        serviceId,
        category: definition.category,
        status: "connected",
        config: encryptedConfig,
        lastSyncAt: new Date(),
      }).returning();
      return result.id;
    }
  }

  // Test connection health
  async testConnection(userId: number, serviceId: string): Promise<{ ok: boolean; message: string }> {
    const definition = getIntegrationById(serviceId);
    if (!definition) return { ok: false, message: "Unknown service" };

    const record = await db.select().from(integrations)
      .where(and(eq(integrations.userId, userId), eq(integrations.serviceId, serviceId)))
      .limit(1);

    if (!record.length) return { ok: false, message: "Not connected" };

    // Decrypt credentials and test the endpoint
    if (!definition.testEndpoint) return { ok: true, message: "No test endpoint defined — assumed connected" };

    try {
      const config = record[0].config as Record<string, string>;
      const apiKey = decrypt(config.api_key || config.api_token || config.secret_key || "");

      const response = await fetch(definition.testEndpoint, {
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        await db.update(integrations)
          .set({ status: "connected", lastSyncAt: new Date() })
          .where(eq(integrations.id, record[0].id));
        return { ok: true, message: "Connection successful" };
      } else {
        await db.update(integrations)
          .set({ status: "error" })
          .where(eq(integrations.id, record[0].id));
        return { ok: false, message: `API returned ${response.status}` };
      }
    } catch (err) {
      await db.update(integrations)
        .set({ status: "error" })
        .where(eq(integrations.id, record[0].id));
      return { ok: false, message: (err as Error).message };
    }
  }

  // Disconnect a service
  async disconnectService(userId: number, serviceId: string) {
    await db.update(integrations)
      .set({ status: "disconnected", config: {} })
      .where(and(eq(integrations.userId, userId), eq(integrations.serviceId, serviceId)));
  }

  // Get user's connection state for all integrations
  async getUserIntegrations(userId: number) {
    return db.select().from(integrations).where(eq(integrations.userId, userId));
  }

  // Get decrypted credentials for internal use (e.g., AI service, deployment)
  async getCredentials(userId: number, serviceId: string): Promise<Record<string, string> | null> {
    const record = await db.select().from(integrations)
      .where(and(eq(integrations.userId, userId), eq(integrations.serviceId, serviceId)))
      .limit(1);

    if (!record.length || record[0].status !== "connected") return null;

    const config = record[0].config as Record<string, string>;
    const decrypted: Record<string, string> = {};
    for (const [key, value] of Object.entries(config)) {
      decrypted[key] = decrypt(value);
    }
    return decrypted;
  }
}

export const integrationManager = new IntegrationManager();
```

### 2.2 OAuth Flow Handler

```typescript
// server/services/integration-oauth.ts

import { getIntegrationById } from "./integration-registry";
import { integrationManager } from "./integration-manager";

// Generate OAuth authorization URL
export function getOAuthUrl(serviceId: string, userId: number, callbackBaseUrl: string): string {
  const definition = getIntegrationById(serviceId);
  if (!definition || !definition.oauthConfig) throw new Error("Service does not support OAuth");

  const { authUrl, scopes, clientIdEnvVar } = definition.oauthConfig;
  const clientId = process.env[clientIdEnvVar];
  if (!clientId) throw new Error(`Missing env var: ${clientIdEnvVar}`);

  const state = Buffer.from(JSON.stringify({ serviceId, userId })).toString("base64url");
  const redirectUri = `${callbackBaseUrl}/api/integrations/oauth/callback`;

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: scopes.join(" "),
    state,
  });

  return `${authUrl}?${params.toString()}`;
}

// Handle OAuth callback — exchange code for token
export async function handleOAuthCallback(code: string, state: string, callbackBaseUrl: string) {
  const { serviceId, userId } = JSON.parse(Buffer.from(state, "base64url").toString());
  const definition = getIntegrationById(serviceId);
  if (!definition || !definition.oauthConfig) throw new Error("Invalid OAuth callback");

  const { tokenUrl, clientIdEnvVar, clientSecretEnvVar } = definition.oauthConfig;
  const clientId = process.env[clientIdEnvVar]!;
  const clientSecret = process.env[clientSecretEnvVar]!;

  const response = await fetch(tokenUrl, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: `${callbackBaseUrl}/api/integrations/oauth/callback`,
      client_id: clientId,
      client_secret: clientSecret,
    }),
  });

  const tokens = await response.json();

  await integrationManager.connectService(userId, serviceId, {
    access_token: tokens.access_token,
    refresh_token: tokens.refresh_token || "",
    expires_in: String(tokens.expires_in || ""),
    token_type: tokens.token_type || "Bearer",
  });

  return { serviceId, userId };
}
```

### 2.3 Updated API Routes

```typescript
// Add to server/routes.ts

import { INTEGRATION_REGISTRY, getIntegrationById, getIntegrationsByCategory, getPopularIntegrations, getOnboardingSuggestions, CATEGORY_LABELS } from "./services/integration-registry";
import { integrationManager } from "./services/integration-manager";
import { getOAuthUrl, handleOAuthCallback } from "./services/integration-oauth";

// --- INTEGRATION ROUTES ---

// GET /api/integrations — full catalog merged with user's connection status
app.get("/api/integrations", isAuthenticated, async (req, res) => {
  const userIntegrations = await integrationManager.getUserIntegrations(req.user.id);
  const userMap = new Map(userIntegrations.map(i => [i.serviceId, i]));

  const catalog = INTEGRATION_REGISTRY.map(def => ({
    ...def,
    fields: def.fields.map(f => ({ ...f })),  // Don't expose stored values
    status: userMap.get(def.id)?.status || "disconnected",
    connectedAt: userMap.get(def.id)?.lastSyncAt || null,
  }));

  res.json({ integrations: catalog, categories: CATEGORY_LABELS });
});

// GET /api/integrations/connected — only user's connected services
app.get("/api/integrations/connected", isAuthenticated, async (req, res) => {
  const connected = await integrationManager.getUserIntegrations(req.user.id);
  res.json(connected.filter(i => i.status === "connected"));
});

// POST /api/integrations/:serviceId/connect — connect via API key / credentials
app.post("/api/integrations/:serviceId/connect", isAuthenticated, async (req, res) => {
  const definition = getIntegrationById(req.params.serviceId);
  if (!definition) return res.status(404).json({ error: "Unknown service" });

  if (definition.authMethod === "oauth") {
    // For OAuth services, return the authorization URL instead
    const url = getOAuthUrl(req.params.serviceId, req.user.id, `${req.protocol}://${req.get("host")}`);
    return res.json({ oauthUrl: url });
  }

  // Validate required fields
  for (const field of definition.fields) {
    if (field.required && !req.body[field.key]) {
      return res.status(400).json({ error: `Missing required field: ${field.label}` });
    }
  }

  try {
    const id = await integrationManager.connectService(req.user.id, req.params.serviceId, req.body);
    res.json({ id, status: "connected" });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

// GET /api/integrations/oauth/callback — OAuth redirect handler
app.get("/api/integrations/oauth/callback", async (req, res) => {
  const { code, state } = req.query;
  try {
    const result = await handleOAuthCallback(code as string, state as string, `${req.protocol}://${req.get("host")}`);
    // Redirect back to integrations page with success
    res.redirect(`/integrations?connected=${result.serviceId}`);
  } catch (err) {
    res.redirect(`/integrations?error=${encodeURIComponent((err as Error).message)}`);
  }
});

// POST /api/integrations/:serviceId/disconnect
app.post("/api/integrations/:serviceId/disconnect", isAuthenticated, async (req, res) => {
  await integrationManager.disconnectService(req.user.id, req.params.serviceId);
  res.json({ status: "disconnected" });
});

// POST /api/integrations/:serviceId/test — test connection health
app.post("/api/integrations/:serviceId/test", isAuthenticated, async (req, res) => {
  const result = await integrationManager.testConnection(req.user.id, req.params.serviceId);
  res.json(result);
});

// GET /api/integrations/onboarding — get personalized suggestions for new user
app.get("/api/integrations/onboarding", isAuthenticated, async (req, res) => {
  const tags = (req.query.tags as string || "fullstack").split(",");
  const suggestions = getOnboardingSuggestions(tags);
  res.json(suggestions);
});
```

---

## Part 3: Integrations Tab (4th IDE Tab)

### 3.1 Header Update

Add **Integrations** as a 4th tab in the IDE header, next to Coding, Chat, and Deploy:

```
┌─────────────────────────────────────────────────────────────────┐
│ HEADER: [Matt Logo]  [Coding][Chat][Deploy][Integrations] [⚙️]  │
├──────────┬────────────────────────────────────────────────────────┤
```

When the **Integrations** tab is active, the 3-column layout collapses into a single full-width view (the middle + right columns merge) showing the integrations marketplace.

### 3.2 Integrations Page Layout

```
┌─────────────────────────────────────────────────────────────────────┐
│ [Search integrations...]                     [Filter: All ▾]       │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│ ── CONNECTED (3)  ──────────────────────────────────────────────── │
│ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐                │
│ │ ● GitHub     │ │ ● OpenAI     │ │ ● Neon       │                │
│ │   Connected  │ │   Connected  │ │   Connected  │                │
│ │ [Configure]  │ │ [Configure]  │ │ [Configure]  │                │
│ └──────────────┘ └──────────────┘ └──────────────┘                │
│                                                                     │
│ ── 🚀 Hosting & Deployment (12) ───────────────────────────────── │
│ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌────────────┐│
│ │ DigitalOcean │ │ Render       │ │ Vercel       │ │ Netlify    ││
│ │ Cloud infra  │ │ Zero-config  │ │ Frontend     │ │ Web host   ││
│ │ [Connect]    │ │ [Connect]    │ │ [Connect]    │ │ [Connect]  ││
│ └──────────────┘ └──────────────┘ └──────────────┘ └────────────┘│
│ ... more cards ...                                                 │
│                                                                     │
│ ── 🗄️ Databases (9) ───────────────────────────────────────────── │
│ ... category cards ...                                             │
│                                                                     │
│ ── 🤖 AI & Machine Learning (12) ──────────────────────────────── │
│ ... category cards ...                                             │
│                                                                     │
│ ... remaining categories ...                                       │
└─────────────────────────────────────────────────────────────────────┘
```

### 3.3 Integration Card Component

```tsx
// client/src/components/IntegrationCard.tsx

interface IntegrationCardProps {
  integration: IntegrationDefinition & { status: string; connectedAt?: string };
  onConnect: (serviceId: string) => void;
  onDisconnect: (serviceId: string) => void;
  onConfigure: (serviceId: string) => void;
}

// Each card renders:
// - Service icon (top-left) with brand color accent line on left border
// - Service name (bold)
// - One-line description (muted text)
// - Category pill badge (small, top-right)
// - Status indicator:
//     - Green dot + "Connected" if status === "connected"
//     - Gray dot + "Not connected" if status === "disconnected"
//     - Red dot + "Error" if status === "error"
// - Action button:
//     - "Connect" (accent-blue) if disconnected → opens connection modal
//     - "Disconnect" (muted, with confirmation) if connected
// - "Configure" text link if connected → opens config panel
// - Tier badge if pro/team (small lock icon)
//
// Card dimensions: fixed height (~140px), responsive width in grid
// Hover: subtle elevation, border color brightens
// Transition: 150ms ease
```

### 3.4 Connection Modal

When a user clicks "Connect" on a card, a modal slides in from the right (or shows as a centered dialog) containing:

1. **Service name + icon** at top
2. **Description** and link to docs
3. **Credential fields** — dynamically generated from the integration's `fields` array:
   - Each field renders as a labeled input
   - Password fields have show/hide toggle
   - Placeholder text and help text from the registry
   - Help URL opens in new tab ("Where do I find this?")
4. **"Test Connection"** button — calls `/api/integrations/:id/test`, shows success/error toast
5. **"Connect"** primary button — saves and connects
6. **"Cancel"** secondary button

For **OAuth services**, the "Connect" button instead redirects to the OAuth authorization URL. After the user authorizes, they're redirected back to `/integrations?connected=<serviceId>` and the card updates to show "Connected".

### 3.5 Filter & Search

- **Search bar**: Fuzzy match on service name, description, and category
- **Category filter dropdown/pills**: "All", "Hosting", "Databases", "AI", "Email", etc.
- **Status filter**: "All" | "Connected" | "Not Connected"
- **Sort**: "Popular first" (default) | "A-Z" | "Recently connected"

---

## Part 4: Onboarding Wizard

### 4.1 Trigger

The onboarding wizard is shown **once** to new users after their first successful sign-up and login. It is NOT shown on subsequent logins.

Track this with a `onboardingCompleted` boolean field on the users table:

```typescript
// Add to users table in schema.ts
onboardingCompleted: boolean("onboarding_completed").default(false),
```

After the user signs up, if `onboardingCompleted === false`, render the wizard overlay instead of the IDE.

### 4.2 Wizard Flow (3 Steps)

#### Step 1: Welcome + Profile

```
┌────────────────────────────────────────────────────────┐
│                                                        │
│             Welcome to Matt 👋                         │
│                                                        │
│   Tell us what you're building so we can suggest       │
│   the right integrations for your workflow.            │
│                                                        │
│   What describes you best? (select all that apply)     │
│                                                        │
│   ┌──────────────┐  ┌──────────────┐                  │
│   │ 🎨 Frontend  │  │ ⚙️ Backend   │                  │
│   └──────────────┘  └──────────────┘                  │
│   ┌──────────────┐  ┌──────────────┐                  │
│   │ 🔗 Fullstack │  │ 📱 Mobile    │                  │
│   └──────────────┘  └──────────────┘                  │
│   ┌──────────────┐  ┌──────────────┐                  │
│   │ 📊 Data      │  │ 🛠️ DevOps   │                  │
│   └──────────────┘  └──────────────┘                  │
│                                                        │
│                              [Next →]                  │
│                                                        │
│   ○ ○ ○     Skip onboarding                           │
└────────────────────────────────────────────────────────┘
```

The selected tags (e.g. `["fullstack", "backend"]`) are saved to `user.settings.onboardingTags` and used to filter suggestions.

#### Step 2: Suggested Integrations (Swipeable Cards)

Based on the profile tags selected in Step 1, show a horizontal stack of suggested integration cards that the user can **swipe to dismiss** (or click an X). They can also tap "Connect" to set up the integration right there.

```
┌────────────────────────────────────────────────────────┐
│                                                        │
│   Suggested for you                                    │
│   Swipe away any you don't need right now              │
│                                                        │
│     ← swipe left to dismiss                            │
│                                                        │
│   ┌─────────────────────────────────────────────┐      │
│   │  ✕                                          │      │
│   │  🐙 GitHub                                  │      │
│   │  Repos, Actions, Issues, PRs                │      │
│   │                                              │      │
│   │  Push code, trigger CI/CD, manage repos     │      │
│   │  directly from Matt.                         │      │
│   │                                              │      │
│   │         [Connect GitHub]                     │      │
│   │         [Skip for now]                       │      │
│   └─────────────────────────────────────────────┘      │
│                                                        │
│   ┈┈┈  8 more suggestions  ┈┈┈                        │
│                                                        │
│   ○ ● ○     Skip all                                  │
│                              [Next →]                  │
└────────────────────────────────────────────────────────┘
```

**Swipe behavior:**
- On mobile: Horizontal swipe left or right to dismiss a card
- On desktop: Click the ✕ button, or drag the card to the side
- Cards animate out with a 200ms ease-out slide + fade
- Next card slides in from below / right
- Counter shows "X of Y remaining"
- User can "Connect" inline (opens the credential fields right in the card) or "Skip for now"
- "Skip all" at the bottom jumps to Step 3

**Implementation:**
```tsx
// client/src/components/OnboardingSwipeCard.tsx
// Use a combination of:
// - CSS transforms for drag position
// - Touch events (touchstart, touchmove, touchend) for mobile swipe
// - Mouse events (mousedown, mousemove, mouseup) for desktop drag
// - Threshold: if card is dragged > 100px or velocity > threshold, dismiss
// - Spring animation back to center if below threshold
// - Opacity decreases as card moves away from center
// - Rotation: subtle 5-15° rotation as card is dragged (like Tinder)
```

#### Step 3: Ready to Code

```
┌────────────────────────────────────────────────────────┐
│                                                        │
│             You're all set! 🎉                         │
│                                                        │
│   Connected: GitHub, OpenAI, Neon                      │
│   Skipped: 5 integrations                              │
│                                                        │
│   You can always add more integrations from the        │
│   Integrations tab in the IDE header.                  │
│                                                        │
│                                                        │
│                    [Start Coding →]                     │
│                                                        │
│   ○ ○ ●                                               │
└────────────────────────────────────────────────────────┘
```

Clicking "Start Coding" sets `onboardingCompleted = true` on the user record and loads the IDE in Coding mode.

### 4.3 API Endpoints for Onboarding

```
GET  /api/onboarding/suggestions?tags=fullstack,backend  — returns suggested integrations
POST /api/onboarding/complete                             — marks onboarding as done
POST /api/onboarding/skip                                 — marks onboarding as skipped
```

### 4.4 Onboarding State Machine

```
NEW_USER → STEP_1_PROFILE → STEP_2_INTEGRATIONS → STEP_3_SUMMARY → COMPLETED
                                                                    ↑
                    (skip at any point) ─────────────────────────────┘
```

Store current step in React state (not in DB — if they refresh, start from Step 1 again unless `onboardingCompleted` is already true).

---

## Part 5: Cross-Feature Integration

### 5.1 AI Chat Uses Connected AI Integrations

When a user sends a message in Chat mode, the AI service should check which AI integrations the user has connected:

1. Check user's settings for preferred provider + model
2. Use `integrationManager.getCredentials(userId, "openai")` (or whichever provider) to get the API key
3. If user hasn't set a key in Settings but has connected the integration, use the integration's stored key
4. Priority: User Settings API key > Integration stored key > Platform fallback key (env var)

### 5.2 Deploy Mode Uses Connected Hosting Integrations

The Deploy tab should dynamically show hosting platforms based on connection status:

- Connected hosting services appear at the top with a green indicator and "Deploy" button
- Disconnected services show "Connect" and link to the Integrations tab
- When deploying, use `integrationManager.getCredentials()` to get the service's API key/token

### 5.3 Admin Dashboard — Integrations Analytics

Add an **Integrations** section to the admin dashboard showing:

- Total integrations connected across all users
- Most popular integrations (ranked by connection count)
- Connection error rate per service
- Category breakdown chart
- Recent connection activity

---

## Part 6: Database Migration

Add these columns/tables on top of the existing schema:

```typescript
// Add to users table:
onboardingCompleted: boolean("onboarding_completed").default(false),
onboardingTags: jsonb("onboarding_tags").default([]),  // e.g. ["fullstack", "backend"]

// The integrations table already exists in the base schema — no changes needed.
```

---

## Part 7: Environment Variables (Additional)

Add to Replit Secrets for OAuth integrations:

| Key | Description | Required |
|---|---|---|
| `INTEGRATION_ENCRYPTION_KEY` | 32+ char key for encrypting stored credentials | Yes |
| `GITHUB_CLIENT_ID` | GitHub OAuth App client ID | For GitHub OAuth |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth App client secret | For GitHub OAuth |
| `VERCEL_CLIENT_ID` | Vercel Integration client ID | For Vercel OAuth |
| `VERCEL_CLIENT_SECRET` | Vercel Integration client secret | For Vercel OAuth |
| `DIGITALOCEAN_CLIENT_ID` | DigitalOcean OAuth App client ID | For DO OAuth |
| `DIGITALOCEAN_CLIENT_SECRET` | DigitalOcean OAuth App client secret | For DO OAuth |
| `NETLIFY_CLIENT_ID` | Netlify OAuth App client ID | For Netlify OAuth |
| `NETLIFY_CLIENT_SECRET` | Netlify OAuth App secret | For Netlify OAuth |
| `SLACK_CLIENT_ID` | Slack App client ID | For Slack OAuth |
| `SLACK_CLIENT_SECRET` | Slack App client secret | For Slack OAuth |

OAuth services that don't have env vars configured will show a "Coming soon" badge instead of a "Connect" button.

---

## Part 8: Seed Data Updates

Add to the seed script:

```typescript
// Sample connected integrations for demo user
const demoIntegrations = [
  { serviceId: "github", category: "cicd", status: "connected", config: encrypt(JSON.stringify({ access_token: "gho_demo_token" })) },
  { serviceId: "openai", category: "ai", status: "connected", config: encrypt(JSON.stringify({ api_key: "sk-demo-key" })) },
  { serviceId: "neon", category: "database", status: "connected", config: encrypt(JSON.stringify({ connection_string: "postgresql://demo@neon.tech/demo" })) },
  { serviceId: "vercel", category: "hosting", status: "connected", config: encrypt(JSON.stringify({ access_token: "demo-vercel-token" })) },
  { serviceId: "sentry", category: "analytics", status: "connected", config: encrypt(JSON.stringify({ dsn: "https://demo@sentry.io/0" })) },
];

// Admin user gets the same + more
const adminIntegrations = [
  ...demoIntegrations,
  { serviceId: "sendgrid", category: "email", status: "connected", config: encrypt(JSON.stringify({ api_key: "SG.demo" })) },
  { serviceId: "stripe", category: "payment", status: "connected", config: encrypt(JSON.stringify({ secret_key: "sk_test_demo", publishable_key: "pk_test_demo" })) },
  { serviceId: "slack", category: "email", status: "connected", config: encrypt(JSON.stringify({ access_token: "xoxb-demo" })) },
];
```

---

## Build Verification Checklist

After building, verify:

1. [ ] Integration registry returns all ~100 services via `GET /api/integrations`
2. [ ] Integration cards render in a responsive grid on the Integrations tab
3. [ ] Search filters integrations by name and description
4. [ ] Category filter shows only services in that category
5. [ ] "Connected" section shows at the top with green indicators
6. [ ] Clicking "Connect" on an API key service opens the credential modal
7. [ ] Credential fields match the registry definition (labels, types, placeholders, help text)
8. [ ] "Test Connection" button works for services with testEndpoint
9. [ ] Clicking "Connect" on an OAuth service initiates the OAuth flow (or shows "Coming soon" if env vars missing)
10. [ ] Disconnecting a service removes credentials and updates status
11. [ ] Onboarding wizard appears for new sign-ups (onboardingCompleted === false)
12. [ ] Step 1 profile tags can be selected
13. [ ] Step 2 shows personalized suggestions based on selected tags
14. [ ] Cards can be swiped/dismissed on mobile and desktop
15. [ ] "Connect" within a swipe card opens inline credential fields
16. [ ] "Skip all" and "Skip for now" work correctly
17. [ ] Step 3 summary shows what was connected vs skipped
18. [ ] "Start Coding" sets onboardingCompleted = true
19. [ ] Onboarding does NOT show on subsequent logins
20. [ ] Admin dashboard shows integration analytics
21. [ ] Chat mode uses connected AI integration credentials
22. [ ] Deploy mode shows connected hosting services first
23. [ ] All credentials are encrypted at rest in the database
24. [ ] OAuth callback URL is correctly configured for each provider
