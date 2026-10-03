# CSV & AI PDF Question Ingestion Specification — Marks App

> **Supported Formats**: Standard CSV (PapaParse) + Multi-Column PDF Test Papers (AI OCR)  
> **Target Collection**: `custom_questions/{id}`  

---

## 1. CSV Bulk Import Format & Schema

The CSV importer expects standard UTF-8 encoded files with a mandatory header row:

### 1.1 Column Definitions
| Column Name | Type | Allowed Values / Rules | Example |
|---|---|---|---|
| `id` | Integer | Unique numeric question ID | `10501` |
| `subject` | String | `Physics`, `Chemistry`, `Mathematics`, `Biology` | `Physics` |
| `chapter` | String | Exact official NCERT chapter name | `Electrostatics` |
| `topic` | String | Sub-topic name | `Electric Dipole` |
| `difficulty` | String | `Easy`, `Medium`, `Hard` | `Medium` |
| `text` | String | LaTeX/Markdown formatted question body | `An electric dipole of moment $p$...` |
| `option1` | String | Option A body (LaTeX supported) | `$p E \cos\theta$` |
| `option2` | String | Option B body (LaTeX supported) | `$p E \sin\theta$` |
| `option3` | String | Option C body (LaTeX supported) | `$-p E \cos\theta$` |
| `option4` | String | Option D body (LaTeX supported) | `zero` |
| `correctAnswer`| Integer | `0` for A, `1` for B, `2` for C, `3` for D | `1` |
| `solution` | String | Step-by-step LaTeX solution explanation | `Torque $\tau = \vec{p} \times \vec{E}$...`|
| `exam` | String | `JEE Main`, `JEE Advanced`, `NEET`, `BITSAT` | `JEE Main` |
| `language` | String | `en`, `hi`, `both` | `en` |
| `tags` | String | Pipe-separated tags | `2024\|Shift-2\|Pyq` |

### 1.2 CSV Raw Template Example
```csv
id,subject,chapter,topic,difficulty,text,option1,option2,option3,option4,correctAnswer,solution,exam,language,tags
101,Physics,Kinematics,Projectile Motion,Easy,A ball is projected with speed $u$ at angle $\theta$ to the horizontal. The range is:,$u^2 \sin(2\theta) / g$,$u^2 \cos(2\theta) / g$,$u^2 / (2g)$,$u \sin\theta / g$,0,"Range $R = \frac{u^2 \sin(2\theta)}{g}$",JEE Main,en,PYQ|2023
102,Mathematics,Calculus,Definite Integrals,Medium,The value of $\int_0^{\pi/2} \frac{\sin x}{\sin x + \cos x} dx$ is:,$\pi/4$,$\pi/2$,$\pi$,0,0,"Using King's property $I = \int_0^a f(a-x)dx$, $2I = \pi/2 \implies I = \pi/4$",JEE Main,en,PYQ|2022
```

---

## 2. AI-Powered PDF Question Paper Extraction

For coaching institutes with legacy physical PDF question papers:

```
[ Upload PDF ] ────────► [ Firebase Storage (pdf-imports/{uid}/) ]
                                   │
                                   ▼
                      [ Cloud Function / Claude API ]
                      (System Prompt: Extract Questions & LaTeX)
                                   │
                                   ▼
                      [ Structured JSON Output ]
                                   │
                                   ▼
             [ Admin Review & Interactive Preview Grid ]
                                   │
                        (Admin Clicks "Approve & Commit")
                                   ▼
                  [ Firestore: custom_questions/{id} ]
```

### 2.1 Prompt Directive for PDF Parser AI
```text
Extract all multiple choice questions from this coaching institute PDF paper.
For each question:
1. Format all math and chemical formulas into clean KaTeX LaTeX syntax using $...$ for inline and $$...$$ for blocks.
2. Extract all 4 choices into an options array.
3. Identify the correct answer index (0 for A, 1 for B, 2 for C, 3 for D).
4. Extract or derive step-by-step solutions where available.
Return an array of JSON objects matching the QuestionDocument schema.
```
