---
name: ui-ux-pro-max
description: Complete design intelligence database, design system generation rules, styling archetypes, and UX best practices for NeuroQuest based on nextlevelbuilder/ui-ux-pro-max-skill.
---

# UI/UX Pro Max Design Intelligence Skill

This skill provides comprehensive UI/UX guidelines, design archetypes, color palettes, typography pairings, motion physics, and anti-slop rules for NeuroQuest.

## Core Directives

1. **Aesthetic Archetypes**:
   - **Neumorphic Light**: Directional dual shadows (`neu-raised`, `neu-inset`, `neu-flat`), soft slate bases (`#E2E8F0`, `#F8FAFC`), indigo primary accents (`#4F46E5`), and amber sparks (`#F59E0B`).
   - **Obsidian Gold / Obsidian Noir**: Deep charcoal/zinc canvas (`#18181B`, `#09090B`), glowing amber/gold borders (`#FBBF24`, `#F59E0B`), and high-contrast text (`#F4F4F5`).
   - **Neo-Brutalist / Riso-Pop**: Cream canvas (`#FFFDF9`), solid 2px black border strokes (`#1E1B18`), and crisp hard drop-shadows (`3px 3px 0px #1E1B18`).

2. **Typography & Layout Hierarchy**:
   - High-contrast display headings with uppercase tracking for chapters, levels, and banners.
   - 14px–16px baseline for body text with 1.5–1.6 line height.
   - Monospace tags for metrics (XP, Sparks, timers, difficulty levels).
   - Single-line tag rule: `whitespace-nowrap` on badges and chips.

3. **Motion Physics (`motion/react`)**:
   - Snappy spring dynamics: `stiffness: 350`, `damping: 25`.
   - Hover: `whileHover={{ scale: 1.02 - 1.05 }}`.
   - Tap feedback: `whileTap={{ scale: 0.95 - 0.98 }}`.
   - Modals and drawers wrapped in `<AnimatePresence>`.

4. **Accessibility**:
   - WCAG AA contrast ratio (≥ 4.5:1 for body copy).
   - Touch targets ≥ 44px on mobile viewports.
   - Unique `id` attributes on all interactive elements.

5. **Anti-Slop Quality Gate**:
   - No generic blue-purple gradient washes.
   - No arbitrary nested cards without surface contrast.
   - Mathematical border-radius nesting: `Inner Radius = Outer Radius - Padding`.
   - Outer padding ≥ inner spacing.
