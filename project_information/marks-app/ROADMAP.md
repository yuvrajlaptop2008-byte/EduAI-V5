# Marks App — Engineering & Product Roadmap

> **Strategic Vision**: Scaling from a single-institute JEE/NEET prep tool to an enterprise multi-tenant education platform.  

---

## 🗺️ High-Level Phase Overview

```
[ Phase 1: MVP Core CBT ] ────────► [ Phase 2: Multi-Role ERP ] ────────► [ Phase 3: Analytics & Scale ]
      (Completed)                             (Completed)                             (Current - V5.0)
                                                                                     │
[ Phase 5: Enterprise SaaS ] ◄──────── [ Phase 4: AI Adaptive Engine ] ◄───────────────┘
         (Q4 2027)                                (Q1-Q2 2027)
```

---

## 📌 Phase 1: Core CBT & Practice Foundation (V1.0 – V2.0) — [COMPLETED]
- [x] Basic React + Vite + Firebase setup.
- [x] Email/Password and Google sign-in.
- [x] NTA JEE/NEET exam simulator with countdown timer and question palette.
- [x] Chapter-wise PYQ practice mode with answer verification.
- [x] Basic KaTeX LaTeX math formula rendering.
- [x] Simple user profiles with points and daily streak counter.

---

## 📌 Phase 2: Multi-Role Coaching ERP & Hierarchy (V3.0 – V4.0) — [COMPLETED]
- [x] 4 distinct role namespaces: Student (`/app`), Teacher (`/teacher`), Admin (`/admin`), Parent (`/parent`).
- [x] Institute hierarchy architecture: Institutes → Branches → Batches → Exam Groups.
- [x] Invite-based role assignment system with client & Cloud Function validation.
- [x] Teacher Suite: Test creation wizard, student roster, daily attendance register, and student remarks.
- [x] Parent Portal: Multi-child dashboard, attendance calendar, and score timeline.
- [x] Hardened Firestore security rules with helper functions (`isAdmin`, `isTeacher`, `isParentRole`).

---

## 📌 Phase 3: High-Density Analytics, Glassmorphism & Ingestion (V5.0) — [CURRENT]
- [x] Custom Glassmorphism UI design system (`#0b1326`, `.glass`, role accent colors).
- [x] PapaParse-driven Question CSV bulk import wizard with preview and error log.
- [x] Cloud Functions background pipeline for re-ranking test submissions and calculating exact percentiles.
- [x] Platform configuration collection (`platform/config`) with broadcast banners and maintenance mode gates.
- [x] Comprehensive Mistake Notebook with error classification tags (Calculation, Concept, Silly, Time).
- [ ] **In Progress**: Teacher Test Creation UI overhaul with dual-panel glass view and difficulty distribution charts.
- [ ] **In Progress**: Admin Question Bank three-column master-detail layout.
- [ ] **In Progress**: Real-time activity timeline with CSS connector lines.

---

## 📌 Phase 4: AI Adaptive Practice & Intelligent Coaching (V5.5 – V6.0) — [UPCOMING]
- [ ] **AI Question Parser (Claude / Gemini)**: Automated extraction of multi-column PDF question papers into structured KaTeX JSON.
- [ ] **Adaptive Diagnostic Testing**: Dynamic test generation adjusting question difficulty based on student's real-time accuracy during the test.
- [ ] **AI Step-by-Step Hint Tutor**: Interactive conversational AI providing hints without revealing the final answer.
- [ ] **Full PWA Offline Test Engine**: Service worker caching of entire exam bundles with zero-connectivity test taking and automatic sync upon reconnect.
- [ ] **Automated PDF Report Card Generator**: Instant branded report card PDF generation for parents via jsPDF/Puppeteer.

---

## 📌 Phase 5: Multi-Tenant Enterprise SaaS (V6.0+) — [PLANNED]
- [ ] **Custom Institute White-Labeling**: Custom subdomains (e.g., `allen.marksapp.io`), custom logo, and branded theme tokens.
- [ ] **Fee & Payment Gateway Integration**: Razorpay / Stripe integration for coaching fee collection and paid test series enrollment.
- [ ] **Live Proctored Exams**: WebRTC-based camera and screen proctoring with automated AI anti-cheating alerts.
- [ ] **Native Mobile Apps**: React Native or Flutter mobile apps for iOS App Store and Google Play Store.
