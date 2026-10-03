# Design System Specification — Marks App

> **Design Paradigm**: Deep-Space Glassmorphism & High-Contrast Performance UI  
> **CSS Engine**: Tailwind CSS v4 + Native CSS Custom Properties  

---

## 1. Design Token Architecture

Marks App standardizes styling across tokens defined in `src/index.css`:

```css
:root {
  /* Core Dark Canvas Tokens */
  --bg-dark: #0b1326;
  --bg-surface: #10192e;
  --bg-surface-elevated: #171f33;
  --bg-card: rgba(23, 31, 51, 0.7);
  --border-glass: rgba(255, 255, 255, 0.08);
  --border-glass-hover: rgba(255, 255, 255, 0.16);

  /* Role Accent Color Tokens */
  --accent-student: #ff6b00;
  --accent-teacher: #8083ff;
  --accent-admin: #ef4444;
  --accent-parent: #10b981;

  /* Typography Scales */
  --font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  --font-mono: 'JetBrains Mono', 'Fira Code', monospace;
  --font-math: 'KaTeX_Main', 'KaTeX_Math', serif;
}
```

---

## 2. Glassmorphism Utility Classes

```css
/* Primary Frosted Glass Card */
.glass {
  background: var(--bg-card);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid var(--border-glass);
  box-shadow: 0 4px 24px -1px rgba(0, 0, 0, 0.4);
}

/* Glass Lift on Hover */
.glass-hover {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}
.glass-hover:hover {
  background: rgba(27, 36, 60, 0.85);
  border-color: var(--border-glass-hover);
  transform: translateY(-2px);
  box-shadow: 0 8px 32px -2px rgba(0, 0, 0, 0.5);
}

/* Navigation Bars */
.glass-sidebar {
  background: rgba(11, 19, 38, 0.85);
  backdrop-filter: blur(20px);
  border-right: 1px solid var(--border-glass);
}

.glass-topbar {
  background: rgba(11, 19, 38, 0.8);
  backdrop-filter: blur(16px);
  border-bottom: 1px solid var(--border-glass);
}
```

---

## 3. Dynamic Progress Shimmer (`.shimmer-bar`)

Used in progress meters, test completion bars, and analytics:

```css
.shimmer-bar {
  position: relative;
  overflow: hidden;
}

.shimmer-bar::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0) 0%,
    rgba(255, 255, 255, 0.25) 50%,
    rgba(255, 255, 255, 0) 100%
  );
  animation: shimmer 2s infinite;
}

@keyframes shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}
```
