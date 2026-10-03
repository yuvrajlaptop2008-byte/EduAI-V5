# Typography & Mathematical Typesetting — Marks App

> **Primary Font**: `Inter` (UI) & `Outfit` (Headings)  
> **Numerical Font**: `JetBrains Mono` (Timers, marks, scores)  
> **Mathematical Typesetting**: `KaTeX` (TeX/LaTeX equations)  

---

## 1. Font Family Stack

```css
/* UI Body & General Text */
font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;

/* Hero Titles, Section Headings */
font-display: 'Outfit', sans-serif;

/* CBT Timers, Marks, Numerical Inputs */
font-mono: 'JetBrains Mono', 'Fira Code', monospace;

/* LaTeX Mathematical Formulas */
font-math: 'KaTeX_Main', 'KaTeX_Math', 'KaTeX_AMS', 'Times New Roman', serif;
```

---

## 2. Type Scale & Hierarchy

| Token | Size | Line Height | Weight | Tracking | Application |
|---|---|---|---|---|---|
| `text-display` | `2.25rem (36px)`| `2.5rem (40px)` | 700 / Bold | `-0.02em` | Exam title, Hero metrics |
| `text-h1` | `1.875rem (30px)`| `2.25rem (36px)`| 700 / Bold | `-0.015em`| Dashboard page title |
| `text-h2` | `1.5rem (24px)` | `2.0rem (32px)` | 600 / Semi | `-0.01em` | Section headers, Card titles |
| `text-h3` | `1.25rem (20px)`| `1.75rem (28px)`| 600 / Semi | `0` | Question number, Modal title |
| `text-body-lg` | `1.125rem (18px)`| `1.75rem (28px)`| 400 / Reg | `0` | Question text, Problem statement |
| `text-body` | `0.9375rem (15px)`|`1.5rem (24px)`  | 400 / Reg | `0` | Option labels, General body |
| `text-sm` | `0.8125rem (13px)`|`1.25rem (20px)` | 500 / Med | `0.01em` | Badges, Table metadata |
| `text-xs` | `0.6875rem (11px)`|`1.0rem (16px)`  | 500 / Med | `0.02em` | Timestamps, Palette numbers |

---

## 3. Mathematical Formula Rendering (KaTeX)

### 3.1 Delimiters
- **Inline Equations**: Delimited by single dollar signs: `$E = mc^2$`
- **Display Block Equations**: Delimited by double dollar signs:
  ```latex
  $$\oint_C \vec{B} \cdot d\vec{l} = \mu_0 I_{\text{enc}} + \mu_0 \epsilon_0 \frac{d\Phi_E}{dt}$$
  ```

### 3.2 Typesetting Quality Directives
- **Subscripts and Superscripts**: Always enclose multi-character expressions in braces (e.g. `x_{12}`, not `x_12`).
- **Fractions**: Use `\frac{numerator}{denominator}` or `\dfrac{...}{...}` for clear display in fractions.
- **Chemistry Equations**: Support `\ce{...}` via mhchem or LaTeX text mode (e.g. `\text{H}_2\text{SO}_4`).
- **Font Preloading**: The KaTeX font files (`KaTeX_Main-Regular.woff2`, `KaTeX_Math-Italic.woff2`) are preloaded in `<head>` to avoid Cumulative Layout Shift (CLS).
