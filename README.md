# 🚀 AI-Powered GitHub Profile Analyzer API

A performance-optimized, enterprise-grade REST API built using **Node.js (v5+), Express, TypeScript, and MySQL**. The application fetches public developer analytics via the **Octokit REST SDK**, generates structured technical audits using the **Google Gemini 2.5 Flash LLM**, and manages records through an optimized **Read-Through Caching layer**.

This backend implements advanced software engineering design patterns specifically tailored to handle upstream API rate limits, minimize network latency, and maintain clean, boilerplate-free control-flow lifecycles.

---

## 🏛️ Key System Architecture Highlights

*   **Read-Through Cache Pattern:** Minimizes third-party network overhead and guards against GitHub rate limits by routing all data reads to a local MySQL pool. Upstream third-party integration pipelines are strictly restricted to cache misses or stale data conditions.
*   **Cost-Optimized AI Infrastructure:** Integrates the Google Gen AI SDK to generate structured profile insights. By saving the generated JSON output directly into a MySQL database block, the LLM is only queried once per day per user, ensuring zero runtime cost on subsequent cache hits.
*   **Idempotent Data Lifecycle via Upserts:** Utilizes Sequelize `upsert` transactions to cleanly create or modify active row metrics dynamically, protecting the relational database tier against primary key collisions.
*   **Decoupled Centralized Error Handling:** Leverages a higher-order functional wrapper (`catchAsync`) to entirely eliminate explicit `try/catch` boilerplate blocks inside individual endpoint controllers. System exceptions automatically route to a single global interceptor middleware.
*   **Structured AI Intelligence Parsing:** Leverages strict JSON schema execution parameters within the Google Gen AI SDK to guarantee that LLM output metrics seamlessly match backend column contracts. 

---

## 🗂️ Project Directory Layout

The codebase strictly follows the **Controller-Service-Repository** pattern to ensure a modular separation of concerns and maintain tight type safety across deep directory scales:

```text
Github-ProfileAnalyzer/          # Root Workspace Directory
├── .postman/                     # Metadata context sync mappings
├── postman/                      # Native Git-Synced Postman Collections & Environments
├── src/                          # Application TypeScript Source Root
│   ├── config/                   # Database engine instantiation & configuration blocks
│   │   └── db.ts
│   ├── controllers/              # Business logic orchestrators and HTTP status maps
│   │   └── profile.controller.ts
│   ├── middleware/               # Global security layers, request logging, and error pools
│   ├── models/                   # Relational Sequelize schemas utilizing TypeScript attributes
│   │   └── GithubProfile.ts
│   ├── routes/                   # Clean, versioned Express REST API routing layouts
│   ├── services/                 # Third-party SDK integrations (Octokit Engine)
│   ├── types/                    # Shared interface data contracts and model extensions
│   │   └── github.types.ts
│   ├── utils/                    # AI prompting handlers and async wrapper utilities
│   │   ├── aiEngine.ts
│   │   └── catchAsync.ts
│   ├── validators/               # Route screening guards backed by Zod schemas
│   │   └── profile.validator.ts
│   ├── app.ts                    # Core Express initialization, global configs, and mounts
│   └── server.ts                 # Application bootstrap (Database sync & server listener)
├── .env                          # Local Environment configuration parameters (Git Ignored)
├── .env.example                  # Key distribution blueprints for cloning setup
├── .gitignore                    # Local directory file inclusion exclusions
├── package-lock.json             # Locked-down precise version installation mapping tree
├── package.json                  # Script runners and core manifest requirements definitions
└── tsconfig.json                 # TypeScript compilation option targets configuration

```

---

## ⚙️ Core Stack & Dependencies

*   **Runtime & Framework:** Node.js (ES Modules, `"type": "module"`), Express v5
*   **Languages & Tooling:** TypeScript v6, `tsx` (modern native watch execution engine)
*   **Database & ORM:** MySQL 8, Sequelize v6 (utilizing type-safe `declare` properties)
*   **AI Integration:** `@google/genai` (Official SDK utilizing `gemini-2.5-flash`)
*   **Security & Metrics:** Helmet (Header hardening), CORS, Morgan (Dev stream logs), Zod

---

## 🔌 API Reference & Lifecycle Endpoints

All actions operate under a uniform base path prefix: `GET/PUT/DELETE /api/profiles`

### 1. Index / Leaderboard
*   **Route:** `GET /api/profiles`
*   **Validation:** Guards check that parameters are valid base-10 integers.
*   **Query Parameters:** `?limit=5&page=1&sortBy=totalStars&order=DESC`
*   **Purpose:** Retrieves a paginated chunk of stored database profiles. If a user passes a bad parameter (e.g., `page=0` or a negative index), defensive boundary logic safely drops the query back to page 1 to protect the pagination math.

### 2. Cache-First Read
*   **Route:** `GET /api/profiles/:username`
*   **Validation:** Strict regex screening blocks characters outside valid GitHub username syntax.
*   **Strategy Details:**
    *   **Cache Hit (< 24 Hours old):** Evaluates database timestamps in absolute Unix Epoch milliseconds. If fresh, serves data directly from storage (`"source": "database_cache"`).
    *   **Cache Miss / Stale Data:** Resolves the entry from GitHub and Gemini in parallel before performing an internal `upsert` (`"source": "github_api_create"`).

### 3. Active Force Refresh
*   **Route:** `PUT /api/profiles/:username`
*   **Purpose:** Completely bypasses the 24-hour timestamp assessment gate to execute an immediate, direct synchronization across all upstream channels.

### 4. Cache Eviction
*   **Route:** `DELETE /api/profiles/:username`
*   **Purpose:** Performs a hard-destroy transaction against the targeted username row to cleanly clean up cache resources.

---

## 🛑 Defensive Architecture & Custom Error Lifecycle

Incoming strings are screened by a centralized validation layer before reaching controllers or downstream services. If a request targets a malformed string or a non-existent account, the system bypasses raw, unhandled third-party crashes and maps responses down to a uniform, clean error schema:

```json
{
  "success": false,
  "message": "GitHub account \"invalid-username-example\" does not exist."
}
```

---

## 🧪 Postman Integration Testing Suite

This repository features native Postman Git-Sync integration workspace configuration files located under the `./postman` directory to make system verification completely frictionless.

### How to Import & Test:
1. Open your Postman Desktop Application.
2. Click the **Import** button in the top-left menu.
3. Select **Folder** and choose the `./postman` directory from this project workspace.
4. Postman will automatically read the configuration files and rebuild the entire `GitHub Profile Analyzer API` collection with all descriptions, variables, and markdown tables intact.
5. The collection features a built-in pre-request runtime script that automatically configures an environment-agnostic `{{baseUrl}}` targeting `http://localhost:3000`. Detailed response mockup schema examples are saved inside the imported tabs.
