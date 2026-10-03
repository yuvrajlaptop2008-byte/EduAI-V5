# Meilisearch Full-Text Search Specification — Marks App

> **Search Engine**: Meilisearch v1.7 (Self-Hosted on Port 7700)  
> **Use Case**: Sub-10ms Typo-Tolerant Search Across 50,000+ Questions, Topics & LaTeX Formulas  

---

## 1. Why Meilisearch for Marks App?

Traditional database queries (`LIKE '%projectile%'` in SQL or regex in MongoDB) become painfully slow when searching tens of thousands of technical questions. Meilisearch provides:
- **Instant Search**: Returns matches in `< 10ms`.
- **Typo Tolerance**: Matches "electrostatix" to "electrostatics" seamlessly.
- **Faceted Filters**: Instant multi-attribute filtering (Subject, Chapter, Topic, Difficulty, Exam, Year).
- **Lightweight Footprint**: Runs in Docker with minimal RAM overhead.

---

## 2. Question Index Schema & Attributes

```typescript
import { MeiliSearch } from "meilisearch";

export const meili = new MeiliSearch({
  host: process.env.MEILISEARCH_HOST || "http://localhost:7700",
  apiKey: process.env.MEILISEARCH_KEY || "meili_super_secret_master_key",
});

export async function configureQuestionSearchIndex() {
  const index = meili.index("questions");

  // Primary search fields (ordered by ranking weight)
  await index.updateSearchableAttributes([
    "topic",
    "chapter",
    "text",
    "tags",
    "subject",
  ]);

  // Faceted filter attributes for UI pills
  await index.updateFilterableAttributes([
    "subject",
    "chapter",
    "difficulty",
    "exam",
    "year",
    "status",
  ]);

  // Sorting attributes
  await index.updateSortableAttributes([
    "year",
    "id",
  ]);
}
```

---

## 3. Frontend Instant Search Query

```typescript
export async function searchQuestions(queryStr: string, filters?: { subject?: string; difficulty?: string }) {
  const index = meili.index("questions");

  const filterArray: string[] = [];
  if (filters?.subject) filterArray.push(`subject = "${filters.subject}"`);
  if (filters?.difficulty) filterArray.push(`difficulty = "${filters.difficulty}"`);

  const results = await index.search(queryStr, {
    limit: 25,
    filter: filterArray.join(" AND "),
  });

  return results.hits;
}
```
