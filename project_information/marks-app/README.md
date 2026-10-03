# Marks App — Enterprise JEE & NEET CBT Exam & Coaching Platform

> **Marks App** (part of the **EduAI V5** ecosystem) is an enterprise-grade, high-performance web platform designed for competitive entrance exam preparation (**JEE Main, JEE Advanced, NEET, BITSAT**) and large-scale coaching institute operations. Built with a modern **Docker-orchestrated Polyglot Architecture**, it combines **PostgreSQL** (relational ERP), **MongoDB** (question documents), **Redis** (in-memory rankings & queues), **Payload CMS** (headless editorial management), **Appsmith** (internal operations dashboards), and **Meilisearch** (fast full-text search).

---

## 🚀 Key Highlights

- **NTA CBT Exam Simulator**: True-to-life JEE/NEET testing environment (synchronized timer, 5-state question palette, section switching, review marking, offline resilience).
- **Multi-Role Portal (4+ Roles)**: Isolated namespaces for **Students** (`/app/*`), **Teachers** (`/teacher/*`), **Admins** (`/admin/*`), and **Parents** (`/parent/*`).
- **PostgreSQL Relational Core**: ACID-compliant multi-campus coaching hierarchy (Institutes → Branches → Batches → Exam Groups), attendance logs, and RBAC.
- **MongoDB Question & Attempt Vault**: High-throughput document store for 50,000+ questions with LaTeX equations, step-by-step solutions, and exam attempt histories.
- **Redis Real-Time Leaderboard Engine**: `O(log N)` instantaneous rank calculations via Redis Sorted Sets (`ZSET`), ephemeral exam state caching, and BullMQ background worker queues.
- **Payload Headless CMS (Port 3000)**: Editorial workflow for question curation, Formula Handbook, broadcast announcements, and diagram media CDN.
- **Appsmith Internal Operations (Port 8090)**: Low-code backoffice dashboards for institute license management, question QA reviews, and attempt dispute resolution.
- **Meilisearch Fast Search (Port 7700)**: Sub-10ms typo-tolerant search across 50,000+ questions by chapter, topic, or keyword.
- **NGINX Reverse Proxy & Gateway**: Centralized API gateway with path routing, rate limiting, and SSL termination.

---

## 🛠️ Enterprise Technology Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Containerization** | Docker & Docker Compose | Multi-container local & cloud microservice orchestration |
| **Relational Database** | PostgreSQL 16 | Core ERP: Institutes, Branches, Batches, Users, Attendance, RBAC |
| **Document Database** | MongoDB 7.0 | Question Bank, LaTeX formulas, CBT test attempts, solutions |
| **Cache & Leaderboards** | Redis 7.2 | Sorted Sets (`ZSET`) for live rankings, session caching, BullMQ |
| **Headless CMS** | Payload CMS v2/v3 | Editorial question authoring, formula handbook, media CDN |
| **Internal Operations** | Appsmith CE | Low-code administrative backoffice & billing consoles |
| **Search Engine** | Meilisearch v1.7 | Sub-10ms typo-tolerant search across question bank |
| **Reverse Proxy** | NGINX Alpine | API Gateway, SSL termination, path routing |
| **Frontend Framework** | React 18 (TypeScript) | Reactive client architecture bundled via Vite 6 |
| **Styling & Theme** | Tailwind CSS v4 + Glassmorphism | `#0b1326` dark canvas, `.glass` cards, role accents |
| **Math Typesetting** | KaTeX (`react-katex`) | Native LaTeX equation and chemical formula rendering |
| **Motion & Data Viz** | `motion/react` + Recharts v3 | Micro-interactions and performance analytics graphs |

---

## 📁 Repository Directory Structure

```
marks-app/
├── docker-compose.yml             # Master Docker multi-container composition
├── payload.config.ts              # Payload Headless CMS configuration
├── README.md                      # This document
├── PROJECT_SPEC.md                # Exhaustive functional specification & KPIs
├── REQUIREMENTS.md                # Functional, non-functional & security requirements
├── FEATURES.md                    # Role-by-role feature catalog
├── ROADMAP.md                     # Engineering & product milestones
├── TODO.md                        # Active backlog and completion status
├── CHANGELOG.md                   # Semantic version history
├── AI_SYSTEM_PROMPT.md            # 🤖 Master prompt for external AI developers
├── PROMPT_PLAYBOOK.md             # 🤖 Reusable copy-paste prompts for AI tools
├── .gitignore                     # Git ignore rules
├── .env.example                   # Environment variable template
├── package.json                   # Dependencies and scripts
├── tsconfig.json                  # TypeScript compiler configuration
│
├── docker/                        # Container Configurations
│   ├── postgres/init.sql          # PostgreSQL DDL tables, constraints & indexes
│   ├── mongo/init-mongo.js        # MongoDB collections, schema validators & seed
│   ├── redis/redis.conf           # Redis memory limit & persistence settings
│   └── nginx/nginx.conf           # Gateway reverse proxy routing
│
├── payload/                       # Payload CMS Schema
│   └── collections/               # Questions, Formulas, Announcements, Media, Users
│
├── docs/                          # Architecture & Engineering Guides
│   ├── ENTERPRISE_ARCHITECTURE.md # Polyglot persistence, C4 model & data flows
│   ├── DOCKER_SETUP.md            # Container orchestration & local run guide
│   ├── DATABASE_HYBRID_DESIGN.md  # Postgres vs Mongo vs Redis data distribution
│   ├── PAYLOAD_CMS_SPEC.md        # Headless CMS architecture & search webhooks
│   ├── APPSMITH_INTEGRATION.md    # Internal operations & backoffice consoles
│   ├── REDIS_CACHE_AND_QUEUES.md  # Sorted Sets, BullMQ worker queues & cache
│   ├── SEARCH_ENGINE_SPEC.md      # Meilisearch question search integration
│   ├── SYSTEM_ARCHITECTURE.md     # Client vs server boundaries & offline state
│   ├── DATABASE_SCHEMA.md         # Detailed entity schemas
│   ├── FIREBASE_SETUP.md          # Optional Firebase client setup
│   ├── AUTHENTICATION.md          # JWT auth lifecycles & role routing
│   ├── USER_ROLES.md              # 6-tier RBAC matrix & route guards
│   ├── API_SPEC.md                # Client service contracts & callable endpoints
│   ├── SECURITY.md                # Threat model, input sanitization & audit logs
│   ├── UI_UX_SPEC.md              # NTA CBT screen design & keyboard shortcuts
│   ├── NOTIFICATIONS.md           # Alert triggers & notification pipelines
│   ├── DEPLOYMENT.md              # Production deployment & CI/CD workflows
│   ├── EXAM_ENGINE_SPEC.md        # NTA 5-state palette & timer synchronization
│   ├── SCORING_AND_PERCENTILE.md  # Marking schemes (+4/-1) & percentile math
│   ├── MISTAKE_NOTEBOOK_SPEC.md   # Error diagnostics & Leitner spaced repetition
│   └── CSV_PDF_IMPORT_SPEC.md     # Bulk CSV ingestion & AI OCR parser flow
│
├── design/                        # Visual Design System
│   ├── DESIGN_SYSTEM.md           # Tokens, glassmorphism, spacing, elevation
│   ├── COLORS.md                  # Tailored dark palettes and role accents
│   ├── TYPOGRAPHY.md              # Font scale and KaTeX rendering specs
│   ├── COMPONENTS.md              # Reusable UI component specifications
│   ├── ICONS.md                   # Lucide icon mapping
│   └── ANIMATION_SPEC.md          # Framer Motion presets and durations
│
├── ai-handover/                   # AI Developer Toolkits
│   ├── AI_PROMPT_TEMPLATE.md      # Structured prompt template for feature tasks
│   ├── CONTEXT_MEMORY.md          # Compressed context for LLM prompts (~1,400 tokens)
│   └── ARCHITECTURE_CHEAT_SHEET.md# Fast lookup table of collections & routes
│
├── src/                           # Reference Client Code
│   ├── components/                # UI components (TestEngine, Shared, Layout)
│   ├── pages/                     # Student, Teacher, Admin, Parent pages
│   ├── services/                  # Database service abstraction layer
│   ├── hooks/                     # Custom React hooks (useAuth, useExamEngine)
│   ├── utils/                     # KaTeX helper, scoring algorithms, CSV parsers
│   └── types/                     # TypeScript definitions
│
├── public/                        # Public assets, templates, PWA manifests
└── tests/                         # Unit tests and test specifications
```

---

## ⚡ Quickstart: Running with Docker

### 1. Configure Environment
```bash
cp .env.example .env
```

### 2. Launch Entire Ecosystem
```bash
docker compose up -d --build
```

### 3. Verify Health
```bash
docker compose ps
```

### 4. Access Services
- **Web App**: `http://localhost/` or `http://localhost:5173`
- **Backend API**: `http://localhost/api` or `http://localhost:4000`
- **Payload CMS**: `http://localhost/cms` or `http://localhost:3000`
- **Appsmith Operations**: `http://localhost/ops` or `http://localhost:8090`
- **Meilisearch Search**: `http://localhost/search` or `http://localhost:7700`
