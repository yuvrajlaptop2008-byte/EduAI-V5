# Payload CMS Headless Content Engine — Marks App

> **CMS Engine**: Payload CMS v2/v3 (TypeScript-Native Headless CMS)  
> **Role**: Content Curation, Question Bank Editorial Workflow, Formula Handbook, Media CDN  

---

## 1. Why Payload CMS for Marks App?

Traditional relational dashboards make rich-text LaTeX authoring, question review queues, and media asset management clumsy. Payload CMS provides:
1. **TypeScript-First Schema**: Collections are defined in pure TypeScript with auto-generated types (`src/types/payload-types.ts`).
2. **Native MongoDB / Postgres Adapters**: Direct connection to our existing database containers.
3. **Editorial Workflow & Drafts**: Faculty can save questions as "Drafts" or "Pending Review" before Super Admins publish them to the live exam question bank.
4. **Rich Media Management**: Built-in handling of question diagrams, SVG geometric figures, and PDF test papers with automated resizing.

---

## 2. Payload Collections Architecture

```
payload/
├── payload.config.ts             # Central Payload configuration
└── collections/
    ├── Questions.ts              # LaTeX Questions, 4 Options, Correct Answer, Solution
    ├── Formulas.ts               # Subject/Chapter Formula Handbook
    ├── Announcements.ts          # Broadcast banners with role targeting
    ├── Media.ts                  # Diagram uploads with MIME & size restrictions
    └── Users.ts                  # Editorial staff & faculty credentials
```

---

## 3. Webhook Integration: Instant Meilisearch Indexing

Whenever a question is created or updated in Payload CMS, a collection hook automatically indexes the question in Meilisearch for sub-10ms search availability:

```typescript
// payload/collections/Questions.ts
import { CollectionAfterChangeHook } from "payload/types";
import { MeiliSearch } from "meilisearch";

const client = new MeiliSearch({
  host: process.env.MEILISEARCH_HOST || "http://meilisearch:7700",
  apiKey: process.env.MEILISEARCH_KEY || "meili_super_secret_master_key",
});

const indexInMeilisearch: CollectionAfterChangeHook = async ({ doc, operation }) => {
  if (doc.status === "active") {
    const index = client.index("questions");
    await index.addDocuments([
      {
        id: doc.id,
        text: doc.text,
        subject: doc.subject,
        chapter: doc.chapter,
        topic: doc.topic,
        difficulty: doc.difficulty,
        exam: doc.exam,
        year: doc.year,
      },
    ]);
  }
};
```

---

## 4. REST & GraphQL API Endpoints

Payload CMS exposes instant endpoints consumed by both the React frontend and mobile apps:

- **REST API**:
  - `GET /api/questions?where[subject][equals]=Physics&limit=25`
  - `GET /api/formulas?where[chapter][equals]=Electrostatics`
  - `GET /api/announcements?where[active][equals]=true`
- **GraphQL API**:
  - `POST /api/graphql`
  - Query complex nested questions with attached media diagrams in a single network request.
