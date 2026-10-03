# Icon Registry Specification — Marks App

> **Icon Library**: `lucide-react` (Standardized across entire platform)  
> **Stroke Width**: `1.75` (Consistent visual weight across all components)  

---

## 1. Domain Icon Mapping

### 1.1 Navigation & Layout
| Icon Name | Import Identifier | Usage |
|---|---|---|
| Dashboard | `LayoutDashboard` | Primary dashboard navigation link |
| Tests & Exams | `FileText` / `CheckSquare`| Test series, mock tests, and exams |
| Question Bank | `Database` / `BookOpen` | PYQ bank, chapter practice questions |
| Mistake Notebook | `Bookmark` / `AlertCircle`| Error tracking, bookmarked questions |
| Attendance | `CalendarCheck2` | Attendance registers and calendars |
| Students / Batches | `Users` / `GraduationCap` | Student rosters and batch management |
| Settings & Config | `Settings` / `Sliders` | Account settings, platform controls |
| Notifications | `Bell` | Unread notifications bell |
| Logout | `LogOut` | Session termination |

### 1.2 Academic Subjects
| Subject | Icon | Color Code |
|---|---|---|
| **Physics** | `Atom` | `#38bdf8` (Cyan) |
| **Chemistry** | `FlaskConical` | `#fbbf24` (Amber) |
| **Mathematics** | `Calculator` / `Sigma` | `#a78bfa` (Purple) |
| **Biology** | `Dna` | `#34d399` (Emerald) |

### 1.3 CBT Exam Actions
- `CheckCircle2`: Answered question status indicator.
- `Flag`: Mark for review action.
- `Eraser` / `RotateCcw`: Clear selection response.
- `ChevronLeft` / `ChevronRight`: Previous/Next question navigation.
- `Clock`: Exam countdown timer.
- `Send`: Submit test confirmation.

---

## 2. Standard Sizing Tokens

```typescript
export const ICON_SIZES = {
  xs: 14,   // Badges, table metadata
  sm: 16,   // Inline buttons, list actions
  md: 18,   // Sidebar navigation links, topbar icons
  lg: 24,   // StatCard headers, feature callouts
  xl: 36,   // EmptyState hero illustrations
};
```
