# Motion & Animation Specification — Marks App

> **Engine**: `motion/react` (`framer-motion` v11/v12)  
> **Guiding Principle**: Purposeful, non-distracting micro-interactions  

---

## 1. Timing Tokens & Easing Curves

```typescript
export const ANIMATION_TOKENS = {
  durations: {
    instant: 0.1,    // Tooltips, button active states
    fast: 0.2,       // Dropdowns, hover lifts, checkbox toggles
    normal: 0.3,     // Card mounts, tab switches, sidebar collapse
    slow: 0.5,       // Page transitions, modal entries
  },
  easings: {
    standard: [0.4, 0.0, 0.2, 1.0],      // Material ease-in-out
    decelerate: [0.0, 0.0, 0.2, 1.0],    // Elements entering viewport
    accelerate: [0.4, 0.0, 1.0, 1.0],    // Elements leaving viewport
    springGentle: { damping: 25, stiffness: 300 }, // Modals, stat cards
  }
};
```

---

## 2. Reusable Framer Motion Variants

### 2.1 Staggered List Container
```typescript
export const staggerListVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
    }
  }
};

export const listItemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.25, ease: [0, 0, 0.2, 1] }
  }
};
```

### 2.2 Modal Spring Entry
```typescript
export const modalSpringVariants = {
  hidden: { opacity: 0, scale: 0.94, y: 20 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: "spring", damping: 25, stiffness: 320 }
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: 10,
    transition: { duration: 0.15 }
  }
};
```

---

## 3. Reduced Motion Compliance

For users with vestibular motion sensitivity, all animations must respect the `prefers-reduced-motion` CSS setting:

```css
@media (prefers-reduced-motion: reduce) {
  *, ::before, ::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```
