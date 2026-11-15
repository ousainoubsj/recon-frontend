# Light/Dark Mode — Reconcil frontend

## Context
Reconcil (`recon-frontend`) is dark-only: `dark` is hardcoded on `<html>` ([app/layout.tsx](recon-frontend/app/layout.tsx)), `viewport.colorScheme: "dark"`, and the UI is painted with literal colours instead of tokens. Goal: a user-selectable light theme on the dashboard, using the FAR fix as the pattern (one root `next-themes` provider, `resolvedTheme`, mount-guarded toggle) — but Reconcil needs a tokenisation pass first, because there is nothing for `.dark` to switch.

Measured (app/ components/ lib/):
- 685 arbitrary hex classes in 94 files — 9 values cover ~95%: `#232D47` (299 border), `#1CEAEA` (brand cyan: focus ring/border, text), `#0A1128` / `#0E182D` / `#0D152A` / `#0B122B` / `#0A1121` / `#111C3D` / `#050F20` (surfaces), `#1B2540` (subtle border/divide), `#A3B2C8` (secondary text)
- 384 `text-white`, 104 `bg-white/5`, ~25 other white/black-alpha overlays
- ~1,350 palette classes, dominated by `text-slate-200/300/400/500` (~635) and status hues `emerald/rose/amber/sky/indigo-300/400` (text) + `-500/10–15` (tint bgs)
- 223 inline hex in 20 files — hand-drawn SVG illustrations/charts (`ActivityOverview`, `reconcile/EmptyStates`, `chart-skeletons`, `logo-loader`, …) and [toast-provider.tsx](recon-frontend/components/toast-provider.tsx)
- shadcn `base-nova` primitives already carry `dark:` variants (6 files) — they work once `.dark` toggles
- Auth/accept-invite pages are already light-styled (white form, `bg-slate-950` brand panel) with explicit classes

Built in 4 phases, each implemented in full in one turn, stop for review between phases, do not batch.

## Agreed decisions
- `next-themes` (new dep — nothing in the stack handles it; same lib as FAR). `attribute="class"`, one provider in the root layout, `forcedTheme="dark"` outside `/dashboard` so auth/invite/loader-preview render exactly as today.
- Tokens are semantic, named by role, defined once in `globals.css` `:root` (light) / `.dark` (current hex values, unchanged) and exposed through `@theme inline`. Dark must be pixel-identical after the refactor — that is the Phase 2 acceptance test.
- No `dark:` variants in feature components. Theme differences live only in tokens.
- Charts/SVG read CSS vars (`fill="var(--surface-raised)"`), not `useTheme` branches — no hydration flash, no JS theme reads.
- Toggle reads `resolvedTheme`, renders pre-mount disabled (FAR `components/shared/theme-toggle.tsx` shape); there is no shadcn theme-toggle in the registry, so it's composed from the installed Base UI `Switch`/`Button`.
- Toast keeps the repo pattern: brand pair from tokens (`var(--surface)` / `var(--brand)`), error stays `#7F1D1D` / `#FCA5A5` per global rule.
- `viewport`: drop the fixed `colorScheme: "dark"`; `themeColor` as a light/dark media pair.
- `defaultTheme="dark"`, `enableSystem={false}` — existing users see no change until they opt in. Toggle is Light/Dark only.
- Light brand accent `#0194A1` (already in repo) for rings, borders, bold text; a darker step (~`#0E7C86`) as `--brand-text` for body-size text to clear 4.5:1.
- Toggle in the dashboard header beside `NotificationsDropdown` ([Header.tsx:54](recon-frontend/components/dashboard/Header.tsx#L54)), Sun / Switch / Moon as in FAR.

## Token map (dark value → token → utility)
```
--surface-base     #050F20   page background          bg-surface-base
--surface          #0A1128   cards, panels            bg-surface
--surface-raised   #0E182D   raised panel / header    bg-surface-raised
--surface-sunken   #0D152A, #0B122B, #0A1121  wells, table rows (collapse to one if visually identical, else -2)
--surface-active   #111C3D   selected row / hover
--line             #232D47   default border           border-line / divide-line
--line-subtle      #1B2540   inner dividers
--text-primary     white     (= --foreground)          text-foreground
--text-secondary   slate-200/300, #A3B2C8              text-secondary-fg
--text-muted       slate-400/500                       text-muted-foreground
--overlay          white/5 (dark) · black/4 (light)    bg-overlay  (+ /10 → bg-overlay-strong)
--brand            #1CEAEA (dark) · #0194A1 (light)    ring-brand, border-brand, bg-brand
--brand-text       #1CEAEA (dark) · ~#0E7C86 (light)   text-brand
--success/--danger/--warning/--info + -tint            emerald/rose/amber/sky-400 text, -500/15 bgs
```
Gradient `from-emerald-400 via-sky-500 to-indigo-500` stays literal (brand gradient, reads on both).

## Conventions
- Matches repo: flat `components/`, `components/ui` for shadcn primitives, toggle → `components/theme-toggle.tsx` (repo has no `components/shared/`; don't introduce it for one file). Provider → `components/theme-provider.tsx` beside `toast-provider.tsx`.
- `cn()` from `lib/utils` for conditional classes.

## Steps

### Step 1 — Tokens + provider + toggle (no visual change)
**Files:** `app/globals.css`, `app/layout.tsx`, `components/theme-provider.tsx` (new), `components/theme-toggle.tsx` (new), `components/dashboard/Header.tsx`, `package.json`
- `npm i next-themes`. Remove `dark` from `<html>` className, add `suppressHydrationWarning`.
- Add every token above to `.dark` with today's hex; `:root` gets placeholder light values = the dark ones for now (so nothing changes even if the toggle is flipped).
- Provider: dark-forced outside `/dashboard`, `defaultTheme="dark"`, no system option.
- Toggle in the header beside notifications; shown for platform admins too (it's per-browser UI state).
**Review checkpoint:** every page identical to `main` in dark; no hydration warning in console; toggle flips `<html class>` and persists across reload; auth page unaffected on a light-OS machine.

### Step 2 — Class codemod to tokens (dark pixel-identical)
**Files:** ~100 component files under `components/` and `app/`
- Scripted, reviewed replacement per the token map (hex classes, `text-white`, `text-slate-*`, `bg-white/*`, status hues). Script lives in scratchpad, not the repo.
- Manual pass for the leftovers the script can't map (one-off hexes like `#2E3A5C`, `#DDDFE2`; context-dependent `text-white` on coloured buttons stays white → `text-primary-foreground` or literal).
- Exclusions: `AuthForm`, `AuthShell`, `AcceptInvite*` (light by design, forced-dark-proof) — verify, don't touch.
**Review checkpoint:** `grep -rE '\[#[0-9a-fA-F]{3,8}\]|text-white|text-slate-' components/dashboard` returns only listed intentional exceptions; side-by-side screenshots of every dashboard route vs `main` show no difference.

### Step 3 — Inline hex: SVG, skeletons, toast
**Files:** the 20 inline-hex files (`ActivityOverview`, `reconcile/EmptyStates`, `NotificationsPageClient`, `HistoryTable`, `AuditLogTable`, `chart-skeletons`, `logo-loader`, `toast-provider`, …)
- Replace hex props with `var(--token)`; illustration-only greys (`#2C3654`, `#3A4568`) get `--illus-1/2` tokens rather than being forced onto UI tokens.
- `logo-loader.module.css` / brand gradients stay literal if they are brand marks.
**Review checkpoint:** zero `"#xxxxxx"` left in those files except listed brand marks; dark still identical.

### Step 4 — Light values
**Files:** `app/globals.css` only (plus any one-off fixes found in review)
- Fill `:root` with the light palette: neutral greys for surfaces (white cards on `slate-50`-ish base, depth via lightness + the card shadow token), `slate-200` lines, `slate-900`/`600`/`500` text, status text at 600/700 for 4.5:1, brand `#0194A1` / brand-text darker step.
- Contrast check every text token pair ≥ 4.5:1.
- Carried over from Steps 2–3: ApexCharts tooltips keep `theme: 'dark'` in JS; in light, re-point its CSS vars (`--apx-tt-bg`, `--apx-tt-border`, …) on `.apexcharts-tooltip.apexcharts-theme-dark` to tokens in `globals.css`. Decide tokens or literal for the decorative chip hues (violet/teal/orange/cyan/red/lime/pink, `slate-500` tints), the `SettingsCustomizeCard` icon-tile gradient, and the white stat-tile icons on 30% gradients.
**Review checkpoint:** walk every dashboard route in light: tables, dialogs, popovers, Select/Calendar/DateRange, toasts, empty states, reconcile flow, report preview; switch theme mid-flow with a dialog open.

## Out of scope
Auth/invite/marketing light-dark variants · a "System" third option in the toggle (unless chosen) · per-user theme persisted server-side · super-admin restyle beyond what the codemod covers.
