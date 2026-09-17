# NeuroQuest UI/UX Pro Max Design System & Rules

This project adopts the **UI/UX Pro Max** design intelligence framework to enforce modern, accessible, and conversion-grade visual craftsmanship.

---

## 1. Aesthetic Archetypes & Themes

NeuroQuest supports three distinct, high-polish themes:
1. **Neumorphic Light (Default)**:
   - Soft directional shadows (`neu-raised`, `neu-inset`, `neu-flat`).
   - Clean slate surfaces (`#E2E8F0`, `#F8FAFC`, `#0F172A`).
   - Indigo/Violet vibrant accents (`#4F46E5`, `#6366F1`) paired with Amber sparks (`#F59E0B`).

2. **Obsidian Gold / Obsidian Noir (Dark)**:
   - Deep rich charcoal/zinc foundations (`#18181B`, `#27272A`, `#09090B`).
   - Amber gold glowing rims (`#FBBF24`, `#F59E0B`) with high-contrast text (`#F4F4F5`, `#E4E4E7`).

3. **Riso-Pop / Neo-Brutalist**:
   - Clean cream backdrop (`#FFFDF9`, `#F4EFE6`).
   - 2px bold border strokes (`#1E1B18`) with crisp solid offset drop-shadows (`3px 3px 0px #1E1B18`).

---

## 2. Typographic Hierarchy & Scaling

- **Display & Headings**: Bold, high-contrast, uppercase tracking for chapter titles, mission banners, and stat counters.
- **Body Text**: 14px–16px baseline for legibility with 1.5–1.6 line height.
- **Technical & Monospace Tags**: Used for XP indicators, spark counts, mission tags, and code blocks (`font-mono`, uppercase, tracked out).
- **Single-Line Tag Rule**: Badges, chips, and pills never break onto multiple lines (`whitespace-nowrap`).

---

## 3. Motion & Micro-Interactions (`motion/react`)

- **Spring Dynamics**: Stiff, snappy springs (`stiffness: 350`, `damping: 25`) for tactile feedback.
- **Interactive Feedback**:
  - Interactive buttons: `whileHover={{ scale: 1.02–1.05 }}`, `whileTap={{ scale: 0.95–0.98 }}`.
  - Modals & Drawers: Spring-based entry and exit with dimmed backdrop blur (`AnimatePresence`).
  - Active Node & Quest Path: Pulsing aura rings and subtle floating badges.

---

## 4. Accessibility & Contrast Standards

- WCAG AA compliant contrast ratio (≥ 4.5:1 for body copy).
- Never render light gray text on light colored backgrounds or dark gray text on dark surfaces.
- Touch target minimum: 44px on mobile viewports.
- All meaningful buttons and interactive cards include explicit unique `id` attributes.

---

## 5. Anti-Slop Visual Quality Checklist

- ❌ No generic blue-purple gradient washes or illegible cyan text.
- ❌ No nested cards (avoid card inside card without distinct surface contrast).
- ❌ No arbitrary floating glassmorphism overlays in dark mode.
- ✅ Mathematical border-radius nesting: `Inner Radius = Outer Radius - Padding`.
- ✅ Container outer padding strictly ≥ inner element spacing.
