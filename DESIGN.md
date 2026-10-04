# SAP LABS — MISSION 2027: DESIGN SYSTEM
## Inspired by Lovable & UI/UX Pro Max Intelligence

**Baseline:** Lovable Craftsmanship (`npx getdesign@latest add lovable`)  
**Design Intelligence:** UI/UX Pro Max (`https://github.com/nextlevelbuilder/ui-ux-pro-max-skill.git`)  
**Mission:** Anuraj × Soumyajit | SAP Labs Placement Target: 1 July 2027  

---

## 1. Visual Theme & Atmosphere

The interface radiates calm, disciplined focus through restraint. Built for intense daily preparation, it replaces distracting developer-dashboard clutter with a serious, tactile, and professional atmosphere:

* **Foundation:** Deep obsidian charcoal canvas (`#080A0F`) and elevated slate card surfaces (`#0E121B`, `#141A26`).
* **Accents:** Muted imperial gold (`#C5A059`, `#D8B668`), refined brushed silver (`#94A3B8`), and subtle corporate deep blue (`#2B527E`).
* **Zero Neon:** Absolutely no saturated greens, cyans, or hot magentas. High contrast achieved through pure tonal values.
* **Lovable Inset Lighting:** Buttons and interactive cards feature multi-layer inset lighting (`inset 0 1px 0 rgba(255,255,255,0.08)`) simulating physically beveled dark glass and slate.
* **Responsiveness:** Dual ergonomic layout — dedicated mobile bottom thumb bar with iPhone safe-area insets on phones, and an uncluttered fixed command sidebar on desktop.

---

## 2. Color Palette & Opacity-Driven Tonal Model

### Base Surfaces
* **Canvas (`#080A0F`)**: Deepest background.
* **Surface (`#0E121B`)**: Card containers and section panels.
* **Elevated Surface (`#141A26`)**: Active states, dropdowns, modal layers, button bases.
* **Hover Micro-tint (`#1F2839`)**: Subtle row and button hover interactions.

### Muted Gold Scale (Focus & Achievement)
* **Gold Light (`#D8B668`)**: Active text highlights, live countdown values.
* **Gold Primary (`#C5A059`)**: Primary action buttons, active tab indicators, completed stage glow.
* **Gold Dark (`#9E7B35`)**: Subdued borders, gradient dropoff.
* **Gold Subtle Fill (`rgba(197, 160, 89, 0.12)`)**: Pill badges and active stage backgrounds.
* **Gold Border (`rgba(197, 160, 89, 0.35)`)**: Focused card rims.

### Silver & Corporate Blue Scale
* **Text High Contrast (`#F1F5F9`)**: Primary headings, digits, card titles.
* **Text Medium Contrast (`#94A3B8`)**: Secondary labels, descriptions, metadata.
* **Text Muted (`#64748B`)**: Timestamps, disabled stages, subtle indicators.
* **Corporate Blue (`#2B527E`, `#3E6E9F`)**: Secondary comparison bars and documentation links.

---

## 3. Typography & Numerical Hierarchy

* **Primary Font:** Humanist system sans-serif (`-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto`).
* **Monospace Font:** Precision metrics font (`SFMono-Regular, Menlo, Monaco, Consolas`).
* **Display Countdown:** Big numbers with tight tracking (`tracking-tight font-mono font-bold text-3xl sm:text-4xl`).
* **Section Titles:** Uppercase 11px with wide letter spacing (`text-xs font-bold uppercase tracking-wider text-slate-400`).
* **Badges:** Full-pill monospace tags (`rounded-full font-mono text-[10px] px-2 py-0.5`).

---

## 4. Lovable Component Craftsmanship

### Inset-Shadow Action Buttons
```css
/* Gold Primary CTA */
background: #C5A059;
color: #080A0F;
font-weight: 700;
border-radius: 0.5rem;
box-shadow: inset 0 1px 0 rgba(255,255,255,0.35), inset 0 -1px 0 rgba(0,0,0,0.25), 0 2px 8px rgba(0,0,0,0.4);
transition: all 150ms ease-out;

/* Dark Tactile Button */
background: #141A26;
border: 1px solid rgba(255,255,255,0.08);
box-shadow: inset 0 0.5px 0 rgba(255,255,255,0.08), inset 0 0 0 0.5px rgba(0,0,0,0.6), 0 1px 3px rgba(0,0,0,0.25);
```

### Card Containers
```css
background: #0E121B;
border: 1px solid rgba(255, 255, 255, 0.08);
border-radius: 0.75rem;
box-shadow: 0 4px 20px -4px rgba(0, 0, 0, 0.6);
```

---

## 5. Mobile & Desktop Navigation Architecture

* **Phone (< 1024px):**
  * Persistent 5-button bottom navigation bar (`fixed bottom-0 z-40 bg-[#0A0D14]/95 backdrop-blur-md`).
  * Tap targets $\ge 44\text{px} \times 44\text{px}$ (`touch-manipulation`).
  * Native iPhone home-indicator safe area: `padding-bottom: max(0.5rem, env(safe-area-inset-bottom))`.
  * Slide-out drawer menu for comprehensive configuration.
* **Desktop ($\ge 1024px$):**
  * Fixed left navigation column (64 / 256px) with real-time candidate summary pills.
  * Sticky top bar with live digital countdown and notification bell.
  * Content bounded to `max-w-7xl` with balanced padding.

---

## 6. Core Integrity Rules

1. **Answer the 3 Core Questions First:**
   * Time remaining (Countdown to 1 July 2027)
   * Completed progress (Anuraj vs. Soumyajit peer overview)
   * Daily study agenda (Today's tasks + Today's LeetCode + Next topics)
2. **Zero Fake Metrics:**
   * No probabilistic hiring algorithms.
   * Every percentage, stage dot, and difficulty counter is calculated strictly from database records.
3. **Dual Administrator Sync:**
   * Shared syllabus and study materials reflect across both accounts instantly.
   * Individual candidate progression and logs remain strictly isolated.
