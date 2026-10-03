# Color Palette Specification — Marks App

> **Theme**: Curated Dark HSL & Hex Color Architecture  
> **Contrast Target**: WCAG 2.1 AA Compliant on `#0b1326`  

---

## 1. Core Background & Surface Hierarchy

| Token Name | Hex Code | HSL Value | Application / Purpose |
|---|---|---|---|
| `--bg-base` | `#0b1326` | `hsl(222, 55%, 10%)` | Canvas background for entire viewport |
| `--bg-surface` | `#10192e` | `hsl(222, 48%, 12%)` | Structural sidebar, headers, and footer |
| `--bg-surface-elevated`| `#171f33` | `hsl(223, 38%, 15%)` | Elevated cards, tables, and dropdown menus |
| `--bg-glass-card` | `rgba(23, 31, 51, 0.7)` | — | Frosted translucent container with backdrop blur |
| `--border-subtle` | `rgba(255, 255, 255, 0.08)` | — | Standard divider and card outline |
| `--border-active` | `rgba(255, 255, 255, 0.20)` | — | Focused form borders and selected options |

---

## 2. Role Accent Palettes

```
Student Accent (Brand Orange)
  Main:  #ff6b00  │  RGB: rgb(255, 107, 0)   │  Glow: rgba(255, 107, 0, 0.25)
  Light: #ff8533  │  Dark: #cc5500

Teacher Accent (Modern Indigo)
  Main:  #8083ff  │  RGB: rgb(128, 131, 255) │  Glow: rgba(128, 131, 255, 0.25)
  Light: #a2a4ff  │  Dark: #5d60db

Admin Accent (Crimson Rose)
  Main:  #ef4444  │  RGB: rgb(239, 68, 68)   │  Glow: rgba(239, 68, 68, 0.25)
  Light: #f87171  │  Dark: #dc2626

Parent Accent (Emerald Green)
  Main:  #10b981  │  RGB: rgb(16, 185, 129)  │  Glow: rgba(16, 185, 129, 0.25)
  Light: #34d399  │  Dark: #059669
```

---

## 3. Academic Subject Theming

| Subject | Accent Hex | Badge Background | Use Case |
|---|---|---|---|
| **Physics** | `#38bdf8` (Sky Blue) | `rgba(56, 189, 248, 0.12)` | Mechanics, Electromagnetism, Optics |
| **Chemistry** | `#fbbf24` (Amber Gold) | `rgba(251, 191, 36, 0.12)` | Organic, Inorganic, Physical Chem |
| **Mathematics** | `#a78bfa` (Purple) | `rgba(167, 139, 250, 0.12)`| Calculus, Algebra, Vectors |
| **Biology** | `#34d399` (Emerald) | `rgba(52, 211, 153, 0.12)` | Botany, Zoology, Genetics |

---

## 4. NTA Question Palette Color Standards

```
⚪ Not Visited:             #6b7280  (Gray-500)
🔴 Visited, Not Answered:   #ef4444  (Red-500)
🟢 Answered:                #10b981  (Emerald-500)
🟣 Marked for Review:       #8b5cf6  (Violet-500)
🟣🟢 Answered & Review:     #8b5cf6  (with #10b981 inner indicator dot)
```
