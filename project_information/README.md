# Project Information & Knowledge Repository

This directory contains the central project documentation, architectural blueprints, and AI developer handoff kits for **Marks App** (EduAI V5 ecosystem).

---

## Directory Structure

```
project_information/
└── marks-app/
    ├── README.md                      # Primary project overview & quickstart
    ├── PROJECT_SPEC.md                # Comprehensive functional & technical specification
    ├── REQUIREMENTS.md                # Functional, non-functional, security & performance requirements
    ├── FEATURES.md                    # Exhaustive feature matrix by role (Student, Teacher, Admin, Parent)
    ├── ROADMAP.md                     # Product milestones from MVP through Enterprise SaaS
    ├── TODO.md                        # Granular task tracking by module and priority
    ├── CHANGELOG.md                   # Semantic version history (V1.0.0 to V5.0.0)
    ├── AI_SYSTEM_PROMPT.md            # Master prompt for feeding context to Claude, GPT-4o, Cursor & Copilot
    ├── PROMPT_PLAYBOOK.md             # Copy-paste prompts for triggering AI module generators
    ├── .gitignore                     # Production Git rules for Vite + React + Firebase
    ├── .env.example                   # Complete environment configuration template
    ├── package.json                   # Dependencies, scripts, and package metadata
    ├── tsconfig.json                  # TypeScript compiler settings
    │
    ├── docs/                          # In-depth architectural & technical documentation
    │   ├── SYSTEM_ARCHITECTURE.md     # C4 architecture, data flows, client vs server boundaries
    │   ├── DATABASE_SCHEMA.md         # Firestore collection models, document schemas, subcollections
    │   ├── FIREBASE_SETUP.md          # CLI, Auth, Firestore, Storage, Functions & Emulator setup
    │   ├── AUTHENTICATION.md          # Auth lifecycles, role resolution, custom claims, invites
    │   ├── USER_ROLES.md              # Granular RBAC matrix across 6 user tiers
    │   ├── API_SPEC.md                # Client service contracts & Cloud Function definitions
    │   ├── SECURITY.md                # Threat model, input sanitization, Firestore security audits
    │   ├── UI_UX_SPEC.md              # Design philosophy, micro-interactions, accessibility (a11y)
    │   ├── NOTIFICATIONS.md           # Multi-channel notification engine specifications
    │   ├── DEPLOYMENT.md              # Firebase Hosting, functions deploy, custom domains, CI/CD
    │   ├── EXAM_ENGINE_SPEC.md        # NTA-compliant CBT test runner, state machine, timers, recovery
    │   ├── SCORING_AND_PERCENTILE.md  # JEE/NEET marking algorithms, normalization & rank predictions
    │   ├── MISTAKE_NOTEBOOK_SPEC.md   # Error analytics, bookmarking & spaced repetition logic
    │   └── CSV_PDF_IMPORT_SPEC.md     # Bulk question ingestion, CSV parsers, AI OCR pipelines
    │
    ├── design/                        # Design system & visual specifications
    │   ├── DESIGN_SYSTEM.md           # Tokens, glassmorphism principles, layout grids
    │   ├── COLORS.md                  # Tailored dark palettes, role accents, CSS tokens
    │   ├── TYPOGRAPHY.md              # Font scale, KaTeX math typesetting guidelines
    │   ├── COMPONENTS.md              # Core component specs (Cards, Modals, Buttons, Tables)
    │   ├── ICONS.md                   # Lucide icon registry and usage guidelines
    │   └── ANIMATION_SPEC.md          # Framer Motion transitions, physics & spring configurations
    │
    ├── ai-handover/                   # Turnkey developer kits for external AI agents
    │   ├── AI_PROMPT_TEMPLATE.md      # Template for delegating feature tasks to other LLMs
    │   ├── CONTEXT_MEMORY.md          # Compact context snapshot for token-constrained AI prompts
    │   └── ARCHITECTURE_CHEAT_SHEET.md# Instant reference for routes, collections & services
    │
    ├── firebase/                      # Production Firebase configurations
    │   ├── firestore.rules            # Hardened security rules with role helpers
    │   ├── firestore.indexes.json     # Composite query indexes
    │   └── storage.rules              # Bucket access rules for PDFs, question images & avatars
    │
    ├── src/                           # Reference architectural implementations
    │   ├── types/                     # TypeScript definitions (schema, exam, user, analytics)
    │   ├── services/                  # Firestore & Auth service layer
    │   ├── hooks/                     # Custom React hooks (useAuth, useExamEngine, useQuestions)
    │   ├── utils/                     # KaTeX renderers, scoring calculations, CSV parsers
    │   ├── components/                # UI components (TestEngine, Shared, Layout)
    │   └── pages/                     # Role-specific entry pages
    │
    ├── public/                        # Public assets, PWA manifest, question templates
    └── tests/                         # Unit tests and security rule test specs
```

---

## How to Hand This Off to Another AI

When you want an AI (such as Claude 3.7/Sonnet, GPT-4o, Cursor Agent, DeepSeek, or GitHub Copilot) to write or modify code for this platform:

1. **Provide the Master AI Prompt**:
   Copy the contents of [`project_information/marks-app/AI_SYSTEM_PROMPT.md`](file:///c:/Users/YUVRAJ/OneDrive/Desktop/edu/project_information/marks-app/AI_SYSTEM_PROMPT.md) and paste it into the AI's system prompt or introductory message.
2. **Provide Compact Context**:
   Reference [`project_information/marks-app/ai-handover/CONTEXT_MEMORY.md`](file:///c:/Users/YUVRAJ/OneDrive/Desktop/edu/project_information/marks-app/ai-handover/CONTEXT_MEMORY.md) for quick token-saving context.
3. **Select a Target Task from the Playbook**:
   Open [`project_information/marks-app/PROMPT_PLAYBOOK.md`](file:///c:/Users/YUVRAJ/OneDrive/Desktop/edu/project_information/marks-app/PROMPT_PLAYBOOK.md) to find specialized prompts for building specific modules.
